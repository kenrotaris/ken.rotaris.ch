import Image from 'next/image';
import { TimelineItem as TimelineItemType } from '@/lib/types';

interface TimelineItemProps {
  item: TimelineItemType;
  linkLabel?: string;
}

export default function TimelineItem({ item, linkLabel = 'Learn More →' }: TimelineItemProps) {
  return (
    <div className="flex gap-6 mb-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-teal-accent/50 transition-all">
      <div className="flex-shrink-0">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center">
          <Image
            src={item.image}
            alt={item.title}
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
      </div>

      <div className="flex-1">
        <div className="mb-3">
          <p className="text-sm text-teal-accent mb-1">{item.year}</p>
          <h3 className="text-xl font-semibold text-white">{item.title}</h3>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 text-xs bg-gray-900 text-teal-accent border border-gray-700 rounded">
              {tag}
            </span>
          ))}
        </div>

        {item.link && (
          <div className="mt-3">
            <a
              href={item.link}
              className="inline-block text-sm text-teal-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkLabel}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
