#!/usr/bin/env node
/**
 * Writes Directus back into public/data/*.yaml.
 *
 *   npm run directus:pull            # show what would change
 *   npm run directus:pull -- --write # write the files
 *
 * The YAML is the fallback the image ships with, so it goes stale as soon as
 * content is edited in Directus. Run this before a release and commit the diff.
 *
 * Uses DIRECTUS_URL and DIRECTUS_TOKEN (the read-only renderer token is enough).
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const URL_BASE = (process.env.DIRECTUS_URL ?? '').replace(/\/+$/, '');
const TOKEN = process.env.DIRECTUS_TOKEN ?? '';
const WRITE = process.argv.includes('--write');
const DATA = path.join(process.cwd(), 'public', 'data');

if (!URL_BASE || !TOKEN) {
  console.error('DIRECTUS_URL and DIRECTUS_TOKEN must be set (see .env.local).');
  process.exit(1);
}

const get = async (p) => {
  const res = await fetch(`${URL_BASE}${p}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`GET ${p} -> ${res.status}`);
  return (await res.json()).data;
};

const text = (rows) => (rows ?? []).map((r) => r.text).filter(Boolean);
const list = (s) => (s ?? '').split(',').map((x) => x.trim()).filter(Boolean);

/** Drop keys whose value is null, undefined, '' or an empty array/object. */
const prune = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => {
      if (v == null || v === '') return false;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'object') return Object.keys(v).length > 0;
      return true;
    })
  );

const dump = (doc) => yaml.dump(doc, { lineWidth: 100000, noRefs: true });

const [settings, tabs, items] = await Promise.all([
  get('/items/portfolio_settings?fields=*'),
  get('/items/portfolio_tabs?sort=sort&limit=-1'),
  get('/items/portfolio_items?sort=sort&limit=-1&fields=*'),
]);

const files = {};

files['portfolio.yaml'] = dump(
  prune({
    hero: prune({
      name: settings.hero_name,
      title: settings.hero_title,
      bio: settings.hero_bio,
      email: settings.hero_email,
      website: settings.hero_website,
      resumeUrl: settings.hero_resume_url,
    }),
    metadata: prune({
      title: settings.meta_title,
      description: settings.meta_description,
      author: settings.meta_author,
    }),
    footer: {
      social: prune({
        linkedin: settings.social_linkedin,
        github: settings.social_github,
        email: settings.social_email,
        ownerName: settings.social_owner_name,
      }),
    },
    theme: prune({
      colors: prune({ accent: settings.theme_accent, background: settings.theme_background }),
      timezone: settings.theme_timezone,
    }),
  })
);

for (const tab of tabs) {
  const rows = items.filter((i) => i.tab === tab.id);
  files[path.join('tabs', `${tab.slug}.yaml`)] = dump({
    label: tab.label,
    items: rows.map((r) => {
      const categories = {};
      if (r.categories_label) categories.label = r.categories_label;
      for (const c of r.categories ?? []) {
        if (c.category && c.skills) categories[c.category] = list(c.skills);
      }
      return prune({
        role: r.role,
        company: r.company,
        companyDescription: r.company_description,
        logo: r.logo_path,
        location: r.location,
        link: r.link,
        dates: prune({ from: r.date_from, to: r.date_to }),
        summary: r.summary,
        showcasedSkills: list(r.showcased_skills),
        accomplishments: text(r.accomplishments),
        categories,
      });
    }),
  });
}

/**
 * Compare parsed content, not raw text. Key order and quoting differ harmlessly
 * between hand-edited YAML and what js-yaml emits; only real drift should show.
 */
const canonical = (v) => {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])]));
  }
  return v;
};

const sameContent = (a, b) => {
  try {
    return JSON.stringify(canonical(yaml.load(a) ?? null)) === JSON.stringify(canonical(yaml.load(b) ?? null));
  } catch {
    return false;
  }
};

let changed = 0;
for (const [rel, body] of Object.entries(files)) {
  const file = path.join(DATA, rel);
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (sameContent(before, body)) {
    console.log(`  same    ${rel}`);
    continue;
  }
  changed += 1;
  console.log(`  ${WRITE ? 'wrote  ' : 'DIFFERS'} ${rel}`);
  if (WRITE) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, body);
  }
}

if (!changed) console.log('\nYAML already matches Directus.');
else if (!WRITE) console.log(`\n${changed} file(s) differ. Re-run with --write to update them.`);
