/**
 * Directus content source.
 *
 * Maps the collections declared in scripts/directus-schema.mjs onto the same
 * `Portfolio` shape the YAML loader produces, so everything downstream
 * (normalization and structured data) is unchanged. When Directus is not
 * configured or unreachable this returns null and the caller falls back to the
 * YAML on disk.
 */

import { Portfolio, Tab, TimelineItem } from './types';

const DIRECTUS_URL = (process.env.DIRECTUS_URL ?? '').replace(/\/+$/, '');
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN ?? '';

/**
 * How long a rendered page may serve stale Directus content, in seconds.
 * Next's segment config cannot read this through an import, so `app/page.tsx`
 * repeats the literal, so keep the two in sync.
 */
export const DIRECTUS_REVALIDATE = 300;

export function isDirectusConfigured(): boolean {
  return Boolean(DIRECTUS_URL && DIRECTUS_TOKEN);
}

// ---------------------------------------------------------------------------
// Row shapes (only the fields this module reads)
// ---------------------------------------------------------------------------

interface RepeaterText { text?: string }
interface RepeaterCategory { category?: string; skills?: string }

interface SettingsRow {
  id?: string;
  hero_name?: string; hero_title?: string; hero_bio?: string;
  hero_email?: string; hero_website?: string; hero_resume_url?: string;
  meta_title?: string; meta_description?: string; meta_author?: string;
  theme_accent?: string; theme_background?: string; theme_timezone?: string;
  social_linkedin?: string; social_github?: string;
  social_email?: string; social_owner_name?: string;
}

interface TabRow { id: string; slug: string; label: string }

interface ItemRow {
  id?: string;
  tab?: string | null;
  role?: string; company?: string; company_description?: string;
  location?: string; link?: string;
  logo_file?: string | null; logo_path?: string;
  date_from?: string; date_to?: string;
  summary?: string;
  showcased_skills?: string;
  accomplishments?: RepeaterText[];
  categories_label?: string;
  categories?: RepeaterCategory[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** "Java, Spring,  Quarkus" -> ["Java", "Spring", "Quarkus"] */
function splitList(value?: string): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}


/** Repeater rows -> the plain string arrays the rest of the app expects. */
function repeaterText(rows?: RepeaterText[]): string[] {
  return (rows ?? []).map((r) => r.text?.trim()).filter((s): s is string => Boolean(s));
}

function assetUrl(id?: string | null): string | undefined {
  return id ? `${DIRECTUS_URL}/assets/${id}` : undefined;
}

function mapCategories(row: ItemRow): TimelineItem['categories'] | undefined {
  const entries = (row.categories ?? []).filter((c) => c.category && c.skills);
  if (!entries.length && !row.categories_label) return undefined;

  const categories: TimelineItem['categories'] = {};
  if (row.categories_label) categories.label = row.categories_label;
  for (const entry of entries) {
    categories[entry.category!.trim()] = splitList(entry.skills);
  }
  return categories;
}

function mapItem(row: ItemRow): TimelineItem {
  const accomplishments = repeaterText(row.accomplishments);
  const showcasedSkills = splitList(row.showcased_skills);

  return {
    directusId: row.id,
    role: row.role ?? '',
    company: row.company,
    companyDescription: row.company_description || undefined,
    // An uploaded logo wins over the /public path, so an editor can replace an
    // image without touching the repo.
    logo: assetUrl(row.logo_file) ?? row.logo_path,
    location: row.location || undefined,
    link: row.link || undefined,
    dates: row.date_from || row.date_to
      ? { from: row.date_from || undefined, to: row.date_to || undefined }
      : undefined,
    summary: row.summary ?? '',
    showcasedSkills: showcasedSkills.length ? showcasedSkills : undefined,
    accomplishments: accomplishments.length ? accomplishments : undefined,
    categories: mapCategories(row),
  };
}


// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

async function query<T>(path: string): Promise<T> {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
    next: { revalidate: DIRECTUS_REVALIDATE },
  });
  if (!res.ok) throw new Error(`Directus ${path} -> ${res.status}`);
  return (await res.json()).data as T;
}

/**
 * Returns the portfolio from Directus, or null when Directus is not configured
 * or the request fails. The caller then uses the YAML on disk.
 */
export async function fetchPortfolioFromDirectus(): Promise<Portfolio | null> {
  if (!isDirectusConfigured()) return null;

  try {
    const [settings, tabRows, itemRows] = await Promise.all([
      query<SettingsRow>('/items/portfolio_settings?fields=*'),
      query<TabRow[]>('/items/portfolio_tabs?sort=sort&limit=-1'),
      query<ItemRow[]>('/items/portfolio_items?sort=sort&limit=-1&fields=*'),
    ]);

    const tabs: Tab[] = tabRows.map((tab) => ({
      id: tab.slug,
      directusId: tab.id,
      label: tab.label,
      items: itemRows.filter((item) => item.tab === tab.id).map(mapItem),
    }));

    return {
      directusId: settings.id,
      hero: {
        name: settings.hero_name,
        title: settings.hero_title,
        bio: settings.hero_bio,
        email: settings.hero_email,
        website: settings.hero_website,
        resumeUrl: settings.hero_resume_url,
      },
      metadata: {
        title: settings.meta_title,
        description: settings.meta_description,
        author: settings.meta_author,
      },
      footer: {
        social: {
          linkedin: settings.social_linkedin,
          github: settings.social_github,
          email: settings.social_email,
          ownerName: settings.social_owner_name,
        },
      },
      theme: {
        colors: {
          accent: settings.theme_accent || '#624AFF',
          background: settings.theme_background || undefined,
        },
        timezone: settings.theme_timezone || undefined,
      },
      tabs,
    };
  } catch (e) {
    console.error('[directus] falling back to YAML:', e instanceof Error ? e.message : e);
    return null;
  }
}
