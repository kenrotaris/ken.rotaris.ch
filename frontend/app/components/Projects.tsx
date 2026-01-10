import { TimelineItem as TimelineItemType } from '@/lib/types';
import TimelineItem from './TimelineItem';

interface ProjectsProps {
  items: TimelineItemType[];
}

export default function Projects({ items }: ProjectsProps) {
  return (
    <div>
      {items.map((item, index) => (
        <TimelineItem key={index} item={item} linkLabel="View Project →" />
      ))}
    </div>
  );
}
