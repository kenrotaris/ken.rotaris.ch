'use client';

import { useState, useEffect, useRef } from 'react';
import { NormalizedTab } from '@/lib/data';
import { useHashNavigation } from '@/hooks/useHashNavigation';
import Timeline from './Timeline';
import { visualEdit, TABS_COLLECTION } from '@/lib/visual-editing';

interface TabsProps {
  tabs: NormalizedTab[];
  onStickyChange: (sticky: boolean) => void;
}

export default function Tabs({ tabs, onStickyChange }: TabsProps) {
  const tabIds = tabs.map(tab => tab.id);
  const [activeId, setActiveId] = useHashNavigation(tabIds, tabs?.[0]?.id);
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to tabs section when hash changes
  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => {
        tabsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [activeId]);

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

  const handleTabClick = (tabId: string) => {
    setActiveId(tabId);
    // Update URL hash without triggering a scroll
    window.history.pushState(null, '', `#${tabId}`);
  };

  return (
    <section className="relative pb-12" ref={tabsContainerRef} aria-label="Professional Experience">
      <div ref={sentinelRef} className="absolute top-0 left-0 right-0 h-px -translate-y-px" />

      {/* Tab bar - integrates visually with timeline */}
      <nav
        role="tablist"
        aria-label="Experience categories"
        className={`sticky top-0 z-[51] transition-all duration-300 w-full ${isSticky ? 'bg-black/95 backdrop-blur-md py-4 shadow-lg' : 'py-3'
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
                      id={`tab-${tab.id}`}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`tabpanel-${tab.id}`}
                      onClick={() => handleTabClick(tab.id)}
                      data-directus={visualEdit(
                        tab.directusId
                          ? { collection: TABS_COLLECTION, item: tab.directusId }
                          : null
                      ).field('label')}
                      className={`relative px-4 md:px-5 py-2 text-sm font-medium flex-shrink-0 transition-all duration-300 whitespace-nowrap ${isActive
                        ? 'text-white scale-105'
                        : 'text-gray-400 hover:text-gray-200'
                        }`}
                      style={isActive ? { textShadow: '0 0 12px var(--color-accent)' } : {}}
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
      </nav>

      {/* Timeline - visually connected to tabs */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeId}`}
        aria-labelledby={`tab-${activeId}`}
        className="max-w-7xl mx-auto px-6"
      >
        <Timeline items={items} key={activeId} />
      </div>
    </section>
  );
}
