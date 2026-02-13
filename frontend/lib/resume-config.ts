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
      300: '#D1D5DB',  // Borders
      500: '#6B7280',  // Dates, secondary text
      600: '#4B5563',  // Tertiary text
      700: '#374151',  // Body text
      900: '#111827',  // Headings, emphasis
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
      xs: 2,   // Minimal gaps
      sm: 4,   // Small gaps
      md: 8,   // Medium gaps
      lg: 12,  // Section spacing
      xl: 16,  // Header padding
      xxxl: 24, // Page padding
    },
  },
} as const;
