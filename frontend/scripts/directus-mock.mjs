#!/usr/bin/env node
/**
 * Test double for Directus: serves the YAML in public/data in the row shapes
 * `lib/directus.ts` expects, using the same transform as the seed phase.
 *
 *   node scripts/directus-mock.mjs 3200
 */
import http from 'node:http';
import { buildRows } from './directus-content.mjs';

const PORT = Number(process.argv[2] ?? 3200);
const { settings, tabs, itemsByTabSlug } = buildRows();

// Stand-in ids, since nothing here round-trips through a database.
const withIds = tabs.map((tab) => ({ ...tab, id: `tab-${tab.slug}` }));
const items = withIds.flatMap((tab) =>
  itemsByTabSlug[tab.slug].map((item, i) => ({ ...item, id: `${tab.id}-${i}`, tab: tab.id }))
);

const routes = {
  '/items/portfolio_settings': settings,
  '/items/portfolio_tabs': withIds,
  '/items/portfolio_items': items,
};

http
  .createServer((req, res) => {
    const data = routes[req.url.split('?')[0]];
    res.writeHead(data === undefined ? 404 : 200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data === undefined ? { errors: ['not found'] } : { data }));
  })
  .listen(PORT, () => console.log(`mock directus on ${PORT}: ${withIds.length} tabs, ${items.length} items`));
