/**
 * Month abbreviation to number mapping
 */
const MONTH_MAP: { [key: string]: number } = {
  'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
  'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

/**
 * Get time of day period from hour
 */
export function getTimeOfDay(hour: number): string {
  if (hour < 12) return 'MORNING';
  if (hour < 18) return 'AFTERNOON';
  return 'EVENING';
}

/**
 * Format greeting with day and time of day
 */
export function formatGreeting(date: Date): string {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const timeOfDay = getTimeOfDay(date.getHours());
  return `GOOD ${dayOfWeek} ${timeOfDay}`;
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date, timezone: string = 'UTC'): string {
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const timeString = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  return `${day} ${month} - ${timeString} (${timezone})`;
}

/**
 * Get preview skills for collapsed timeline item
 * Uses showcased skills if available, otherwise extracts from categories
 */
export function getPreviewSkills(
  showcasedSkills?: string[],
  categories?: Record<string, string[] | string | undefined>
): string[] {
  if (showcasedSkills?.length) {
    return showcasedSkills;
  }

  if (!categories) {
    return [];
  }

  return Object.entries(categories)
    .filter(([key]) => key !== 'label')
    .flatMap(([_, values]) => Array.isArray(values) ? values : [values])
    .filter(Boolean)
    .slice(0, 5) as string[];
}

/**
 * Calculate duration between two dates
 */
export function calculateDuration(from?: string, to?: string): string {
  if (!from) return '';

  const parseDate = (dateStr: string): Date => {
    const parts = dateStr.trim().split(' ');
    if (parts.length === 2) {
      const [month, year] = parts;
      return new Date(parseInt(year), MONTH_MAP[month] || 0, 1);
    }
    return new Date();
  };

  const startDate = parseDate(from);
  const endDate = to && to.toLowerCase() !== 'present' ? parseDate(to) : new Date();
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());

  if (months < 1) return '< 1 mo';
  if (months < 12) return `${months} mo${months > 1 ? 's' : ''}`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) return `${years} yr${years > 1 ? 's' : ''}`;
  return `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mo`;
}
