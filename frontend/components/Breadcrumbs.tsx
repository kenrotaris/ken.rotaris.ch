interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  website?: string;
}

/**
 * Breadcrumb Schema.org markup
 * Helps search engines understand page hierarchy
 * Note: Visual breadcrumbs not needed for single-page portfolio,
 * but schema helps SEO
 */
export default function Breadcrumbs({ items, website }: BreadcrumbsProps) {
  const siteUrl = `https://${website || 'ken.rotaris.ch'}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  );
}
