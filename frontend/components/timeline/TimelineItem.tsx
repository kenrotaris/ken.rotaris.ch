import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { TimelineItem as TimelineItemType } from '@/lib/types';
import { calculateDuration, getPreviewSkills } from '@/lib/utils';
import TimelineDetails from './TimelineDetails';

// Timeline dot positioning (aligns with timeline vertical line)
const TIMELINE_DOT_LEFT_MOBILE = 'left-3';
const TIMELINE_DOT_LEFT_DESKTOP = 'left-[176px]';

interface TimelineItemProps {
  item: TimelineItemType;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}

export default function TimelineItem({ item, index, expanded, onToggle }: TimelineItemProps) {
  const duration = calculateDuration(item.dates?.from, item.dates?.to);
  const dateRange = item.dates?.from && item.dates?.to
    ? `${item.dates.from} – ${item.dates.to}`
    : item.dates?.from || '';
  const previewSkills = getPreviewSkills(item.showcasedSkills, item.categories);

  return (
    <div className="relative">
      <div className={`absolute ${TIMELINE_DOT_LEFT_MOBILE} md:${TIMELINE_DOT_LEFT_DESKTOP} top-6 -translate-x-1/2 z-10`}>
        <div
          className={`rounded-full bg-teal-accent transition-all ${
            expanded
              ? 'w-3 h-3'
              : 'w-2 h-2'
          }`}
          style={
            expanded
              ? { boxShadow: '0 0 12px 4px var(--color-accent)' }
              : { boxShadow: '0 0 4px 1px var(--color-accent)' }
          }
        />
      </div>

      <button
        onClick={onToggle}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-accent/50 rounded-lg transition-all"
        aria-expanded={expanded}
        aria-controls={`timeline-${index}`}
      >
        <div className={`flex flex-col md:flex-row py-4 md:py-6 transition-all rounded-lg pl-14 md:pl-0 pr-4 md:pr-0 ${expanded
          ? 'glass-strong'
          : 'glass glass-hover'
          }`}>
          <div className="hidden md:flex flex-col gap-1 items-start w-48 shrink-0 text-left pl-4 pr-4">
            {duration && (
              <div className="text-xs font-mono text-teal-accent uppercase tracking-wide">
                {duration}
              </div>
            )}
            <div className="text-sm font-semibold text-gray-500">
              {dateRange}
            </div>
          </div>

          <div className="flex-1 min-w-0 md:pl-8">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 shrink-0">
                <Image
                  src={item.organization.logo}
                  alt={item.organization.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-white mb-0.5">
                  {item.role}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span className="font-medium">{item.organization.name}</span>
                  {item.organization.location && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-500">{item.organization.location}</span>
                    </>
                  )}
                </div>
                {/* Content moved to below header row */}
              </div>
            </div>

            <div className="md:hidden flex items-center gap-2 mt-3 mb-3 text-xs">
              {duration && <span className="font-mono text-teal-accent whitespace-nowrap">{duration}</span>}
              {duration && dateRange && <span className="text-gray-600">•</span>}
              <span className="text-gray-500">{dateRange}</span>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              {item.summary}
            </p>

            {!expanded && previewSkills.length > 0 && (
              <div className="text-xs text-gray-500">
                {previewSkills.join(' • ')}
              </div>
            )}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={`timeline-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col md:flex-row pl-14 md:pl-0">
              <div className="hidden md:block w-48 shrink-0 pl-4 pr-4" />
              <div className="flex-1 min-w-0 md:pl-8">
                <TimelineDetails
                  accomplishments={item.accomplishments}
                  categories={item.categories}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
