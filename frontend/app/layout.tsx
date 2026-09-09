import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { fetchPortfolio } from "@/lib/data";
import { DEFAULT_THEME, DEFAULT_PORTFOLIO } from "@/lib/config";
import { getWebsiteUrl } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export async function generateMetadata(): Promise<Metadata> {
  const portfolio = await fetchPortfolio();
  const metadata = portfolio.metadata || DEFAULT_PORTFOLIO.metadata!;
  const hero = portfolio.hero;
  const siteUrl = getWebsiteUrl(hero?.website, hero?.email);

  return {
    title: metadata.title,
    description: metadata.description,
    authors: metadata.author ? [{ name: metadata.author }] : undefined,
    keywords: [
      'Full Stack Developer',
      'DevOps Engineer',
      'Software Engineer',
      'Java Developer',
      'Kubernetes',
      'Docker',
      'CI/CD',
      'Backend Development',
      'Frontend Development',
    ],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      title: metadata.title,
      description: metadata.description,
      siteName: metadata.title,
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: siteUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const portfolio = await fetchPortfolio();
  const accentColor = portfolio.theme?.colors?.accent || DEFAULT_THEME.colors.accent;

  return (
    <html lang="en" style={{ backgroundColor: '#000000' }}>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
        style={{
          "--color-accent": accentColor,
          "--color-accent-20": `color-mix(in srgb, ${accentColor} 20%, transparent)`,
          "--color-accent-30": `color-mix(in srgb, ${accentColor} 30%, transparent)`,
          // Text-safe tint of the accent: the raw value fails WCAG AA on black.
          "--color-accent-text": `color-mix(in srgb, ${accentColor} 62%, white)`,
        } as React.CSSProperties}
      >
        {/* Black background at lowest z-index - fog renders on top of this */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -100,
            pointerEvents: 'none',
            backgroundColor: '#000000'
          }}
        />
        {children}
      </body>
    </html>
  );
}
