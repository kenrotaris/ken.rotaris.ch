import { MetadataRoute } from 'next';
import { fetchPortfolio } from '@/lib/data';
import { getWebsiteUrl } from '@/lib/utils';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const portfolio = await fetchPortfolio();
  const siteUrl = getWebsiteUrl(portfolio.hero?.website, portfolio.hero?.email);

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/resume', '/_next/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
