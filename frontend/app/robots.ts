import { MetadataRoute } from 'next';
import { fetchPortfolio } from '@/lib/data';

/**
 * Dynamic robots.txt generation
 * Controls crawler access and sitemap location
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const portfolio = await fetchPortfolio();
  const website = portfolio.hero?.website || 'ken.rotaris.ch';
  const siteUrl = `https://${website}`;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',          // Don't crawl API routes
          '/_next/',        // Don't crawl Next.js internals
        ],
      },
      // AI-specific crawlers (optional: control AI training access)
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'CCBot',
        allow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
