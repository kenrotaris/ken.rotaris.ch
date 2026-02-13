import { MetadataRoute } from 'next';
import { fetchPortfolio } from '@/lib/data';
import { getWebsiteUrl } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const portfolio = await fetchPortfolio();
  const siteUrl = getWebsiteUrl(portfolio.hero?.website, portfolio.hero?.email);

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
  ];
}
