import React from 'react';
import { Palette, RotateCcw } from 'lucide-react';
import { useCmsConfigEditor } from '../lib/useCmsConfigEditor';
import { ACCENT_PALETTES, BACKGROUND_PRESETS } from '../lib/appearance';
import { DEFAULT_CMS_CONFIG } from '../data/defaultCmsConfig';
import { CmsActionToolbar } from '../components/admin/CmsActionToolbar';
import { CmsLivePreviewModal } from '../components/admin/CmsLivePreviewModal';
import { CmsAppearanceConfig } from '../types';

export const AdminAppearance: React.FC = () => {
  const {
    sectionState: appearance,
    setSectionState: setAppearance,
    hasDraft,
    hasPrev,
    isDirty,
    savingAction,
    notice,
    previewOpen,
    openPreview,
    closePreview,
    handleSaveDraft,
    handlePublish,
    handleDiscardDraft,
    handleRestorePrevious,
  } = useCmsConfigEditor('appearance');

  const accentHex = ACCENT_PALETTES[appearance.accentPrimary]?.hex || '#2563eb';
  const bgPreset = BACKGROUND_PRESETS[appearance.backgroundPreset] || BACKGROUND_PRESETS.obsidian;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appearance &amp; Theme Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Customize colors, contrast-safe background surfaces, typography pairings, card/button styles, spacing, and motion safely.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAppearance(DEFAULT_CMS_CONFIG.appearance)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-blue-500 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Original Style</span>
        </button>
      </div>

      <CmsActionToolbar
        hasDraft={hasDraft}
        hasPrev={hasPrev}
        isDirty={isDirty}
        savingAction={savingAction}
        notice={notice}
        onSaveDraft={handleSaveDraft}
        onPreview={openPreview}
        onPublish={() => handlePublish()}
        onDiscardDraft={handleDiscardDraft}
        onRestorePrevious={handleRestorePrevious}
      />

      {/* Quick Live Token Preview Strip */}
      <div
        className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundColor: appearance.defaultTheme === 'dark' ? bgPreset.darkBg : bgPreset.lightBg,
          color: appearance.defaultTheme === 'dark' ? '#f1f5f9' : '#0f172a',
          fontFamily: `'${appearance.fontBody}', sans-serif`,
        }}
      >
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono" style={{ color: accentHex }}>
            <Palette className="w-3.5 h-3.5" />
            <span>Live Theme Token Preview</span>
          </span>
          <h3
            className="text-lg font-extrabold"
            style={{ fontFamily: `'${appearance.fontHeading}', sans-serif` }}
          >
            Rushikesh Toge — {appearance.fontHeading} / {appearance.fontBody}
          </h3>
          <p className="text-xs opacity-80">
            Background: {bgPreset.label} · Radius: {appearance.borderRadius} · Card: {appearance.cardStyle}
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2 text-xs font-semibold text-white rounded-xl self-start sm:self-auto"
          style={{ backgroundColor: accentHex }}
        >
          Sample Primary CTA
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colors & Surfaces */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-bold border-b border-slate-200 dark:border-slate-800 pb-3">
            Colors, Theme &amp; Surfaces
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono mb-1">Default Visitor Theme</label>
              <select
                value={appearance.defaultTheme}
                onChange={(e) =>
                  setAppearance({ ...appearance, defaultTheme: e.target.value as 'dark' | 'light' })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono mb-1">Background Palette</label>
              <select
                value={appearance.backgroundPreset}
                onChange={(e) =>
                  setAppearance({
                    ...appearance,
                    backgroundPreset: e.target.value as CmsAppearanceConfig['backgroundPreset'],
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              >
                {Object.entries(BACKGROUND_PRESETS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono mb-2">Primary Accent Color</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(Object.keys(ACCENT_PALETTES) as CmsAppearanceConfig['accentPrimary'][]).map((key) => {
                const pal = ACCENT_PALETTES[key];
                const active = appearance.accentPrimary === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAppearance({ ...appearance, accentPrimary: key })}
                    className={`p-2 rounded-xl border text-xs font-mono capitalize flex flex-col items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-slate-50 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full" style={{ backgroundColor: pal.hex }} />
                    <span>{key}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono mb-1">Secondary Accent</label>
              <select
                value={appearance.accentSecondary}
                onChange={(e) =>
                  setAppearance({
                    ...appearance,
                    accentSecondary: e.target.value as CmsAppearanceConfig['accentSecondary'],
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs capitalize"
              >
                {(['cyan', 'blue', 'violet', 'emerald', 'sky', 'slate'] as const).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono mb-1">Surface Style</label>
              <select
                value={appearance.surfaceStyle}
                onChange={(e) =>
                  setAppearance({
                    ...appearance,
                    surfaceStyle: e.target.value as CmsAppearanceConfig['surfaceStyle'],
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs capitalize"
              >
                <option value="clean">Clean Solid</option>
                <option value="tinted">Tinted</option>
                <option value="glass">Translucent Glass</option>
              </select>
            </div>
          </div>
        </div>

        {/* Typography & Layout Tokens */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-bold border-b border-slate-200 dark:border-slate-800 pb-3">
            Typography, Shape &amp; Motion
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono mb-1">Heading Font</label>
              <select
                value={appearance.fontHeading}
                onChange={(e) =>
                  setAppearance({
                    ...appearance,
                    fontHeading: e.target.value as CmsAppearanceConfig['fontHeading'],
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                <option value="Outfit">Outfit</option>
                <option value="Space Grotesk">Space Grotesk</option>
                <option value="Manrope">Manrope</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono mb-1">Body Font</label>
              <select
                value={appearance.fontBody}
                onChange={(e) =>
                  setAppearance({
                    ...appearance,
                    fontBody: e.target.value as CmsAppearanceConfig['fontBody'],
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                <option value="Inter">Inter</option>
                <option value="DM Sans">DM Sans</option>
                <option value="Manrope">Manrope</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono mb-1">Border Radius</label>
              <select
                value={appearance.borderRadius}
                onChange={(e) =>
                  setAppearance({
                    ...appearance,
                    borderRadius: e.target.value as CmsAppearanceConfig['borderRadius'],
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <option value="sm">Subtle (rounded-lg)</option>
                <option value="md">Medium (rounded-xl)</option>
                <option value="xl">Modern (rounded-2xl)</option>
                <option value="2xl">Pill-Soft Cards (rounded-3xl)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono mb-1">Card Surface Style</label>
              <select
                value={appearance.cardStyle}
                onChange={(e) =>
                  setAppearance({
                    ...appearance,
                    cardStyle: e.target.value as CmsAppearanceConfig['cardStyle'],
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <option value="bordered">Clean Bordered</option>
                <option value="elevated">Elevated Shadow</option>
                <option value="glass">Glassmorphic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono mb-1">Section Vertical Spacing</label>
              <select
                value={appearance.sectionSpacing}
                onChange={(e) =>
                  setAppearance({
                    ...appearance,
                    sectionSpacing: e.target.value as CmsAppearanceConfig['sectionSpacing'],
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable (Default)</option>
                <option value="airy">Airy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono mb-1">Container Max Width</label>
              <select
                value={appearance.containerWidth}
                onChange={(e) =>
                  setAppearance({
                    ...appearance,
                    containerWidth: e.target.value as CmsAppearanceConfig['containerWidth'],
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <option value="max-w-5xl">Focused (1024px)</option>
                <option value="max-w-6xl">Balanced (1152px)</option>
                <option value="max-w-7xl">Wide (1280px Default)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-5 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={appearance.animationsEnabled !== false}
                onChange={(e) =>
                  setAppearance({ ...appearance, animationsEnabled: e.target.checked })
                }
              />
              <span>Enable Subtle Motion Animations</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={appearance.backgroundEffects !== false}
                onChange={(e) =>
                  setAppearance({ ...appearance, backgroundEffects: e.target.checked })
                }
              />
              <span>Enable Hero Ambient Glow</span>
            </label>
          </div>
        </div>
      </div>

      <CmsLivePreviewModal isOpen={previewOpen} onClose={closePreview} />
    </div>
  );
};
