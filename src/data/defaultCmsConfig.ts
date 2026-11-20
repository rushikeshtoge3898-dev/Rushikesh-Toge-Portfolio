import { CmsSiteConfig } from '../types';
import { personalInfo } from './portfolioData';

export const DEFAULT_CMS_CONFIG: CmsSiteConfig = {
  hero: {
    kicker: 'Security & Engineering',
    headingName: personalInfo.name,
    subtitle: personalInfo.headline,
    introText: personalInfo.intro,
    backgroundTagline: personalInfo.subheadline,
    photoOverrideUrl: '',
    primaryCtaLabel: 'View My Projects',
    primaryCtaHref: '#projects',
    secondaryCtaLabel: 'Contact Me',
    secondaryCtaHref: '#contact',
    resumeButtonLabel: 'Download Resume',
    availabilityText: '',
    animatedPhrases: [],
    visible: true,
  },
  about: {
    heading: 'About Me',
    subtitle: 'Background, Technical Focus & Career Goals',
    bioCardTitle: 'Computer Engineering Undergraduate',
    introParagraph: '',
    biography: personalInfo.aboutText,
    careerObjectives: '',
    professionalJourney: '',
    aboutImages: [],
    visible: true,
  },
  contact: {
    heading: 'Contact Me',
    subtitle: 'Open to Internships, Security & Engineering Collaboration',
    directInfoHeading: 'Direct Information',
    directInfoIntro:
      'Send a message using the form or reach out directly via email, phone, GitHub, or LinkedIn.',
    formHeading: 'Send a Message',
    formSubtext: "Messages are delivered securely to Rushikesh's inbox.",
    formVisible: true,
    nameLabel: 'Name *',
    emailLabel: 'Email *',
    subjectLabel: 'Subject *',
    messageLabel: 'Message *',
    submitLabel: 'Send Message',
  },
  navigation: {
    brandText: 'RT',
    items: [
      { id: 'nav-home', label: 'Home', href: '#home', isExternal: false, visible: true, showOnMobile: true, order: 1 },
      { id: 'nav-about', label: 'About', href: '#about', isExternal: false, visible: true, showOnMobile: true, order: 2 },
      { id: 'nav-skills', label: 'Skills', href: '#skills', isExternal: false, visible: true, showOnMobile: true, order: 3 },
      { id: 'nav-projects', label: 'Projects', href: '#projects', isExternal: false, visible: true, showOnMobile: true, order: 4 },
      { id: 'nav-certifications', label: 'Certifications', href: '#certifications', isExternal: false, visible: true, showOnMobile: true, order: 5 },
      { id: 'nav-education', label: 'Education', href: '#education', isExternal: false, visible: true, showOnMobile: true, order: 6 },
      { id: 'nav-contact', label: 'Contact', href: '#contact', isExternal: false, visible: true, showOnMobile: true, order: 7 },
    ],
  },
  footer: {
    description: personalInfo.headline,
    copyrightText: `${personalInfo.name}. All rights reserved.`,
    showSocialLinks: true,
    showContactInfo: false,
    showFooterNav: false,
    footerLinks: [
      { label: 'About', href: '#about', isExternal: false },
      { label: 'Projects', href: '#projects', isExternal: false },
      { label: 'Certifications', href: '#certifications', isExternal: false },
      { label: 'Contact', href: '#contact', isExternal: false },
    ],
    visible: true,
  },
  appearance: {
    defaultTheme: 'dark',
    accentPrimary: 'blue',
    accentSecondary: 'cyan',
    backgroundPreset: 'obsidian',
    surfaceStyle: 'clean',
    textPreset: 'high-contrast',
    fontBody: 'Plus Jakarta Sans',
    fontHeading: 'Plus Jakarta Sans',
    borderRadius: 'xl',
    cardStyle: 'bordered',
    buttonStyle: 'solid',
    sectionSpacing: 'comfortable',
    containerWidth: 'max-w-7xl',
    animationsEnabled: true,
    glassIntensity: 'subtle',
    backgroundEffects: true,
  },
  layout: {
    sections: [
      {
        id: 'hero',
        label: 'Hero Section',
        title: personalInfo.name,
        subtitle: personalInfo.headline,
        visible: true,
        backgroundVariant: 'default',
        spacing: 'normal',
        layoutVariant: 'standard',
      },
      {
        id: 'about',
        label: 'About Me',
        title: 'About Me',
        subtitle: 'Background, Technical Focus & Career Goals',
        visible: true,
        backgroundVariant: 'default',
        spacing: 'normal',
        layoutVariant: 'standard',
      },
      {
        id: 'skills',
        label: 'Technical Skills',
        title: 'Technical Skills',
        subtitle: 'Categorized Programming & Computer Science Foundations',
        visible: true,
        backgroundVariant: 'default',
        spacing: 'normal',
        layoutVariant: 'standard',
      },
      {
        id: 'projects',
        label: 'Projects',
        title: 'Projects',
        subtitle: 'Featured Platform & Software Engineering Work',
        visible: true,
        backgroundVariant: 'default',
        spacing: 'normal',
        layoutVariant: 'standard',
      },
      {
        id: 'certifications',
        label: 'Certifications & Credentials',
        title: 'Certifications & Credentials',
        subtitle: 'Verified Technical, Academic & Professional Credentials',
        visible: true,
        backgroundVariant: 'default',
        spacing: 'normal',
        layoutVariant: 'standard',
      },
      {
        id: 'education',
        label: 'Education',
        title: 'Education',
        subtitle: 'Academic Background, Scores & Core CS Coursework',
        visible: true,
        backgroundVariant: 'default',
        spacing: 'normal',
        layoutVariant: 'standard',
      },
      {
        id: 'experience',
        label: 'Experience & Internships',
        title: 'Internship Experience',
        subtitle: 'Industry Mentorship & Practical Software Engineering',
        visible: true,
        backgroundVariant: 'default',
        spacing: 'normal',
        layoutVariant: 'standard',
      },
      {
        id: 'activities',
        label: 'Workshops, Training & Co-Curriculars',
        title: 'Workshops, Training & Achievements',
        subtitle: 'Hands-On Industrial Training, Workshops & Co-Curricular Exposure',
        visible: true,
        backgroundVariant: 'default',
        spacing: 'normal',
        layoutVariant: 'standard',
      },
      {
        id: 'contact',
        label: 'Contact Section',
        title: 'Contact Me',
        subtitle: 'Open to Internships, Security & Engineering Collaboration',
        visible: true,
        backgroundVariant: 'default',
        spacing: 'normal',
        layoutVariant: 'standard',
      },
    ],
  },
  seo: {
    title: 'Rushikesh Toge | Computer Engineering & Cybersecurity Portfolio',
    description:
      'Portfolio of Rushikesh Toge, a Computer Engineering student at DYPCOEI Pune focused on cybersecurity, full-stack web development, AI, and CareerNest.',
    keywords:
      'Rushikesh Toge, Computer Engineering, Cybersecurity, Software Developer, Web Development, C++, Python, Flask, CareerNest, Pune',
    author: 'Rushikesh Toge',
    ogTitle: 'Rushikesh Toge | Computer Engineering & Cybersecurity Portfolio',
    ogDescription:
      'Computer Engineering student from Pune building CareerNest and exploring cybersecurity, ethical hacking, AI, and full-stack software development.',
    ogImage: '',
    canonicalUrl: '',
    faviconUrl: '/favicon.svg',
    robots: 'index, follow',
  },
  settings: {
    siteName: 'Rushikesh Toge Portfolio',
    siteUrl: '',
    maintenanceNotice: {
      enabled: false,
      message: '',
    },
    showExperienceSection: true,
    showWorkshopsSection: true,
    showResumeDownload: true,
    lastUpdatedLabel: '',
  },
  resume: {
    buttonText: 'Download Resume',
    versions: [],
  },
};

export function mergeCmsConfig(
  base: CmsSiteConfig,
  partial?: Partial<CmsSiteConfig> | null
): CmsSiteConfig {
  if (!partial) return base;
  return {
    hero: { ...base.hero, ...(partial.hero || {}) },
    about: { ...base.about, ...(partial.about || {}) },
    contact: { ...base.contact, ...(partial.contact || {}) },
    navigation: {
      brandText: partial.navigation?.brandText ?? base.navigation.brandText,
      items:
        Array.isArray(partial.navigation?.items) && partial.navigation.items.length > 0
          ? partial.navigation.items
          : base.navigation.items,
    },
    footer: { ...base.footer, ...(partial.footer || {}) },
    appearance: { ...base.appearance, ...(partial.appearance || {}) },
    layout: {
      sections:
        Array.isArray(partial.layout?.sections) && partial.layout.sections.length > 0
          ? mergeSections(base.layout.sections, partial.layout.sections)
          : base.layout.sections,
    },
    seo: { ...base.seo, ...(partial.seo || {}) },
    settings: {
      ...base.settings,
      ...(partial.settings || {}),
      maintenanceNotice: {
        ...base.settings.maintenanceNotice,
        ...(partial.settings?.maintenanceNotice || {}),
      },
    },
    resume: {
      ...base.resume,
      ...(partial.resume || {}),
      versions: Array.isArray(partial.resume?.versions)
        ? partial.resume.versions
        : base.resume.versions,
    },
    updatedAt: partial.updatedAt,
  };
}

function mergeSections(
  defaults: CmsSiteConfig['layout']['sections'],
  saved: CmsSiteConfig['layout']['sections']
) {
  const byId = new Map(saved.map((s) => [s.id, s]));
  const ordered = saved.filter((s) => defaults.some((d) => d.id === s.id));
  const missing = defaults.filter((d) => !byId.has(d.id));
  return [...ordered, ...missing].map((sec) => {
    const def = defaults.find((d) => d.id === sec.id)!;
    return { ...def, ...sec };
  });
}
