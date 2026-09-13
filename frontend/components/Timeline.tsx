'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TimelineItem as TimelineItemType } from '@/lib/types';
import { NormalizedTimelineItem } from '@/lib/data';
import { calculateDuration, getPreviewSkills } from '@/lib/utils';
import { visualEdit, ITEMS_COLLECTION } from '@/lib/visual-editing';

// Timeline positioning constants
const TIMELINE_LINE_LEFT_MOBILE = 'left-6';
const TIMELINE_LINE_LEFT_DESKTOP = 'left-[200px]';
const TIMELINE_DOT_LEFT_MOBILE = 'left-3';
const TIMELINE_DOT_LEFT_DESKTOP = 'left-[176px]';

// ============================================================================
// TimelineDetails - Expanded Content
// ============================================================================

interface TimelineDetailsProps {
  accomplishments?: string[];
  categories?: TimelineItemType['categories'];
}

function TimelineDetails({ accomplishments, categories: categoriesData }: TimelineDetailsProps) {
  const { label = 'Skills', ...categories } = categoriesData || {};
  const hasCategories = Object.keys(categories).length > 0;
  const isSingleGroup = Object.keys(categories).length === 1;

  return (
    <div className="pr-4 pb-6 pt-4">
      {accomplishments && accomplishments.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Key Accomplishments
          </h4>
          <ul className="space-y-2.5 pl-4">
            {accomplishments.map((accomplishment, idx) => (
              <li key={idx} className="text-sm text-gray-300 leading-relaxed pl-4 relative before:content-['▸'] before:absolute before:left-0 before:text-teal-accent/60">
                {accomplishment}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasCategories && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            {label}
          </h4>
          <div className="space-y-1.5">
            {Object.entries(categories).map(([category, items]) => (
              Array.isArray(items) && (
                <div key={category} className="text-xs">
                  {/* A single group needs no name, the heading already says it. */}
                  {!isSingleGroup && (
                    <>
                      <span className="text-gray-400 font-medium">{category}:</span>{' '}
                    </>
                  )}
                  <span className="text-gray-400">{items.join(', ')}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TimelineItem - Individual Experience Card
// ============================================================================

interface TimelineItemProps {
  item: NormalizedTimelineItem;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}

function TimelineItem({ item, index, expanded, onToggle }: TimelineItemProps) {
  // Repeaters (accomplishments, categories) cannot be clicked element by
  // element, so the card as a whole opens the row in a drawer.
  const edit = visualEdit(
    item.directusId ? { collection: ITEMS_COLLECTION, item: item.directusId } : null
  );
  const duration = calculateDuration(item.dates?.from, item.dates?.to);
  const dateRange = item.dates?.from && item.dates?.to
    ? `${item.dates.from} – ${item.dates.to}`
    : item.dates?.from || '';
  const previewSkills = getPreviewSkills(item.showcasedSkills, item.categories);

  // Determine if this is a simple item (no accomplishments, only skills)
  const hasAccomplishments = item.accomplishments && item.accomplishments.length > 0;
  const isSimpleItem = !hasAccomplishments;

  // Wrapper component that's either a button (expandable) or div (simple)
  const Wrapper = isSimpleItem ? 'div' : 'button';
  const wrapperProps = isSimpleItem
    ? { className: "w-full text-left" }
    : {
      onClick: onToggle,
      className: "w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-accent/50 rounded-lg transition-all",
      'aria-expanded': expanded,
      'aria-controls': `timeline-${index}`,
    };

  return (
    <article
      className="relative"
      itemScope
      itemType="https://schema.org/WorkExperience"
      data-directus={edit.item('drawer')}
    >
      {/* Timeline dot */}
      <div className={`absolute ${TIMELINE_DOT_LEFT_MOBILE} md:${TIMELINE_DOT_LEFT_DESKTOP} top-6 -translate-x-1/2 z-10`}>
        <div
          className={`rounded-full bg-teal-accent transition-all ${expanded || isSimpleItem ? 'w-3 h-3' : 'w-2 h-2'
            }`}
          style={
            expanded || isSimpleItem
              ? { boxShadow: '0 0 12px 4px var(--color-accent)' }
              : { boxShadow: '0 0 4px 1px var(--color-accent)' }
          }
        />
      </div>

      <Wrapper {...wrapperProps}>
        <div className={`flex flex-col md:flex-row py-4 md:py-6 transition-all pl-14 md:pl-0 pr-4 md:pr-0 ${expanded && !isSimpleItem
          ? 'glass-strong rounded-t-lg'
          : isSimpleItem
            ? 'glass rounded-lg'
            : 'glass glass-hover rounded-lg'
          }`}>
          {/* Date column (desktop only) */}
          <div className="hidden md:flex flex-col gap-1 items-start w-48 shrink-0 text-left pl-4 pr-4">
            {duration && (
              <div className="text-xs font-mono text-accent-text uppercase tracking-wide">
                {duration}
              </div>
            )}
            <div className="text-sm font-semibold text-gray-400">
              {dateRange}
            </div>
          </div>

          {/* Content column */}
          <div className="flex-1 min-w-0 md:pl-8">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 shrink-0">
                <Image
                  src={item.logo}
                  alt={item.company}
                  width={40}
                  height={40}
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-base md:text-lg font-bold text-white mb-0.5"
                  data-directus={edit.field('role')}
                >
                  {item.role}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span className="font-medium" data-directus={edit.field('company')}>
                    {item.company}
                  </span>
                  {item.location && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">{item.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Date range (mobile only) */}
            <div className="md:hidden text-xs text-gray-400 mb-2 flex items-center gap-2">
              {duration && (
                <span className="font-mono text-accent-text">{duration}</span>
              )}
              <span>{dateRange}</span>
            </div>

            {/* Summary */}
            <p
              className="text-sm text-gray-300 leading-relaxed mb-3"
              data-directus={edit.field('summary')}
            >
              {item.summary}
            </p>

            {/* Showcased skills (when collapsed or simple) */}
            {(!expanded || isSimpleItem) && previewSkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] md:text-xs text-gray-400">
                {previewSkills.map((skill, idx) => (
                  <div key={idx} className="flex items-center">
                    <span>{skill}</span>
                    {idx < previewSkills.length - 1 && (
                      <span className="ml-2 text-gray-500">•</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Wrapper>

      {/* Expanded details: 0fr -> 1fr animates to the content's natural height
          in CSS, so no animation library is shipped for one accordion. */}
      {!isSimpleItem && (
        <div
          id={`timeline-${index}`}
          aria-hidden={!expanded}
          className="grid overflow-hidden motion-safe:transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
        >
          <div className="min-h-0">
            <div className="glass-strong rounded-b-lg ml-14 md:ml-0 -mt-2">
              <div className="md:ml-48">
                <TimelineDetails
                  accomplishments={item.accomplishments}
                  categories={item.categories}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// ============================================================================
// Timeline - Container Component
// ============================================================================

interface TimelineProps {
  items: NormalizedTimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  // -1 = everything collapsed. Cards start closed so the list is scannable;
  // accomplishments appear on click.
  const [expandedIndex, setExpandedIndex] = useState<number>(-1);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative glass rounded-2xl p-3 md:p-6 glass-border">
        {/* Vertical timeline line */}
        <div
          className={`absolute ${TIMELINE_LINE_LEFT_MOBILE} md:${TIMELINE_LINE_LEFT_DESKTOP} -translate-x-1/2 top-0 bottom-0 w-px`}
          style={{
            background: 'linear-gradient(to bottom, var(--color-accent-20), var(--color-accent-30), var(--color-accent-20))'
          }}
        />

        {/* Timeline items */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <TimelineItem
              key={`${item.company}-${item.role}`}
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
