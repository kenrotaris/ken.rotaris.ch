import { headers } from 'next/headers';
import { Portfolio } from './types';

/**
 * Derives the base URL from request headers.
 * Respects x-forwarded-proto set by Traefik for HTTPS correctness.
 */
export async function getBaseUrl(): Promise<string> {
  const headersList = await headers();

  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const host = headersList.get('host');

  if (!host) {
    throw new Error('Unable to determine host from request headers');
  }

  return `${protocol}://${host}`;
}

export async function fetchPortfolio(): Promise<Portfolio> {
  const baseUrl = await getBaseUrl();
  const apiUrl = `${baseUrl}/api/portfolio`;

  const res = await fetch(apiUrl, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch portfolio: ${res.statusText}`);
  }

  return res.json();
}
