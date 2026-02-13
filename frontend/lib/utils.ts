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
 * Add plural suffix to unit based on count
 */
function pluralize(count: number, unit: string): string {
  return `${count} ${unit}${count > 1 ? 's' : ''}`;
}

/**
 * Parse date string in format "Jan 2020" or "2020"
 */
function parseDate(dateStr?: string | number): Date {
  const str = String(dateStr ?? '').trim();
  if (!str) return new Date();

  const parts = str.split(' ');
  if (parts.length === 2) {
    const [month, year] = parts;
    return new Date(parseInt(year), MONTH_MAP[month] || 0, 1);
  }
  if (parts.length === 1 && !isNaN(parseInt(parts[0]))) {
    return new Date(parseInt(parts[0]), 0, 1);
  }
  return new Date();
}

/**
 * Calculate duration between two dates
 */
export function calculateDuration(from?: string | number, to?: string | number): string {
  const fromStr = String(from ?? '').trim();
  if (!fromStr) return '';

  const startDate = parseDate(from);
  const toStr = String(to ?? '').trim();
  const endDate = toStr && toStr.toLowerCase() !== 'present' ? parseDate(to) : new Date();

  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());

  if (months < 1) return '< 1 mo';
  if (months < 12) return pluralize(months, 'mo');

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) return pluralize(years, 'yr');
  return `${pluralize(years, 'yr')} ${remainingMonths} mo`;
}

/**
 * Get website URL with https:// prefix
 * Falls back to email domain or default if not provided
 */
export function getWebsiteUrl(website?: string, email?: string): string {
  if (website) return website.startsWith('http') ? website : `https://${website}`;
  if (email) return `https://${email.split('@')[1]}`;
  return 'https://ken.rotaris.ch';
}

/**
 * Generate a mailto link with encoded subject and body
 */
export function generateContactLink(email: string, website?: string): string {
  const websiteName = website || 'the website';
  const subject = encodeURIComponent(`Inquiry: Contact via ${websiteName}`);
  const body = encodeURIComponent('Hi Ken,\n\nI came across your website and would like to get in touch regarding:\n\n- [project/role/question]\n\nBest,\n[Your name]');

  return `mailto:${email}?subject=${subject}&body=${body}`;
}
