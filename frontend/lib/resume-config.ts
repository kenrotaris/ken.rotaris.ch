/**
 * Resume PDF Configuration - ATS-Friendly
 * All constants and configurable values in one place
 *
 * ATS-FRIENDLY DESIGN PRINCIPLES:
 * - Single column layout (no sidebars)
 * - Standard section names (Summary, Experience, Projects, Education, Skills, Languages)
 * - Plain text hierarchy (no decorative backgrounds)
 * - Linear top-to-bottom reading order
 * - Minimal visual styling, maximum parsability
 */

export const RESUME_CONFIG = {
  // Content limits
  limits: {
    maxProjects: 5,
  },

  // Section titles - ATS standard names (do not change!)
  sections: {
    summary: 'Summary',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    skills: 'Skills',
    languages: 'Languages',
  },

  // Color palette (minimal for ATS compatibility)
  colors: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },

  // Typography - sized for readability and ATS parsing
  typography: {
    fontSizes: {
      h1: 20,  // Name
      h2: 11,  // Title
      h3: 10,  // Section headings and company names
      body: 9,  // Main content
      small: 8, // Dates, locations, tech stacks
    },
    spacing: {
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      xxl: 20,
      xxxl: 24,
    },
  },
} as const;
