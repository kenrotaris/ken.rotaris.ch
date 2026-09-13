import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';
import { RateLimiterMemory } from 'rate-limiter-flexible';

/**
 * Revalidation webhook for Directus.
 *
 * Point a Directus flow at POST /api/revalidate on every create/update/delete
 * of portfolio_settings, portfolio_tabs or portfolio_items, with the shared
 * secret in an `x-revalidate-secret` header.
 */
export const dynamic = 'force-dynamic';

/**
 * Five wrong secrets from one IP and it is locked out for fifteen minutes,
 * so the secret cannot be guessed by volume. In-memory is enough: there is a
 * single replica, and a restart clearing the counters is not worth a Redis.
 */
const failures = new RateLimiterMemory({ points: 5, duration: 900, blockDuration: 900 });

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  // Left-most entry is the original client; the rest are proxies.
  return forwarded?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
}

/** Constant-time compare, so the secret cannot be recovered byte by byte. */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch, which would itself leak length.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json({ error: 'REVALIDATE_SECRET is not configured' }, { status: 503 });
  }

  const ip = clientIp(request);
  const seen = await failures.get(ip);
  if (seen && seen.consumedPoints >= 5) {
    return NextResponse.json(
      { error: 'too many attempts' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(seen.msBeforeNext / 1000)) } }
    );
  }

  const provided =
    request.headers.get('x-revalidate-secret') ??
    request.nextUrl.searchParams.get('secret') ??
    '';

  if (!secretMatches(provided, expected)) {
    await failures.consume(ip).catch(() => undefined);
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // A correct secret clears the strike count for that caller.
  await failures.delete(ip);

  // 'layout' also covers the metadata, sitemap and robots routes, which all
  // read the same portfolio data.
  revalidatePath('/', 'layout');

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
