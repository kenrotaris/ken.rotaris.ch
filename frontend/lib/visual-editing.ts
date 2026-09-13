/**
 * `data-directus` attribute builder for the Directus visual editor.
 *
 * The attribute format is a simple `key:value;` string, so it is generated here
 * rather than with `setAttr` from @directus/visual-editing, which keeps the
 * library out of the client bundle for ordinary visitors. The overlay itself is
 * dynamically imported by <VisualEditing>, only when the page is framed.
 */

export type VisualEditMode = 'drawer' | 'modal' | 'popover';

export interface VisualEditRef {
  collection: string;
  /** Directus row id. Null for a collection with no row yet. */
  item: string | number | null;
}

/**
 * Serializes to e.g. `collection:portfolio_items;item:abc;mode:popover;fields:role`
 * This is the exact shape `setAttr` produces, verified against the 2.1.0 build.
 */
export function visualEditAttr(
  ref: VisualEditRef | null | undefined,
  options: { mode?: VisualEditMode; fields?: string | string[] } = {}
): string | undefined {
  if (!ref?.collection) return undefined;

  const parts = [
    `collection:${ref.collection}`,
    `item:${ref.item ?? 'null'}`,
    `mode:${options.mode ?? 'drawer'}`,
  ];

  const fields = options.fields
    ? Array.isArray(options.fields)
      ? options.fields
      : [options.fields]
    : [];
  if (fields.length) parts.push(`fields:${fields.join(',')}`);

  return parts.join(';');
}

export interface VisualEditHandle {
  /** Opens the whole row: the only option for repeaters like accomplishments. */
  item: (mode?: VisualEditMode, fields?: string | string[]) => string | undefined;
  /** Inline edit of one field. */
  field: (field: string, mode?: VisualEditMode) => string | undefined;
  fields: (fields: string | string[], mode?: VisualEditMode) => string | undefined;
}

/** Convenience wrapper so components read `edit.field('role')`. */
export function visualEdit(ref: VisualEditRef | null | undefined): VisualEditHandle {
  return {
    item: (mode = 'drawer', fields) => visualEditAttr(ref, { mode, fields }),
    field: (field, mode = 'popover') => visualEditAttr(ref, { mode, fields: [field] }),
    fields: (fields, mode = 'popover') => visualEditAttr(ref, { mode, fields }),
  };
}

export const SETTINGS_COLLECTION = 'portfolio_settings';
export const TABS_COLLECTION = 'portfolio_tabs';
export const ITEMS_COLLECTION = 'portfolio_items';
