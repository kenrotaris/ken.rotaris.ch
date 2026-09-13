/**
 * Directus schema for the ken.rotaris.ch portfolio.
 *
 * This file is the single declaration of the collections; `directus-setup.mjs`
 * applies it and `lib/directus.ts` maps the rows back onto `lib/types.ts`.
 * Changing a field here means changing the mapper too — see README.
 */

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------

export const pk = () => ({
  field: 'id',
  type: 'uuid',
  meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] },
  schema: { is_primary_key: true, length: 36, has_auto_increment: false },
});

/** Single-line text. */
export const str = (field, { name, note, required = false, width = 'full' } = {}) => ({
  field,
  type: 'string',
  meta: { interface: 'input', note, required, width, ...(name ? { name } : {}) },
  schema: { is_nullable: !required },
});

/** Multi-line text. */
export const text = (field, { name, note, required = false } = {}) => ({
  field,
  type: 'text',
  meta: { interface: 'input-multiline', note, required, ...(name ? { name } : {}) },
  schema: { is_nullable: !required },
});

export const color = (field, { name, note } = {}) => ({
  field,
  type: 'string',
  meta: { interface: 'select-color', note, width: 'half', ...(name ? { name } : {}) },
  schema: { is_nullable: true },
});

export const int = (field, { name, note, defaultValue = null } = {}) => ({
  field,
  type: 'integer',
  meta: { interface: 'input', note, width: 'half', ...(name ? { name } : {}) },
  schema: { is_nullable: true, default_value: defaultValue },
});

/** Hidden ordering column driven by the Directus drag handle. */
export const sort = () => ({
  field: 'sort',
  type: 'integer',
  meta: { interface: 'input', hidden: true },
  schema: { is_nullable: true },
});

export const file = (field, { name, note } = {}) => ({
  field,
  type: 'uuid',
  meta: { interface: 'file', note, special: ['file'], ...(name ? { name } : {}) },
  schema: { is_nullable: true },
});

/** Many-to-one dropdown; the relation itself is created separately. */
export const m2o = (field, { name, note, template, required = false } = {}) => ({
  field,
  type: 'uuid',
  meta: {
    interface: 'select-dropdown-m2o',
    special: ['m2o'],
    note,
    required,
    options: template ? { template } : undefined,
    ...(name ? { name } : {}),
  },
  schema: { is_nullable: !required },
});

/**
 * Repeating group of sub-fields, stored as JSON. `fields` entries are
 * [name, label, type] where type is 'string' or 'text'.
 */
export const repeater = (field, fields, { name, note, template } = {}) => ({
  field,
  type: 'json',
  meta: {
    interface: 'list',
    special: ['cast-json'],
    note,
    ...(name ? { name } : {}),
    options: {
      template,
      fields: fields.map(([f, label, t = 'string']) => ({
        field: f,
        name: label,
        type: t === 'text' ? 'text' : 'string',
        meta: {
          field: f,
          type: t === 'text' ? 'text' : 'string',
          interface: t === 'text' ? 'input-multiline' : 'input',
        },
      })),
    },
  },
  schema: { is_nullable: true },
});

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

/**
 * Comma-separated skill lists are deliberate: `Java, Spring, Quarkus` in one
 * input is far less tedious than a nested repeater, and the mapper splits it.
 */
const SKILLS_NOTE = 'Comma-separated, e.g. "Java, Spring Framework, Quarkus"';

export const COLLECTIONS = [
  {
    collection: 'portfolio_settings',
    meta: {
      singleton: true,
      icon: 'tune',
      note: 'Hero, metadata, theme, footer and resume side-column.',
      display_template: '{{hero_name}}',
    },
    fields: [
      pk(),
      str('hero_name', { name: 'Name', required: true }),
      str('hero_title', { name: 'Title', required: true, note: 'Shown under the name' }),
      text('hero_bio', { name: 'Bio' }),
      str('hero_email', { name: 'Email', width: 'half' }),
      str('hero_website', { name: 'Website', width: 'half', note: 'Without https://' }),
      str('hero_resume_url', {
        name: 'Resume URL',
        note: 'Externally hosted resume (e.g. a Google Docs PDF export). Empty hides the link.',
      }),

      str('meta_title', { name: 'SEO title' }),
      text('meta_description', { name: 'SEO description' }),
      str('meta_author', { name: 'SEO author' }),

      color('theme_accent', { name: 'Accent colour', note: 'Hex, e.g. #624AFF' }),
      color('theme_background', { name: 'Background colour', note: 'Drives the fog / gradient' }),
      str('theme_timezone', { name: 'Timezone', width: 'half', note: 'e.g. CET' }),

      str('social_linkedin', { name: 'LinkedIn URL' }),
      str('social_github', { name: 'GitHub URL' }),
      str('social_email', { name: 'Contact email', width: 'half' }),
      str('social_owner_name', { name: 'Footer owner name', width: 'half' }),

      text('resume_subtitle', { name: 'Resume subtitle' }),
      repeater('resume_summary', [['text', 'Paragraph', 'text']], {
        name: 'Resume summary',
        template: '{{text}}',
      }),
      repeater('resume_technical_skills', [['text', 'Line', 'text']], {
        name: 'Technical skills',
        note: 'One line per group, e.g. "Backend: Java, Spring, …"',
        template: '{{text}}',
      }),
      repeater('resume_soft_skills', [['text', 'Line', 'text']], {
        name: 'Soft skills',
        template: '{{text}}',
      }),
      repeater('resume_languages', [['name', 'Language'], ['level', 'Level']], {
        name: 'Languages',
        template: '{{name}} — {{level}}',
      }),
    ],
  },

  {
    collection: 'portfolio_tabs',
    meta: {
      icon: 'tab',
      note: 'One tab per section of the timeline.',
      sort_field: 'sort',
      display_template: '{{label}}',
      archive_field: null,
    },
    fields: [
      pk(),
      sort(),
      str('slug', {
        name: 'Slug',
        required: true,
        width: 'half',
        note: 'URL hash and resume key, e.g. "experience"',
      }),
      str('label', { name: 'Label', required: true, width: 'half' }),
      int('resume_max_items', {
        name: 'Max items on resume',
        note: 'Leave empty for no limit',
      }),
    ],
  },

  {
    collection: 'portfolio_items',
    meta: {
      icon: 'timeline',
      note: 'Timeline entries — jobs, studies, projects, certifications.',
      sort_field: 'sort',
      display_template: '{{role}} — {{company}}',
    },
    fields: [
      pk(),
      sort(),
      m2o('tab', { name: 'Tab', required: true, template: '{{label}}' }),

      str('role', { name: 'Role', required: true, width: 'half' }),
      str('company', { name: 'Company', required: true, width: 'half' }),
      str('company_description', { name: 'Company description' }),
      str('location', { name: 'Location', width: 'half' }),
      str('link', { name: 'Link', width: 'half' }),

      file('logo_file', { name: 'Logo (upload)', note: 'Takes precedence over the logo path' }),
      str('logo_path', {
        name: 'Logo (path)',
        note: 'Path under /public, e.g. /images/education/aws.svg',
      }),

      str('date_from', {
        name: 'From',
        width: 'half',
        note: '"Nov 2026" or "2020". A future date renders as PLANNED.',
      }),
      str('date_to', { name: 'To', width: 'half', note: '"Present" or empty for ongoing' }),

      text('summary', { name: 'Summary', required: true }),
      str('showcased_skills', { name: 'Showcased skills', note: SKILLS_NOTE }),
      repeater('accomplishments', [['text', 'Accomplishment', 'text']], {
        name: 'Key accomplishments',
        template: '{{text}}',
      }),
      str('categories_label', {
        name: 'Categories heading',
        width: 'half',
        note: 'Defaults to "Skills"',
      }),
      repeater('categories', [['category', 'Category'], ['skills', 'Skills']], {
        name: 'Categories',
        note: `Category name plus its skills. ${SKILLS_NOTE}`,
        template: '{{category}}: {{skills}}',
      }),
    ],
  },
];

/** Relations that cannot be expressed as plain fields. */
export const RELATIONS = [
  {
    collection: 'portfolio_items',
    field: 'tab',
    related_collection: 'portfolio_tabs',
    meta: { sort_field: 'sort', one_deselect_action: 'nullify' },
    schema: { on_delete: 'SET NULL' },
  },
  {
    collection: 'portfolio_items',
    field: 'logo_file',
    related_collection: 'directus_files',
    meta: { one_deselect_action: 'nullify' },
    schema: { on_delete: 'SET NULL' },
  },
];

/** Collections the renderer token needs to read. */
export const READ_COLLECTIONS = [
  'portfolio_settings',
  'portfolio_tabs',
  'portfolio_items',
  'directus_files',
];
