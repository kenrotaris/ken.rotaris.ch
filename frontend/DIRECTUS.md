# Editing content in Directus

The site renders from Directus at <https://edit.webmo.ch> when `DIRECTUS_URL`
and `DIRECTUS_TOKEN` are set, and from the YAML in `public/data/` otherwise.
The YAML is the fallback, not dead weight: if Directus is unreachable or has no
tabs, `lib/data.ts` logs and serves the repo copy, so the site cannot go dark
because a CMS is down.

## Collections

| Collection | What it holds |
| --- | --- |
| `portfolio_settings` (singleton) | Hero, SEO metadata, theme colours, footer links, resume side-column |
| `portfolio_tabs` | One row per timeline tab (`experience`, `education`, …) |
| `portfolio_items` | Timeline entries, each linked to a tab |

Field-level notes worth knowing:

- **Skill lists are comma-separated.** `Showcased skills` and each `Categories`
  row take `Java, Spring Framework, Quarkus` in a single input; the mapper
  splits on commas. A nested repeater would be more tedious for no gain.
- **Logos take either form.** `Logo (upload)` wins over `Logo (path)`, so a logo
  can be replaced in Directus without touching the repo. Paths stay valid for
  the images already in `public/images/`.
- **Dates are free text** — `Nov 2026`, `2020`, `Present`. A start date in the
  future renders as a `PLANNED` badge (see `calculateDuration` in `lib/utils.ts`).

## Applying the schema

Needs an admin token; the read-only renderer token cannot create collections.

```bash
cd frontend
echo 'DIRECTUS_ADMIN_TOKEN=…' >> .env.local     # .env.local is gitignored

npm run directus:plan      # prints every intended change, writes nothing
npm run directus:apply     # creates collections, fields, relations, policies
npm run directus:verify    # re-checks that every field exists
```

Both phases are idempotent and strictly additive — existing collections,
fields and permissions are left alone and nothing is ever deleted. That matters
because `edit.webmo.ch` is the shared webmo platform instance.

After `directus:apply`, in the Directus UI:

1. Attach **Portfolio editor** to your own role, and **Portfolio renderer
   read-only** to a service role.
2. Mint a static token for that renderer role and set it as `DIRECTUS_TOKEN`
   for the site.

## Publishing

Pages carry a 5-minute ISR window, so edits appear within five minutes on their
own. To make them appear immediately, add a Directus flow:

- **Trigger:** event hook, non-blocking, on `items.create`, `items.update` and
  `items.delete` for the three `portfolio_*` collections.
- **Operation:** Webhook, `POST https://ken.rotaris.ch/api/revalidate`, with
  header `x-revalidate-secret` set to the site's `REVALIDATE_SECRET`.

Without the secret the endpoint answers 401, and without `REVALIDATE_SECRET`
configured it answers 503.

## Visual editor

The site is registered in `settings.visual_editor_urls`, so it appears in the
Studio's **Visual** module. Clicking text on the framed page opens the matching
field.

What is clickable:

| Element | Opens |
| --- | --- |
| Hero name / title / bio | that single field, inline |
| Footer owner line | `social_owner_name` |
| Footer icon row | the three social fields in a drawer |
| Tab label | `label` on that tab |
| Timeline role / company / summary | that single field, inline |
| Anywhere else on a timeline card | the whole entry in a drawer |

Repeaters (`accomplishments`, `categories`) cannot be clicked element by
element — that is why the card as a whole opens a drawer.

Two things this depends on:

- **`Content-Security-Policy: frame-ancestors`** must include the Studio origin.
  It replaces `X-Frame-Options`, which has no third-party allow-list. The origin
  comes from `VISUAL_EDITOR_ORIGIN`, defaulting to the `DIRECTUS_URL` origin —
  they are separate because the editor validates that postMessage traffic comes
  from the Studio origin exactly, which need not be the content API host.
- **The publish flow**, because pages are statically cached. On save the overlay
  waits briefly and reloads; without the flow to revalidate, that reload can
  still show the old value for up to five minutes.

Ordinary visitors never pay for this: `@directus/visual-editing` is dynamically
imported behind a `window.self !== window.top` check, so it is a lazy chunk that
is only fetched inside the Studio frame.

## Changing the content shape

The shape now lives in three places, and all three must move together:

1. `lib/types.ts` — the TypeScript shape the components consume.
2. `scripts/directus-schema.mjs` — the Directus fields.
3. `lib/directus.ts` — the mapping between them.

Run `npm run directus:plan` after step 2 to see exactly what would change.
