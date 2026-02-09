/**
 * Default configuration values
 * Single source of truth for fallback values when YAML config is missing
 */

import { Portfolio, ThemeConfig } from './types';

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    accent: '#14b8a6',
  },
  timezone: 'UTC',
};

export const DEFAULT_PORTFOLIO: Portfolio = {
  hero: {
    name: 'Portfolio',
    title: 'Professional',
    bio: 'Welcome to my portfolio',
  },
  tabs: [],
  theme: DEFAULT_THEME,
  metadata: {
    title: 'Portfolio',
    description: 'Professional Portfolio',
    author: 'Portfolio',
  },
};
