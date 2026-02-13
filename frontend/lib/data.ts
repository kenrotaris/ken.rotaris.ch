/**
 * Portfolio Data Loader
 * Loads and normalizes portfolio data from YAML files
 * Combines loading + normalization for simpler mental model
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Portfolio, TimelineItem, Tab, TabFile } from './types';
import { DEFAULT_PORTFOLIO } from './config';
import { validatePortfolio } from './schema';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

// ============================================================================
// Types
// ============================================================================

export interface NormalizedTimelineItem extends TimelineItem {
  // Guaranteed to be present after normalization
  company: string;
  logo: string;
  location: string;
}

export type NormalizedTab = Tab<NormalizedTimelineItem>;
export type NormalizedPortfolio = Portfolio<NormalizedTimelineItem>;

// ============================================================================
// Normalization Functions
// ============================================================================

/**
 * Normalize timeline item structure and dates
 * - Flattens old organization.* format to new company, logo, etc.
 * - Converts numeric dates to strings
 */
function normalizeTimelineItem(item: TimelineItem): NormalizedTimelineItem {
  let normalized: NormalizedTimelineItem;

  // Normalize structure
  if (item.company) {
    normalized = item as NormalizedTimelineItem;
  } else if (item.organization) {
    // Migrate from old organization format
    normalized = {
      ...item,
      company: item.organization.name,
      companyDescription: item.organization.description,
      logo: item.organization.logo,
      location: item.organization.location,
      link: item.organization.link,
    } as NormalizedTimelineItem;
  } else {
    // Fallback (shouldn't happen with validation)
    normalized = {
      ...item,
      company: 'Unknown',
      logo: '/images/placeholder.png',
      location: 'Unknown',
    } as NormalizedTimelineItem;
  }

  // Normalize dates (convert numbers to strings)
  if (normalized.dates) {
    normalized.dates = {
      from: normalized.dates.from != null ? String(normalized.dates.from) : undefined,
      to: normalized.dates.to != null ? String(normalized.dates.to) : undefined,
    };
  }

  return normalized;
}

/**
 * Normalize all timeline items in tabs
 */
function normalizePortfolioData(tabs: Tab[]): NormalizedTab[] {
  return tabs.map(tab => ({
    ...tab,
    items: (tab.items || []).map(normalizeTimelineItem),
  }));
}

// ============================================================================
// Data Loading Functions
// ============================================================================

/**
 * Load from split YAML structure (portfolio.yaml + tabs/)
 */
async function loadSplitYaml(
  portfolioPath: string,
  tabsDir: string
): Promise<NormalizedPortfolio> {
  // 1. Load portfolio.yaml (contains hero, metadata, footer, theme, resume)
  const portfolioData = yaml.load(await fs.promises.readFile(portfolioPath, 'utf8')) as Portfolio;

  // 2. Load all tab files from tabs/
  const tabs: NormalizedTab[] = [];
  const tabFiles = await fs.promises.readdir(tabsDir);

  for (const filename of tabFiles) {
    if (!filename.endsWith('.yaml')) continue;

    const tabId = filename.replace('.yaml', '');
    const tabPath = path.join(tabsDir, filename);
    const tabData = yaml.load(await fs.promises.readFile(tabPath, 'utf8')) as TabFile;

    tabs.push({
      id: tabId,
      label: tabData.label,
      resumeMaxItems: tabData.resumeMaxItems,
      items: (tabData.items || []).map(normalizeTimelineItem),
    });
  }

  // Sort tabs by common order
  const tabOrder = ['experience', 'education', 'projects', 'courses'];
  tabs.sort((a, b) => {
    const aIndex = tabOrder.indexOf(a.id);
    const bIndex = tabOrder.indexOf(b.id);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Combine portfolio data with loaded tabs
  return {
    hero: portfolioData.hero,
    metadata: portfolioData.metadata,
    footer: portfolioData.footer,
    theme: portfolioData.theme,
    resume: portfolioData.resume,
    tabs,
  };
}

/**
 * Load from monolithic portfolio.yaml (backward compatibility)
 */
async function loadMonolithicYaml(): Promise<NormalizedPortfolio> {
  const filePath = path.join(DATA_DIR, 'portfolio.yaml');
  const fileContents = await fs.promises.readFile(filePath, 'utf8');
  const rawData = yaml.load(fileContents);

  // Validate in development only (catch YAML errors early)
  let validatedData: Portfolio;
  if (process.env.NODE_ENV === 'development') {
    validatedData = validatePortfolio(rawData);
  } else {
    validatedData = rawData as Portfolio;
  }

  // Normalize structure and dates
  const tabs: NormalizedTab[] = validatedData.tabs
    ? normalizePortfolioData(validatedData.tabs)
    : [];

  // Return data with defaults for missing fields
  return {
    hero: validatedData.hero || DEFAULT_PORTFOLIO.hero,
    tabs,
    footer: validatedData.footer,
    theme: validatedData.theme || DEFAULT_PORTFOLIO.theme,
    resume: validatedData.resume,
  };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Load portfolio from split YAML files
 * Structure: portfolio.yaml (config) + tabs/*.yaml (tab data)
 */
export async function fetchPortfolio(): Promise<NormalizedPortfolio> {
  try {
    const portfolioPath = path.join(DATA_DIR, 'portfolio.yaml');
    const tabsDir = path.join(DATA_DIR, 'tabs');

    // Check if split structure exists (portfolio.yaml + tabs/)
    const hasSplitStructure = fs.existsSync(portfolioPath) && fs.existsSync(tabsDir);

    if (hasSplitStructure) {
      console.log('Loading from portfolio.yaml + tabs/...');
      return await loadSplitYaml(portfolioPath, tabsDir);
    } else {
      console.log('Loading from monolithic portfolio.yaml...');
      return await loadMonolithicYaml();
    }
  } catch (e) {
    console.error('Error loading portfolio data:', e);
    console.warn('Using default portfolio configuration');
    return {
      ...DEFAULT_PORTFOLIO,
      tabs: [],
    } as NormalizedPortfolio;
  }
}
