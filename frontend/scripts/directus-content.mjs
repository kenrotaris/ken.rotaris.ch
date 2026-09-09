/**
 * Converts the YAML in public/data into the Directus row shapes declared in
 * directus-schema.mjs. Shared by the seed phase and by directus-mock.mjs, so
 * the mock can never drift from what actually gets written.
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const TAB_ORDER = ['experience', 'education', 'projects', 'courses'];

const load = (p) => yaml.load(fs.readFileSync(p, 'utf8'));
const lines = (arr) => (arr ?? []).map((text) => ({ text }));

/** @returns {{settings: object, tabs: object[], itemsByTabSlug: Record<string, object[]>}} */
export function buildRows(dataDir = path.join(process.cwd(), 'public', 'data')) {
  const portfolio = load(path.join(dataDir, 'portfolio.yaml'));
  const left = portfolio.resume?.['left-section'] ?? {};

  const settings = {
    hero_name: portfolio.hero?.name,
    hero_title: portfolio.hero?.title,
    hero_bio: portfolio.hero?.bio,
    hero_email: portfolio.hero?.email,
    hero_website: portfolio.hero?.website,
    meta_title: portfolio.metadata?.title,
    meta_description: portfolio.metadata?.description,
    meta_author: portfolio.metadata?.author,
    theme_accent: portfolio.theme?.colors?.accent,
    theme_background: portfolio.theme?.colors?.background,
    theme_timezone: portfolio.theme?.timezone,
    social_linkedin: portfolio.footer?.social?.linkedin,
    social_github: portfolio.footer?.social?.github,
    social_email: portfolio.footer?.social?.email,
    social_owner_name: portfolio.footer?.social?.ownerName,
    resume_subtitle: portfolio.resume?.subtitle,
    resume_summary: lines(left.summary),
    resume_technical_skills: lines(left.technicalSkills),
    resume_soft_skills: lines(left.softSkills),
    resume_languages: (left.languages ?? []).map((l) => ({ name: l.name, level: l.level })),
  };

  const filenames = fs
    .readdirSync(path.join(dataDir, 'tabs'))
    .filter((f) => f.endsWith('.yaml'))
    .sort((a, b) => {
      const ai = TAB_ORDER.indexOf(a.replace('.yaml', ''));
      const bi = TAB_ORDER.indexOf(b.replace('.yaml', ''));
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

  const tabs = [];
  const itemsByTabSlug = {};

  filenames.forEach((filename, tabIndex) => {
    const slug = filename.replace('.yaml', '');
    const data = load(path.join(dataDir, 'tabs', filename));

    tabs.push({
      slug,
      label: data.label,
      sort: tabIndex,
      resume_max_items: data.resumeMaxItems ?? null,
    });

    itemsByTabSlug[slug] = (data.items ?? []).map((item, i) => {
      const { label, ...categories } = item.categories ?? {};
      return {
        sort: i,
        role: item.role,
        company: item.company ?? item.organization?.name,
        company_description: item.companyDescription ?? item.organization?.description ?? null,
        location: item.location ?? item.organization?.location ?? null,
        link: item.link ?? item.organization?.link ?? null,
        logo_file: null,
        logo_path: item.logo ?? item.organization?.logo ?? null,
        date_from: item.dates?.from != null ? String(item.dates.from) : null,
        date_to: item.dates?.to != null ? String(item.dates.to) : null,
        summary: item.summary,
        showcased_skills: (item.showcasedSkills ?? []).join(', ') || null,
        accomplishments: lines(item.accomplishments),
        categories_label: label ?? null,
        categories: Object.entries(categories).map(([category, skills]) => ({
          category,
          skills: Array.isArray(skills) ? skills.join(', ') : String(skills),
        })),
      };
    });
  });

  return { settings, tabs, itemsByTabSlug };
}
