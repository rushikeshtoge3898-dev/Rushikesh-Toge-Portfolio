import type { CSSProperties } from 'react';
import { CmsAppearanceConfig } from '../types';
import { DEFAULT_CMS_CONFIG } from '../data/defaultCmsConfig';

export const ACCENT_PALETTES: Record<
  CmsAppearanceConfig['accentPrimary'],
  { hex: string; hoverHex: string; softBg: string; border: string; textLight: string; textDark: string }
> = {
  blue: {
    hex: '#2563eb',
    hoverHex: '#3b82f6',
    softBg: 'rgba(37, 99, 235, 0.10)',
    border: 'rgba(59, 130, 246, 0.35)',
    textLight: '#2563eb',
    textDark: '#60a5fa',
  },
  cyan: {
    hex: '#0891b2',
    hoverHex: '#06b6d4',
    softBg: 'rgba(8, 145, 178, 0.10)',
    border: 'rgba(6, 182, 212, 0.35)',
    textLight: '#0e7490',
    textDark: '#22d3ee',
  },
  emerald: {
    hex: '#059669',
    hoverHex: '#10b981',
    softBg: 'rgba(5, 150, 105, 0.10)',
    border: 'rgba(16, 185, 129, 0.35)',
    textLight: '#047857',
    textDark: '#34d399',
  },
  indigo: {
    hex: '#4f46e5',
    hoverHex: '#6366f1',
    softBg: 'rgba(79, 70, 229, 0.10)',
    border: 'rgba(99, 102, 241, 0.35)',
    textLight: '#4338ca',
    textDark: '#818cf8',
  },
  amber: {
    hex: '#d97706',
    hoverHex: '#f59e0b',
    softBg: 'rgba(217, 119, 6, 0.10)',
    border: 'rgba(245, 158, 11, 0.35)',
    textLight: '#b45309',
    textDark: '#fbbf24',
  },
  rose: {
    hex: '#e11d48',
    hoverHex: '#f43f5e',
    softBg: 'rgba(225, 29, 72, 0.10)',
    border: 'rgba(244, 63, 94, 0.35)',
    textLight: '#be123c',
    textDark: '#fb7185',
  },
};

export const BACKGROUND_PRESETS: Record<
  CmsAppearanceConfig['backgroundPreset'],
  { darkBg: string; darkSurface: string; lightBg: string; lightSurface: string; label: string }
> = {
  obsidian: {
    label: 'Obsidian Navy (Default)',
    darkBg: '#060913',
    darkSurface: '#0f172a',
    lightBg: '#f8fafc',
    lightSurface: '#ffffff',
  },
  midnight: {
    label: 'Midnight Slate',
    darkBg: '#090d1a',
    darkSurface: '#111827',
    lightBg: '#f1f5f9',
    lightSurface: '#ffffff',
  },
  slate: {
    label: 'Deep Graphite',
    darkBg: '#0b0f17',
    darkSurface: '#141b29',
    lightBg: '#f4f6fa',
    lightSurface: '#ffffff',
  },
  carbon: {
    label: 'Carbon Black',
    darkBg: '#050608',
    darkSurface: '#101218',
    lightBg: '#fafafa',
    lightSurface: '#ffffff',
  },
};

const FONT_GOOGLE_QUERY: Record<string, string> = {
  'Plus Jakarta Sans': 'Plus+Jakarta+Sans:wght@400;500;600;700;800',
  Inter: 'Inter:wght@400;500;600;700;800',
  'DM Sans': 'DM+Sans:wght@400;500;600;700',
  Manrope: 'Manrope:wght@400;500;600;700;800',
  Outfit: 'Outfit:wght@500;600;700;800',
  'Space Grotesk': 'Space+Grotesk:wght@500;600;700',
};

export function ensureGoogleFontsLoaded(
  fontBody: CmsAppearanceConfig['fontBody'],
  fontHeading: CmsAppearanceConfig['fontHeading']
) {
  if (typeof document === 'undefined') return;
  const families = new Set<string>([fontBody, fontHeading]);
  const queries = Array.from(families)
    .map((f) => FONT_GOOGLE_QUERY[f])
    .filter(Boolean);
  if (queries.length === 0) return;

  const href = `https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&${queries
    .map((q) => `family=${q}`)
    .join('&')}&display=swap`;

  let linkEl = document.getElementById('cms-dynamic-fonts') as HTMLLinkElement | null;
  if (!linkEl) {
    linkEl = document.createElement('link');
    linkEl.id = 'cms-dynamic-fonts';
    linkEl.rel = 'stylesheet';
    document.head.appendChild(linkEl);
  }
  if (linkEl.href !== href) {
    linkEl.href = href;
  }
}

export function getContainerClass(width?: CmsAppearanceConfig['containerWidth']): string {
  switch (width) {
    case 'max-w-5xl':
      return 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8';
    case 'max-w-6xl':
      return 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8';
    default:
      return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
  }
}

export function getSectionPaddingClass(
  globalSpacing?: CmsAppearanceConfig['sectionSpacing'],
  sectionSpacing?: 'compact' | 'normal' | 'relaxed'
): string {
  if (sectionSpacing === 'compact' || (!sectionSpacing && globalSpacing === 'compact')) {
    return 'py-12 md:py-16';
  }
  if (sectionSpacing === 'relaxed' || (!sectionSpacing && globalSpacing === 'airy')) {
    return 'py-20 md:py-28';
  }
  return 'py-16 md:py-24';
}

export function getRadiusClass(radius?: CmsAppearanceConfig['borderRadius']): string {
  switch (radius) {
    case 'sm':
      return 'rounded-lg';
    case 'md':
      return 'rounded-xl';
    case '2xl':
      return 'rounded-3xl';
    default:
      return 'rounded-2xl';
  }
}

export function getCardStyleClass(cardStyle?: CmsAppearanceConfig['cardStyle']): string {
  switch (cardStyle) {
    case 'elevated':
      return 'bg-white dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-900/5 dark:shadow-black/30';
    case 'glass':
      return 'bg-white/80 dark:bg-slate-900/65 backdrop-blur-md border border-slate-200/70 dark:border-slate-700/50 shadow-sm';
    default:
      return 'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800';
  }
}

export function applyAppearanceVariables(
  appearance: CmsAppearanceConfig | undefined,
  isDark: boolean
): CSSProperties {
  const cfg = appearance || DEFAULT_CMS_CONFIG.appearance;
  const accent = ACCENT_PALETTES[cfg.accentPrimary] || ACCENT_PALETTES.blue;
  const secondary = ACCENT_PALETTES[cfg.accentSecondary] || ACCENT_PALETTES.cyan;
  const bg = BACKGROUND_PRESETS[cfg.backgroundPreset] || BACKGROUND_PRESETS.obsidian;

  ensureGoogleFontsLoaded(cfg.fontBody, cfg.fontHeading);

  return {
    ['--cms-accent' as string]: accent.hex,
    ['--cms-accent-hover' as string]: accent.hoverHex,
    ['--cms-accent-text' as string]: isDark ? accent.textDark : accent.textLight,
    ['--cms-accent-soft' as string]: accent.softBg,
    ['--cms-accent-border' as string]: accent.border,
    ['--cms-accent-secondary' as string]: secondary.hex,
    ['--cms-bg' as string]: isDark ? bg.darkBg : bg.lightBg,
    ['--cms-surface' as string]: isDark ? bg.darkSurface : bg.lightSurface,
    ['--cms-font-body' as string]: `'${cfg.fontBody}', 'Plus Jakarta Sans', system-ui, sans-serif`,
    ['--cms-font-heading' as string]: `'${cfg.fontHeading}', '${cfg.fontBody}', system-ui, sans-serif`,
    fontFamily: `'${cfg.fontBody}', 'Plus Jakarta Sans', system-ui, sans-serif`,
    backgroundColor: isDark ? bg.darkBg : bg.lightBg,
  };
}
