export interface Portfolio<T = TimelineItem> {
  hero?: Hero;
  tabs?: Tab<T>[];
  footer?: Footer;
  theme?: ThemeConfig;
  metadata?: SiteMetadata;
  resume?: ResumeSection;
}

export interface ResumeSection {
  subtitle?: string;
  'left-section'?: {
    summary?: string[];
    technicalSkills?: string[];
    softSkills?: string[];
    languages?: Language[];
  };
}

export interface TechnicalSkillGroup {
  category: string;
  skills: string[];
}

export interface Language {
  name: string;
  level: string;
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
  label: string;
  resumeMaxItems?: number; // Optional limit for resume rendering (e.g., 3 for projects)
  items: T[];
}

export interface TimelineItem {
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
  resumeMaxItems?: number;
  items: TimelineItem[];
}
