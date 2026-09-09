'use client';

import { useState } from 'react';
import { DEFAULT_THEME } from '@/lib/config';
import Header from '@/components/Header';
import About from '@/components/About';
import Tabs from '@/components/Tabs';
import Footer from '@/components/Footer';
import Background from '@/components/background/Background';
import VisualEditing from '@/components/VisualEditing';
import { NormalizedPortfolio } from '@/lib/data';

interface HomeClientProps {
  data: NormalizedPortfolio;
  /** Directus base URL, passed from the server so no NEXT_PUBLIC_ var is needed. */
  directusUrl?: string;
}

export default function HomeClient({ data, directusUrl }: HomeClientProps) {
  const [isTabsSticky, setIsTabsSticky] = useState(false);

  const accentColor = data.theme?.colors?.accent || DEFAULT_THEME.colors.accent;
  const backgroundColor = data.theme?.colors?.background || accentColor;

  const timezone = data.theme?.timezone || DEFAULT_THEME.timezone || 'UTC';

  return (
    <>
      <VisualEditing directusUrl={directusUrl} />
      <Background accentColor={backgroundColor} />
      <main className="relative z-0">
        <Header
          email={data.footer?.social?.email || data.hero?.email}
          website={data.hero?.website}
          showResume={!!data.resume}
          hidden={isTabsSticky}
          timezone={timezone}
        />
        <About data={data.hero} settingsId={data.directusId} />
        <Tabs
          tabs={data.tabs || []}
          onStickyChange={setIsTabsSticky}
        />
        <Footer social={data.footer?.social} settingsId={data.directusId} />
      </main>
    </>
  );
}
