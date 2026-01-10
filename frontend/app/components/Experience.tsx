import { TimelineItem as TimelineItemType } from '@/lib/types';
import TimelineItem from './TimelineItem';

interface ExperienceProps {
  items: TimelineItemType[];
}

export default function Experience({ items }: ExperienceProps) {
  return (
    <div>
      {items.map((item, index) => (
        <TimelineItem key={index} item={item} linkLabel="Visit Company →" />
      ))}
    </div>
  );
}
