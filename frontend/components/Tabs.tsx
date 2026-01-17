'use client';

import { useState, useEffect, useRef } from 'react';
import { Tab } from '@/lib/types';
import Timeline from './timeline/Timeline';

interface TabsProps {
  tabs: Tab[];
  onStickyChange: (sticky: boolean) => void;
}

export default function Tabs({ tabs, onStickyChange }: TabsProps) {
  const [activeId, setActiveId] = useState<string>(tabs?.[0]?.id || '');
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const sticky = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setIsSticky(sticky);
        onStickyChange(sticky);
      },
      { threshold: [1] }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onStickyChange]);

  if (!tabs || tabs.length === 0) {
    return null;
  }

  const activeTab = tabs.find(tab => tab.id === activeId);
  const items = activeTab?.items || [];

  return (
    <div className="relative pb-12">
      <div ref={sentinelRef} className="absolute top-0 left-0 right-0 h-px -translate-y-px" />

      {/* Tab bar - integrates visually with timeline */}
      <div
        className={`sticky top-0 z-[51] transition-all duration-300 w-full ${
          isSticky ? 'bg-black/95 backdrop-blur-md py-4 shadow-lg' : 'py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="relative">
            <div className="overflow-x-auto scroll-smooth scrollbar-hide relative">
              <div className="flex gap-2 items-center relative z-10">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeId;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveId(tab.id)}
                      className={`relative px-4 md:px-5 py-2 text-sm font-medium rounded-full flex-shrink-0 transition-all duration-200 whitespace-nowrap ${isActive
                        ? 'text-white bg-teal-accent/20 border border-teal-accent/40'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Fade indicators for scroll */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black to-transparent md:hidden z-0" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black to-transparent md:hidden z-0" />
          </div>
        </div>
      </div>

      {/* Timeline - visually connected to tabs */}
      <div className="max-w-7xl mx-auto px-6">
        <Timeline items={items} key={activeId} />
      </div>
    </div>
  );
}
