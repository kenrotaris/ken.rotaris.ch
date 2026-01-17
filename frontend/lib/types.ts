export interface Portfolio {
  hero?: Hero;
  tabs?: Tab[];
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
  profileImage?: string;
  faviconUrl?: string;
  resumeUrl?: string;
  email?: string;
}

export interface Tab {
  id: string;
  label: string;
  items: TimelineItem[];
}

export interface TimelineItem {
  organization: Organization;
  role: string;
  dates: Dates;
  summary: string;
  showcasedSkills?: string[];
  accomplishments: string[];
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
  from?: string;
  to?: string;
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
