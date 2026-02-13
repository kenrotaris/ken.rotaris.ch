import { Portfolio } from '@/lib/types';
import { getWebsiteUrl } from '@/lib/utils';

interface StructuredDataProps {
  portfolio: Portfolio;
}

// Helper to render a JSON-LD schema script tag
const Schema = ({ data }: { data: object }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);

/**
 * JSON-LD Structured Data for SEO and AI comprehension
 * Implements Schema.org Person, WebSite, and ProfilePage schemas
 */
export default function StructuredData({ portfolio }: StructuredDataProps) {
  const { hero, metadata, footer } = portfolio;
  const siteUrl = getWebsiteUrl(hero?.website, hero?.email || footer?.social?.email);

  const schemas = [
    // Person schema
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: hero?.name || metadata?.author || 'Ken Rotaris',
      jobTitle: hero?.title || 'Full Stack Developer & DevOps Engineer',
      description: hero?.bio,
      email: hero?.email || footer?.social?.email,
      url: siteUrl,
      sameAs: [footer?.social?.linkedin, footer?.social?.github].filter(Boolean),
      knowsAbout: [
        'Software Development',
        'DevOps',
        'Backend Development',
        'Frontend Development',
        'Kubernetes',
        'Docker',
        'Java',
        'Spring Framework',
        'CI/CD',
        'Cloud Infrastructure',
      ],
    },
    // WebSite schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: metadata?.title || 'Ken Rotaris Portfolio',
      description: metadata?.description,
      author: { '@id': `${siteUrl}/#person` },
    },
    // ProfilePage schema
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      '@id': `${siteUrl}/#profilepage`,
      mainEntity: { '@id': `${siteUrl}/#person` },
      url: siteUrl,
      name: metadata?.title,
      description: metadata?.description,
    },
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <Schema key={i} data={schema} />
      ))}
    </>
  );
}
