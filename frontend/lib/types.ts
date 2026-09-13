export interface Portfolio<T = TimelineItem> {
  /** Directus row id of the settings singleton; absent when loaded from YAML. */
  directusId?: string;
  hero?: Hero;
  tabs?: Tab<T>[];
  footer?: Footer;
  theme?: ThemeConfig;
  metadata?: SiteMetadata;
}

export interface SiteMetadata {
  title?: string;
  description?: string;
  author?: string;
}

export interface ThemeConfig {
  colors: {
    accent: string;
    background?: string;
  };
  timezone?: string;
}

export interface Hero {
  name?: string;
  title?: string;
  bio?: string;
  resumeUrl?: string;
  email?: string;
  website?: string;
}

export interface Tab<T = TimelineItem> {
  id: string;
  /** Directus row id; absent when loaded from YAML. */
  directusId?: string;
  label: string;
  items: T[];
}

export interface TimelineItem {
  /** Directus row id; absent when loaded from YAML. */
  directusId?: string;

  // New flattened structure
  company?: string;
  companyDescription?: string;
  logo?: string;
  location?: string;
  link?: string;

  // Legacy nested structure (deprecated, for backward compatibility)
  organization?: Organization;

  role: string;
  dates?: Dates;
  summary: string;
  showcasedSkills?: string[];
  accomplishments?: string[];
  categories?: {
    label?: string;
    [category: string]: string[] | string | undefined;
  };
}

export interface Organization {
  name: string;
  description?: string;
  logo: string;
  location: string;
  link?: string;
}

export interface Dates {
  from?: string | number;
  to?: string | number;
}

export interface Footer {
  social?: Social;
}

export interface Social {
  linkedin?: string;
  github?: string;
  email?: string;
  ownerName?: string;
}

/**
 * Split YAML structure types
 * Used when loading from multiple YAML files
 */
export interface SiteConfig {
  hero?: Hero;
  metadata?: SiteMetadata;
  footer?: Footer;
  theme?: ThemeConfig;
}

export interface TabFile {
  label: string;
  items: TimelineItem[];
}
