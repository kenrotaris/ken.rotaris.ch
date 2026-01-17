import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { fetchPortfolio } from "@/lib/api";
import { DEFAULT_THEME, DEFAULT_PORTFOLIO } from "@/lib/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export async function generateMetadata(): Promise<Metadata> {
  const portfolio = await fetchPortfolio();
  const metadata = portfolio.metadata || DEFAULT_PORTFOLIO.metadata!;

  return {
    title: metadata.title,
    description: metadata.description,
    authors: metadata.author ? [{ name: metadata.author }] : undefined,
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
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
        style={{
          "--color-accent": accentColor,
          "--color-accent-20": `color-mix(in srgb, ${accentColor} 20%, transparent)`,
          "--color-accent-30": `color-mix(in srgb, ${accentColor} 30%, transparent)`,
        } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
