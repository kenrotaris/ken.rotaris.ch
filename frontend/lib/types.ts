export interface Portfolio {
  about: About;
  projects: TimelineItem[];
  experience: TimelineItem[];
  education: TimelineItem[];
  social: Social;
}

export interface About {
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  faviconUrl: string;
  resumeUrl: string;
  email: string;
}

export interface TimelineItem {
  year: string;
  image: string;
  title: string;
  description: string;
  tags: string[];
  link: string | null;
}

export interface Social {
  linkedin: string;
  github: string;
  email: string;
}
