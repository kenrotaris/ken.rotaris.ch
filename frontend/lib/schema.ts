/**
 * Runtime schema validation for portfolio YAML
 * DEV ONLY: Provides helpful error messages during development
 * Production builds skip validation for faster load times
 */

import { Portfolio, TimelineItem } from './types';

export class ValidationError extends Error {
  constructor(message: string, public path: string) {
    super(`${path}: ${message}`);
    this.name = 'ValidationError';
  }
}

export function validatePortfolio(data: unknown): Portfolio {
  const errors: string[] = [];
  const portfolio = data as Record<string, unknown>;

  // Validate hero section
  if (portfolio.hero) {
    const hero = portfolio.hero as Record<string, unknown>;
    if (!hero.name) errors.push('hero.name is required');
    if (!hero.title) errors.push('hero.title is required');
  }

  // Validate tabs
  if (portfolio.tabs && Array.isArray(portfolio.tabs)) {
    portfolio.tabs.forEach((tab, i: number) => {
      const tabData = tab as Record<string, unknown>;
      if (!tabData.id) errors.push(`tabs[${i}].id is required`);
      if (!tabData.label) errors.push(`tabs[${i}].label is required`);

      if (tabData.items && Array.isArray(tabData.items)) {
        tabData.items.forEach((item, j: number) => {
          const itemData = item as Record<string, unknown>;
          const path = `tabs[${i}].items[${j}]`;

          // Check for common typos
          if ((itemData as {form?: unknown}).form || (itemData as {too?: unknown}).too) {
            errors.push(`${path}: Did you mean "from"/"to" instead of "form"/"too"?`);
          }

          // Validate required fields (support both old and new structure)
          const company = (itemData as {company?: unknown}).company;
          const organization = (itemData as {organization?: {name?: unknown}}).organization;
          if (!company && !organization?.name) {
            errors.push(`${path}.company (or organization.name) is required`);
          }
          if (!(itemData as {role?: unknown}).role) errors.push(`${path}.role is required`);
          if (!(itemData as {summary?: unknown}).summary) errors.push(`${path}.summary is required`);

          // Validate dates if present
          const dates = (itemData as {dates?: {from?: unknown; to?: unknown}}).dates;
          if (dates?.from && typeof dates.from === 'number') {
            console.warn(`${path}.dates.from is a number (${dates.from}). Consider quoting it: "${dates.from}"`);
          }
        });
      }
    });
  }

  if (errors.length > 0) {
    throw new Error(
      'Portfolio validation failed:\n' + errors.map(e => `  - ${e}`).join('\n')
    );
  }

  return portfolio as Portfolio;
}

/**
 * Normalize date values to strings
 */
export function normalizeDates(data: Portfolio): Portfolio {
  if (!data.tabs) return data;

  const normalized = { ...data };
  normalized.tabs = data.tabs.map(tab => ({
    ...tab,
    items: tab.items.map(item => {
      if (!item.dates) return item;

      return {
        ...item,
        dates: {
          from: item.dates.from != null ? String(item.dates.from) : undefined,
          to: item.dates.to != null ? String(item.dates.to) : undefined,
        }
      };
    })
  }));

  return normalized;
}
