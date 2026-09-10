'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Hero } from '@/lib/types';
import { visualEdit, SETTINGS_COLLECTION } from '@/lib/visual-editing';

const SCROLL_INDICATOR_THRESHOLD = 100;

interface AboutProps {
  data?: Hero;
  /** Directus settings row id; enables click-to-edit when present. */
  settingsId?: string;
}

export default function About({ data, settingsId }: AboutProps) {
  const [showScroll, setShowScroll] = useState(true);
  const edit = visualEdit(settingsId ? { collection: SETTINGS_COLLECTION, item: settingsId } : null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY < SCROLL_INDICATOR_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't render if no hero data
  if (!data) {
    return null;
  }

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 relative">
      <div className="max-w-4xl mx-auto text-center px-6 pb-16">
        <div className="mb-8 flex justify-center">
          <div className="w-40 h-40 md:w-52 md:h-52 relative">
            <Image
              src="/images/ken-circle.png"
              alt={data.name || 'Profile'}
              fill
              sizes="(max-width: 768px) 160px, 208px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-4">
          {data.name && (
            <h1
              className="text-3xl md:text-6xl font-bold tracking-tight text-white"
              data-directus={edit.field('hero_name')}
            >
              {data.name}
            </h1>
          )}
          {data.title && (
            <h2
              className="text-base md:text-xl text-accent-text font-light tracking-wide"
              data-directus={edit.field('hero_title')}
            >
              {data.title}
            </h2>
          )}

          {data.bio && (
            <p
              className="max-w-2xl mx-auto text-sm md:text-base text-gray-400 leading-relaxed pb-8 md:pb-0"
              data-directus={edit.field('hero_bio')}
            >
              {data.bio}
            </p>
          )}
        </div>
      </div>

      {showScroll && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0 text-gray-400 cursor-pointer hover:text-accent-text transition-colors animate-bounce"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <ChevronDown className="w-5 h-5 -mb-3" strokeWidth={1} />
          <ChevronDown className="w-5 h-5 -mb-3 opacity-60" strokeWidth={1} />
          <ChevronDown className="w-5 h-5 opacity-30" strokeWidth={1} />
        </div>
      )}
    </section>
  );
}
