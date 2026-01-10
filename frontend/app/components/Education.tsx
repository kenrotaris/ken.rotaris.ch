import { TimelineItem as TimelineItemType } from '@/lib/types';
import TimelineItem from './TimelineItem';

interface EducationProps {
  items: TimelineItemType[];
}

export default function Education({ items }: EducationProps) {
  return (
    <div>
      {items.map((item, index) => (
        <TimelineItem key={index} item={item} linkLabel="View Certificate →" />
      ))}
    </div>
  );
}
