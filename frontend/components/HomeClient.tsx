'use client';

import { useState } from 'react';
import { DEFAULT_THEME } from '@/lib/config';
import Header from '@/components/Header';
import About from '@/components/About';
import Tabs from '@/components/Tabs';
import Footer from '@/components/Footer';
import Background from '@/components/Background';
import { Portfolio } from '@/lib/types';

interface HomeClientProps {
  data: Portfolio;
}

export default function HomeClient({ data }: HomeClientProps) {
  const [isTabsSticky, setIsTabsSticky] = useState(false);

  const accentColor = data.theme?.colors?.accent || DEFAULT_THEME.colors.accent;
  const backgroundColor = data.theme?.colors?.background || accentColor;

  const timezone = data.theme?.timezone || DEFAULT_THEME.timezone || 'UTC';

  return (
    <main className="relative">
      <Background accentColor={backgroundColor} />
      <Header
        email={data.footer?.social?.email || data.hero?.email}
        resumeUrl={data.hero?.resumeUrl}
        hidden={isTabsSticky}
        timezone={timezone}
      />
      <About data={data.hero} />
      <Tabs
        tabs={data.tabs || []}
        onStickyChange={setIsTabsSticky}
      />
      <Footer social={data.footer?.social} />
    </main>
  );
}
