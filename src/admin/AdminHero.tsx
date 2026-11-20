import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, Sparkles } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useCmsConfigEditor } from '../lib/useCmsConfigEditor';
import { CmsActionToolbar } from '../components/admin/CmsActionToolbar';
import { MediaPickerModal } from '../components/admin/MediaPickerModal';
import { CmsLivePreviewModal } from '../components/admin/CmsLivePreviewModal';

export const AdminHero: React.FC = () => {
  const { resolveUrl, resolvedProfilePhotoUrl } = usePortfolio();
  const {
    sectionState: hero,
    setSectionState: setHero,
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
  } = useCmsConfigEditor('hero');

  const [mediaOpen, setMediaOpen] = useState(false);
  const [newPhrase, setNewPhrase] = useState('');

  const effectivePhotoPreview = resolveUrl(hero.photoOverrideUrl) || resolvedProfilePhotoUrl;

  const addPhrase = () => {
    const val = newPhrase.trim();
    if (!val) return;
    setHero({ ...hero, animatedPhrases: [...(hero.animatedPhrases || []), val] });
    setNewPhrase('');
  };

  const removePhrase = (idx: number) => {
    setHero({
      ...hero,
      animatedPhrases: (hero.animatedPhrases || []).filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hero Section Manager</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Customize your hero heading, subtitle, introduction, CTAs, availability badge, rotating phrases, and hero image.
        </p>
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

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold">Hero Visibility &amp; Status</h2>
            <p className="text-xs text-slate-500">Toggle whether the Hero section appears on the public portfolio.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={hero.visible !== false}
              onChange={(e) => setHero({ ...hero, visible: e.target.checked })}
            />
            <span>Show Hero Section</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono mb-1">Top Kicker Badge</label>
            <input
              type="text"
              maxLength={120}
              value={hero.kicker}
              onChange={(e) => setHero({ ...hero, kicker: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Availability Status Text (Optional)</label>
            <input
              type="text"
              maxLength={120}
              placeholder="e.g. Open to Summer 2026 Internships"
              value={hero.availabilityText}
              onChange={(e) => setHero({ ...hero, availabilityText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Main Heading / Name Display</label>
            <input
              type="text"
              maxLength={120}
              value={hero.headingName}
              onChange={(e) => setHero({ ...hero, headingName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Professional Subtitle</label>
            <input
              type="text"
              maxLength={200}
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">Background Tagline / Institution Line</label>
            <input
              type="text"
              maxLength={240}
              value={hero.backgroundTagline}
              onChange={(e) => setHero({ ...hero, backgroundTagline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">Introduction Text</label>
            <textarea
              rows={3}
              maxLength={1200}
              value={hero.introText}
              onChange={(e) => setHero({ ...hero, introText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          {/* CTAs */}
          <div>
            <label className="block text-xs font-mono mb-1">Primary Button Text</label>
            <input
              type="text"
              maxLength={60}
              value={hero.primaryCtaLabel}
              onChange={(e) => setHero({ ...hero, primaryCtaLabel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono mb-1">Primary Button Destination</label>
            <input
              type="text"
              maxLength={300}
              value={hero.primaryCtaHref}
              onChange={(e) => setHero({ ...hero, primaryCtaHref: e.target.value })}
              placeholder="#projects"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Secondary Button Text</label>
            <input
              type="text"
              maxLength={60}
              value={hero.secondaryCtaLabel}
              onChange={(e) => setHero({ ...hero, secondaryCtaLabel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono mb-1">Secondary Button Destination</label>
            <input
              type="text"
              maxLength={300}
              value={hero.secondaryCtaHref}
              onChange={(e) => setHero({ ...hero, secondaryCtaHref: e.target.value })}
              placeholder="#contact"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Resume Button Text</label>
            <input
              type="text"
              maxLength={60}
              value={hero.resumeButtonLabel}
              onChange={(e) => setHero({ ...hero, resumeButtonLabel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>
        </div>

        {/* Hero Image Override */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider">Hero Profile Image Override</h3>
              <p className="text-xs text-slate-500">
                Leave empty to automatically use your main Profile Picture.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMediaOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Choose / Upload Image</span>
              </button>
              {hero.photoOverrideUrl && (
                <button
                  type="button"
                  onClick={() => setHero({ ...hero, photoOverrideUrl: '' })}
                  className="text-xs text-red-500 font-semibold cursor-pointer"
                >
                  Use Default Profile Photo
                </button>
              )}
            </div>
          </div>

          {effectivePhotoPreview && (
            <div className="flex items-center gap-3">
              <img
                src={effectivePhotoPreview}
                alt="Hero avatar preview"
                className="w-16 h-16 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <span className="text-xs font-mono text-slate-500">
                {hero.photoOverrideUrl ? 'Custom Hero Image active' : 'Using default Profile Photo'}
              </span>
            </div>
          )}
        </div>

        {/* Animated / Highlight Phrases */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider">
              Highlight / Rotating Phrases (Optional)
            </h3>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Ethical Hacking Enthusiast"
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPhrase();
                }
              }}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
            />
            <button
              type="button"
              onClick={addPhrase}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {(hero.animatedPhrases || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(hero.animatedPhrases || []).map((phrase, idx) => (
                <span
                  key={`${phrase}-${idx}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono"
                >
                  <span>{phrase}</span>
                  <button
                    type="button"
                    onClick={() => removePhrase(idx)}
                    className="text-red-500 hover:text-red-400 cursor-pointer"
                    aria-label="Remove phrase"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <MediaPickerModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        defaultCategory="profile"
        acceptTypes="image"
        title="Select Hero Profile Image"
        onSelect={(url) => setHero({ ...hero, photoOverrideUrl: url })}
      />

      <CmsLivePreviewModal isOpen={previewOpen} onClose={closePreview} />
    </div>
  );
};
