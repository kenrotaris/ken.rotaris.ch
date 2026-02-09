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

export function validatePortfolio(data: any): Portfolio {
  const errors: string[] = [];

  // Validate hero section
  if (data.hero) {
    if (!data.hero.name) errors.push('hero.name is required');
    if (!data.hero.title) errors.push('hero.title is required');
  }

  // Validate tabs
  if (data.tabs) {
    data.tabs.forEach((tab: any, i: number) => {
      if (!tab.id) errors.push(`tabs[${i}].id is required`);
      if (!tab.label) errors.push(`tabs[${i}].label is required`);

      if (tab.items) {
        tab.items.forEach((item: any, j: number) => {
          const path = `tabs[${i}].items[${j}]`;

          // Check for common typos
          if (item.form || item.too) {
            errors.push(`${path}: Did you mean "from"/"to" instead of "form"/"too"?`);
          }

          // Validate required fields (support both old and new structure)
          if (!item.company && !item.organization?.name) {
            errors.push(`${path}.company (or organization.name) is required`);
          }
          if (!item.role) errors.push(`${path}.role is required`);
          if (!item.summary) errors.push(`${path}.summary is required`);

          // Validate dates if present
          if (item.dates) {
            if (item.dates.from && typeof item.dates.from === 'number') {
              console.warn(`${path}.dates.from is a number (${item.dates.from}). Consider quoting it: "${item.dates.from}"`);
            }
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

  return data as Portfolio;
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
