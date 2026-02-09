import { Portfolio } from '@/lib/types';

interface StructuredDataProps {
  portfolio: Portfolio;
}

/**
 * JSON-LD Structured Data for SEO and AI comprehension
 * Implements Schema.org Person and WebSite schemas
 */
export default function StructuredData({ portfolio }: StructuredDataProps) {
  const { hero, metadata, footer } = portfolio;
  const website = hero?.website || 'ken.rotaris.ch';
  const siteUrl = `https://${website}`;

  // Person schema - defines who you are
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: hero?.name || metadata?.author || 'Ken Rotaris',
    jobTitle: hero?.title || 'Full Stack Developer & DevOps Engineer',
    description: hero?.bio,
    email: hero?.email || footer?.social?.email,
    url: siteUrl,
    sameAs: [
      footer?.social?.linkedin,
      footer?.social?.github,
    ].filter(Boolean),
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
  };

  // Website schema - defines what your site is
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: metadata?.title || 'Ken Rotaris Portfolio',
    description: metadata?.description,
    author: {
      '@id': `${siteUrl}/#person`,
    },
  };

  // ProfilePage schema - specialized for portfolio/resume sites
  const profilePageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${siteUrl}/#profilepage`,
    mainEntity: {
      '@id': `${siteUrl}/#person`,
    },
    url: siteUrl,
    name: metadata?.title,
    description: metadata?.description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />
    </>
  );
}
