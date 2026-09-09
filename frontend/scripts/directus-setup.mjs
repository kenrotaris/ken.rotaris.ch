#!/usr/bin/env node
/**
 * Applies the portfolio schema in `directus-schema.mjs` to a Directus instance.
 *
 *   node scripts/directus-setup.mjs --phase=all            # dry run, prints a plan
 *   node scripts/directus-setup.mjs --phase=all --apply    # actually writes
 *
 * Every phase is idempotent and additive: existing collections, fields,
 * relations and permissions are left alone. Nothing is ever deleted, because
 * this may run against a shared multi-tenant Directus.
 *
 * Requires DIRECTUS_ADMIN_TOKEN. DIRECTUS_URL defaults to https://edit.webmo.ch.
 */

import { COLLECTIONS, RELATIONS, READ_COLLECTIONS } from './directus-schema.mjs';
import { buildRows } from './directus-content.mjs';

const URL_BASE = (process.env.DIRECTUS_URL ?? 'https://edit.webmo.ch').replace(/\/+$/, '');
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const APPLY = process.argv.includes('--apply');
const PHASE = (process.argv.find((a) => a.startsWith('--phase=')) ?? '--phase=all').split('=')[1];

const RENDERER_POLICY = 'Portfolio renderer read-only';
const EDITOR_POLICY = 'Portfolio editor';
const NAV_GROUP = 'portfolio';
const SITE_URLS = (process.env.PORTFOLIO_SITE_URLS ?? 'https://ken.rotaris.ch')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

if (!TOKEN) {
  console.error('DIRECTUS_ADMIN_TOKEN is not set. Put it in frontend/.env.local and re-run.');
  process.exit(1);
}

let planned = 0;

// ---------------------------------------------------------------------------
// API plumbing
// ---------------------------------------------------------------------------

async function api(method, path, body, { allow = [] } = {}) {
  const res = await fetch(`${URL_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (allow.includes(res.status)) return null;
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${method} ${path} -> ${res.status}\n${detail.slice(0, 600)}`);
  }
  if (res.status === 204) return null;
  return (await res.json()).data;
}

/** Returns the resource, or null when Directus reports it does not exist. */
async function get(path) {
  const res = await fetch(`${URL_BASE}${path}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (res.status === 403 || res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return (await res.json()).data;
}

/** Log an intended write; perform it only under --apply. */
async function write(label, fn) {
  planned += 1;
  if (!APPLY) {
    console.log(`  would create  ${label}`);
    return null;
  }
  console.log(`  creating      ${label}`);
  return fn();
}

// ---------------------------------------------------------------------------
// Phase: schema
// ---------------------------------------------------------------------------

async function phaseSchema() {
  console.log('\n== schema ==');

  for (const def of COLLECTIONS) {
    const existing = await get(`/collections/${def.collection}`);

    if (!existing) {
      // Directus needs the primary key at creation time; the rest follow as
      // individual field calls so a partial run can be resumed.
      const [primary] = def.fields;
      await write(`collection ${def.collection}`, () =>
        api('POST', '/collections', {
          collection: def.collection,
          meta: def.meta,
          schema: {},
          fields: [primary],
        })
      );
    } else {
      console.log(`  exists        collection ${def.collection}`);
    }

    const have = new Set(
      ((await get(`/fields/${def.collection}`)) ?? []).map((f) => f.field)
    );

    for (const field of def.fields) {
      if (field.field === 'id') continue;
      if (have.has(field.field)) continue;
      await write(`field ${def.collection}.${field.field}`, () =>
        api('POST', `/fields/${def.collection}`, field)
      );
    }
  }

  const relations = (await get('/relations')) ?? [];
  for (const rel of RELATIONS) {
    const found = relations.some(
      (r) => r.collection === rel.collection && r.field === rel.field
    );
    if (found) {
      console.log(`  exists        relation ${rel.collection}.${rel.field}`);
      continue;
    }
    await write(`relation ${rel.collection}.${rel.field} -> ${rel.related_collection}`, () =>
      api('POST', '/relations', rel)
    );
  }
}

// ---------------------------------------------------------------------------
// Phase: access
// ---------------------------------------------------------------------------

async function findByName(path, name) {
  const rows = (await get(`${path}?filter[name][_eq]=${encodeURIComponent(name)}`)) ?? [];
  return rows[0] ?? null;
}

async function ensurePolicy(name, { appAccess }) {
  const found = await findByName('/policies', name);
  if (found) {
    console.log(`  exists        policy "${name}"`);
    return found;
  }
  return write(`policy "${name}"`, () =>
    api('POST', '/policies', {
      name,
      icon: appAccess ? 'edit' : 'visibility',
      app_access: appAccess,
      admin_access: false,
    })
  );
}

async function ensurePermission(policyId, collection, action) {
  if (!policyId) return; // dry run — the policy does not exist yet
  const filter =
    `?filter[policy][_eq]=${policyId}` +
    `&filter[collection][_eq]=${collection}` +
    `&filter[action][_eq]=${action}`;
  const rows = (await get(`/permissions${filter}`)) ?? [];
  if (rows.length) return;

  await write(`permission ${action} on ${collection}`, () =>
    api('POST', '/permissions', {
      policy: policyId,
      collection,
      action,
      fields: ['*'],
      permissions: {},
      validation: {},
    })
  );
}

async function phaseAccess() {
  console.log('\n== access ==');

  const renderer = await ensurePolicy(RENDERER_POLICY, { appAccess: false });
  for (const collection of READ_COLLECTIONS) {
    await ensurePermission(renderer?.id, collection, 'read');
  }

  const editor = await ensurePolicy(EDITOR_POLICY, { appAccess: true });
  for (const collection of READ_COLLECTIONS) {
    if (collection === 'directus_files') {
      for (const action of ['read', 'create', 'update']) {
        await ensurePermission(editor?.id, collection, action);
      }
      continue;
    }
    for (const action of ['read', 'create', 'update', 'delete']) {
      await ensurePermission(editor?.id, collection, action);
    }
  }

  console.log(
    '\n  Attach these policies to a role in the Directus UI, then mint a static\n' +
    '  token for the renderer role and set it as DIRECTUS_TOKEN for the site.'
  );
}

// ---------------------------------------------------------------------------
// Phase: verify
// ---------------------------------------------------------------------------

async function phaseVerify() {
  console.log('\n== verify ==');
  let ok = true;

  for (const def of COLLECTIONS) {
    const fields = (await get(`/fields/${def.collection}`)) ?? [];
    const have = new Set(fields.map((f) => f.field));
    const missing = def.fields.map((f) => f.field).filter((f) => !have.has(f));
    if (missing.length) {
      ok = false;
      console.log(`  MISSING  ${def.collection}: ${missing.join(', ')}`);
    } else {
      console.log(`  ok       ${def.collection} (${def.fields.length} fields)`);
    }
  }

  if (!ok) process.exitCode = 1;
}

// ---------------------------------------------------------------------------
// Phase: settings
// ---------------------------------------------------------------------------

/**
 * Registers the site with the visual editor and folds the collections into one
 * sidebar group. Both are presentation-only; no schema or data is touched.
 */
async function phaseSettings() {
  console.log('\n== settings ==');

  // A collection row with no table behind it renders as a sidebar folder.
  const folder = await get(`/collections/${NAV_GROUP}`);
  if (folder) {
    console.log(`  exists        nav folder "${NAV_GROUP}"`);
  } else {
    await write(`nav folder "${NAV_GROUP}"`, () =>
      api('POST', '/collections', {
        collection: NAV_GROUP,
        meta: { icon: 'person', note: 'ken.rotaris.ch', collapse: 'open' },
        schema: null,
      })
    );
  }

  for (const def of COLLECTIONS) {
    const current = await get(`/collections/${def.collection}`);
    if (current?.meta?.group === NAV_GROUP) {
      console.log(`  exists        ${def.collection} in "${NAV_GROUP}"`);
      continue;
    }
    await write(`move ${def.collection} into "${NAV_GROUP}"`, () =>
      api('PATCH', `/collections/${def.collection}`, { meta: { group: NAV_GROUP } })
    );
  }

  // visual_editor_urls is an array of objects, not strings.
  const settings = (await get('/settings?fields=visual_editor_urls')) ?? {};
  const existing = (settings.visual_editor_urls ?? []).filter(
    (u) => u && typeof u === 'object' && u.url
  );
  const missing = SITE_URLS.filter((url) => !existing.some((u) => u.url === url));

  if (!missing.length) {
    console.log('  exists        visual editor URLs already registered');
  } else {
    await write(`visual editor URL(s): ${missing.join(', ')}`, () =>
      api('PATCH', '/settings', {
        visual_editor_urls: [...existing, ...missing.map((url) => ({ url }))],
      })
    );
  }
}

// ---------------------------------------------------------------------------
// Phase: seed
// ---------------------------------------------------------------------------

/**
 * Imports the YAML in public/data. Refuses to run when tabs already exist, so
 * a repeated run cannot duplicate content; pass --force to overwrite.
 */
async function phaseSeed() {
  console.log('\n== seed ==');

  const existing = (await get('/items/portfolio_tabs?limit=-1&fields=id')) ?? [];
  const force = process.argv.includes('--force');

  if (existing.length && !force) {
    console.log(`  ${existing.length} tab(s) already present — skipping.`);
    console.log('  Pass --force to delete them and re-import from YAML.');
    return;
  }

  if (existing.length && force) {
    await write(`delete ${existing.length} existing tab(s) and their items`, async () => {
      const items = (await get('/items/portfolio_items?limit=-1&fields=id')) ?? [];
      if (items.length) {
        await api('DELETE', '/items/portfolio_items', items.map((i) => i.id));
      }
      await api('DELETE', '/items/portfolio_tabs', existing.map((t) => t.id));
    });
  }

  const { settings, tabs, itemsByTabSlug } = buildRows();
  const itemCount = Object.values(itemsByTabSlug).reduce((n, rows) => n + rows.length, 0);

  await write('portfolio_settings (singleton)', () =>
    api('PATCH', '/items/portfolio_settings', settings)
  );

  const created = await write(`${tabs.length} tab(s)`, () =>
    api('POST', '/items/portfolio_tabs', tabs)
  );

  if (!APPLY) {
    console.log(`  would create  ${itemCount} item(s)`);
    planned += 1;
    return;
  }

  // Map the slugs back onto the UUIDs Directus just assigned.
  const idBySlug = Object.fromEntries(created.map((t) => [t.slug, t.id]));
  const rows = tabs.flatMap((tab) =>
    itemsByTabSlug[tab.slug].map((item) => ({ ...item, tab: idBySlug[tab.slug] }))
  );

  await write(`${rows.length} item(s)`, () => api('POST', '/items/portfolio_items', rows));
}

// ---------------------------------------------------------------------------

const phases = {
  schema: phaseSchema,
  access: phaseAccess,
  settings: phaseSettings,
  seed: phaseSeed,
  verify: phaseVerify,
};

console.log(`Directus: ${URL_BASE}`);
console.log(APPLY ? 'mode: APPLY (writes)' : 'mode: dry run (no writes)');

const toRun = PHASE === 'all' ? ['schema', 'access', 'settings', 'verify'] : [PHASE];
for (const name of toRun) {
  if (!phases[name]) {
    console.error(`unknown phase "${name}" — use schema, access, seed, verify or all`);
    process.exit(1);
  }
  if (name === 'verify' && !APPLY && planned > 0) {
    console.log('\n== verify ==\n  skipped (dry run has not created anything yet)');
    continue;
  }
  await phases[name]();
}

if (!APPLY && planned > 0) {
  console.log(`\n${planned} change(s) planned. Re-run with --apply to write them.`);
}
