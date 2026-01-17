import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Portfolio } from './types';
import { DEFAULT_PORTFOLIO } from './config';

export async function fetchPortfolio(): Promise<Portfolio> {
  const filePath = process.env.PORTFOLIO_PATH || path.join(process.cwd(), 'public', 'data', 'portfolio.yaml');

  try {
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    const data = yaml.load(fileContents) as Portfolio;

    // Return data with defaults for missing fields
    return {
      hero: data.hero || DEFAULT_PORTFOLIO.hero,
      tabs: data.tabs || DEFAULT_PORTFOLIO.tabs,
      footer: data.footer,
      theme: data.theme || DEFAULT_PORTFOLIO.theme,
    };
  } catch (e) {
    console.error(`Error reading portfolio data from ${filePath}:`, e);
    console.warn('Using default portfolio configuration');
    return DEFAULT_PORTFOLIO;
  }
}
