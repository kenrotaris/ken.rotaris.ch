'use client';

import { useState } from 'react';
import { TimelineItem as TimelineItemType } from '@/lib/types';
import TimelineItem from './TimelineItem';

// Timeline vertical line positioning
const TIMELINE_LINE_LEFT_MOBILE = 'left-6';
const TIMELINE_LINE_LEFT_DESKTOP = 'left-[200px]';

interface TimelineProps {
  items: TimelineItemType[];
}

export default function Timeline({ items }: TimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative glass rounded-2xl p-3 md:p-6 glass-border">
        <div
          className={`absolute ${TIMELINE_LINE_LEFT_MOBILE} md:${TIMELINE_LINE_LEFT_DESKTOP} -translate-x-1/2 top-0 bottom-0 w-px`}
          style={{
            background: 'linear-gradient(to bottom, var(--color-accent-20), var(--color-accent-30), var(--color-accent-20))'
          }}
        />

        <div className="space-y-0">
          {items.map((item, index) => (
            <TimelineItem
              key={`${item.organization.name}-${item.role}`}
              item={item}
              index={index}
              expanded={expandedIndex === index}
              onToggle={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
