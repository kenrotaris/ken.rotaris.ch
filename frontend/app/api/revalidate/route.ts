import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Revalidation webhook for Directus.
 *
 * Point a Directus flow at POST /api/revalidate on every create/update/delete
 * of portfolio_settings, portfolio_tabs or portfolio_items, with the shared
 * secret in an `x-revalidate-secret` header. Without the secret this is a 401,
 * so the endpoint cannot be used to hammer the origin.
 */
export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return false;

  const provided =
    request.headers.get('x-revalidate-secret') ??
    request.nextUrl.searchParams.get('secret') ??
    '';

  // Compare over a fixed length so the check is not trivially timing-readable.
  if (provided.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(request: NextRequest) {
  if (!process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'REVALIDATE_SECRET is not configured' }, { status: 503 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 'layout' also covers the metadata, sitemap and robots routes, which all
  // read the same portfolio data.
  revalidatePath('/', 'layout');
  revalidatePath('/resume', 'page');

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
