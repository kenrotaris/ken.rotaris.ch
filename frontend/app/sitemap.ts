import { MetadataRoute } from 'next';
import { fetchPortfolio } from '@/lib/data';

/**
 * Dynamic sitemap generation
 * Includes all indexable pages with proper priority and change frequency
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const portfolio = await fetchPortfolio();
  const website = portfolio.hero?.website || 'ken.rotaris.ch';
  const siteUrl = `https://${website}`;

  // Base pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/resume`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Add tab-based URLs (for deep linking to sections)
  if (portfolio.tabs) {
    portfolio.tabs.forEach((tab) => {
      routes.push({
        url: `${siteUrl}/#${tab.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  }

  return routes;
}
