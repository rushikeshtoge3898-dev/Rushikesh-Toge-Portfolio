export type PublishStatus = 'published' | 'draft';
export type ProjectWorkStatus = 'Completed' | 'In Progress' | 'Planned';
export type ThemeMode = 'dark' | 'light';

export type ExperienceKind =
  | 'internship'
  | 'workshop'
  | 'industrial_training'
  | 'professional_experience'
  | 'achievement'
  | 'event'
  | 'volunteering';

export type MediaCategory =
  | 'profile'
  | 'project'
  | 'certificate'
  | 'resume'
  | 'logo'
  | 'seo'
  | 'about'
  | 'general';

export type CmsSectionId =
  | 'hero'
  | 'about'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'education'
  | 'experience'
  | 'activities'
  | 'contact';

export interface EducationSummary {
  degree: string;
  college: string;
  location: string;
  year: string;
  sem1SGPA: number;
  sem2SGPA: number;
  cgpa: number;
}

export interface PortfolioLink {
  label: string;
  url: string;
}

export interface PersonalInfo {
  name: string;
  headline: string;
  subheadline: string;
  intro: string;
  aboutText: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  portfolioLinks?: PortfolioLink[];
  profilePhotoUrl?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  resumeUpdatedAt?: string;
  interests?: string[];
  spokenLanguages?: string[];
  relevantCoursework?: string[];
  educationSummary: EducationSummary;
  defaultTheme?: ThemeMode;
  showExperienceSection?: boolean;
  showWorkshopsSection?: boolean;
  showResumeDownload?: boolean;
}

export interface EducationItem {
  id: string;
  level: string;
  fieldOfStudy?: string;
  institution: string;
  boardOrUniversity?: string;
  year: string;
  startYear?: string;
  endYear?: string;
  scoreLabel: string;
  scoreValue: string;
  description?: string;
  details?: string[];
  institutionLogo?: string;
  supportingDocUrl?: string;
  isCurrent?: boolean;
  status?: PublishStatus;
  order?: number;
}

export interface SkillDetail {
  name: string;
  proficiency?: string;
  description?: string;
  icon?: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  iconName: string;
  skills: string[];
  skillDetails?: SkillDetail[];
  status?: PublishStatus;
  order?: number;
}

export interface Project {
  id: string;
  title: string;
  category?: string;
  isFeatured: boolean;
  shortDescription: string;
  fullDescription: string;
  role?: string;
  keyFeatures: string[];
  technologies: string[];
  personalContribution: string;
  liveDemoUrl?: string;
  githubUrl: string;
  thumbnailUrl?: string;
  galleryImages?: string[];
  projectStatus?: ProjectWorkStatus;
  status?: PublishStatus;
  order?: number;
  isUserAdded?: boolean;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  gradeOrScore?: string;
  badgeType?: string;
  credentialId?: string;
  credentialUrl?: string;
  certificateImage?: string;
  fileType?: 'image' | 'pdf' | 'svg' | 'none';
  description?: string;
  status?: PublishStatus;
  order?: number;
  isUserAdded?: boolean;
}

export interface ExperienceItem {
  id: string;
  kind: ExperienceKind;
  title: string;
  organization: string;
  role?: string;
  domain?: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  workMode?: string;
  credentialId?: string;
  commencementDate?: string;
  completionDate?: string;
  description: string;
  highlights?: string[];
  skillsLearned?: string[];
  technologies?: string[];
  certificateImage?: string;
  verificationUrl?: string;
  organizationLogo?: string;
  isCurrent?: boolean;
  status?: PublishStatus;
  order?: number;
}

export interface InternshipItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  workMode: string;
  internId?: string;
  commencementDate: string;
  completionDate: string;
  description: string;
  keyResponsibilities: string[];
  technologies: string[];
  isCurrent?: boolean;
}

export interface WorkshopActivity {
  id: string;
  title: string;
  organization: string;
  duration: string;
  description: string;
  certificateImage?: string;
  isUserAdded?: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt?: unknown;
}

export interface MediaAsset {
  id: string;
  name: string;
  category: MediaCategory;
  mimeType: string;
  fileType: 'image' | 'pdf' | 'svg';
  url: string;
  storageMode: 'firebase-storage' | 'firestore-asset' | 'server-upload' | 'public-static';
  storagePath?: string;
  size: number;
  createdAt?: unknown;
}

export interface CmsNavItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
  visible: boolean;
  showOnMobile: boolean;
  order: number;
}

export interface CmsFooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface CmsSectionConfig {
  id: CmsSectionId;
  label: string;
  title: string;
  subtitle: string;
  visible: boolean;
  backgroundVariant: 'default' | 'subtle' | 'accent';
  spacing: 'compact' | 'normal' | 'relaxed';
  layoutVariant: 'standard' | 'cards' | 'compact';
}

export interface ResumeVersion {
  id: string;
  label: string;
  url: string;
  fileName: string;
  uploadedAt: string;
  size: number;
}

export interface CmsHeroConfig {
  kicker: string;
  headingName: string;
  subtitle: string;
  introText: string;
  backgroundTagline: string;
  photoOverrideUrl: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  resumeButtonLabel: string;
  availabilityText: string;
  animatedPhrases: string[];
  visible: boolean;
}

export interface CmsAboutConfig {
  heading: string;
  subtitle: string;
  bioCardTitle: string;
  introParagraph: string;
  biography: string;
  careerObjectives: string;
  professionalJourney: string;
  aboutImages: string[];
  visible: boolean;
}

export interface CmsContactConfig {
  heading: string;
  subtitle: string;
  directInfoHeading: string;
  directInfoIntro: string;
  formHeading: string;
  formSubtext: string;
  formVisible: boolean;
  nameLabel: string;
  emailLabel: string;
  subjectLabel: string;
  messageLabel: string;
  submitLabel: string;
}

export interface CmsNavigationConfig {
  brandText: string;
  items: CmsNavItem[];
}

export interface CmsFooterConfig {
  description: string;
  copyrightText: string;
  showSocialLinks: boolean;
  showContactInfo: boolean;
  showFooterNav: boolean;
  footerLinks: CmsFooterLink[];
  visible: boolean;
}

export interface CmsAppearanceConfig {
  defaultTheme: ThemeMode;
  accentPrimary: 'blue' | 'cyan' | 'emerald' | 'indigo' | 'amber' | 'rose';
  accentSecondary: 'cyan' | 'blue' | 'violet' | 'emerald' | 'sky' | 'slate';
  backgroundPreset: 'obsidian' | 'midnight' | 'slate' | 'carbon';
  surfaceStyle: 'clean' | 'tinted' | 'glass';
  textPreset: 'high-contrast' | 'soft';
  fontBody: 'Plus Jakarta Sans' | 'Inter' | 'DM Sans' | 'Manrope';
  fontHeading: 'Plus Jakarta Sans' | 'Outfit' | 'Space Grotesk' | 'Manrope';
  borderRadius: 'sm' | 'md' | 'xl' | '2xl';
  cardStyle: 'bordered' | 'elevated' | 'glass';
  buttonStyle: 'solid' | 'outline' | 'soft';
  sectionSpacing: 'compact' | 'comfortable' | 'airy';
  containerWidth: 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl';
  animationsEnabled: boolean;
  glassIntensity: 'none' | 'subtle' | 'strong';
  backgroundEffects: boolean;
}

export interface CmsLayoutConfig {
  sections: CmsSectionConfig[];
}

export interface CmsSeoConfig {
  title: string;
  description: string;
  keywords: string;
  author: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  faviconUrl: string;
  robots: 'index, follow' | 'noindex, nofollow';
}

export interface CmsGeneralSettings {
  siteName: string;
  siteUrl: string;
  maintenanceNotice: {
    enabled: boolean;
    message: string;
  };
  showExperienceSection: boolean;
  showWorkshopsSection: boolean;
  showResumeDownload: boolean;
  lastUpdatedLabel: string;
}

export interface CmsResumeConfig {
  buttonText: string;
  versions: ResumeVersion[];
}

export interface CmsSiteConfig {
  hero: CmsHeroConfig;
  about: CmsAboutConfig;
  contact: CmsContactConfig;
  navigation: CmsNavigationConfig;
  footer: CmsFooterConfig;
  appearance: CmsAppearanceConfig;
  layout: CmsLayoutConfig;
  seo: CmsSeoConfig;
  settings: CmsGeneralSettings;
  resume: CmsResumeConfig;
  updatedAt?: unknown;
}
