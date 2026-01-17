import { TimelineItem } from '@/lib/types';

interface TimelineDetailsProps {
  accomplishments: string[];
  categories?: TimelineItem['categories'];
}

export default function TimelineDetails({ accomplishments, categories: categoriesData }: TimelineDetailsProps) {
  const { label = 'Skills', ...categories } = categoriesData || {};
  const hasCategories = Object.keys(categories).length > 0;

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
                  <span className="text-gray-500 font-medium">{category}:</span>{' '}
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
