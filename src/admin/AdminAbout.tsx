import React, { useState } from 'react';
import { Image as ImageIcon, Trash2, Plus } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useCmsConfigEditor } from '../lib/useCmsConfigEditor';
import { saveProfile } from '../lib/portfolioService';
import { CmsActionToolbar } from '../components/admin/CmsActionToolbar';
import { MediaPickerModal } from '../components/admin/MediaPickerModal';
import { CmsLivePreviewModal } from '../components/admin/CmsLivePreviewModal';

export const AdminAbout: React.FC = () => {
  const { profile, resolveUrl } = usePortfolio();
  const {
    sectionState: about,
    setSectionState: setAbout,
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
  } = useCmsConfigEditor('about');

  const [mediaOpen, setMediaOpen] = useState(false);

  const handlePublishWithProfileSync = async () => {
    await handlePublish(async (cfg) => {
      if (cfg.about.biography && cfg.about.biography !== profile.aboutText) {
        await saveProfile({ ...profile, aboutText: cfg.about.biography });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">About Section Manager</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Edit your About heading, introduction, detailed biography, career objectives, journey narrative, and supporting images.
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
        onPublish={handlePublishWithProfileSync}
        onDiscardDraft={handleDiscardDraft}
        onRestorePrevious={handleRestorePrevious}
      />

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold">Section Visibility</h2>
            <p className="text-xs text-slate-500">Hide or display the About section without deleting your biography.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={about.visible !== false}
              onChange={(e) => setAbout({ ...about, visible: e.target.checked })}
            />
            <span>Show About Section</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono mb-1">Section Heading</label>
            <input
              type="text"
              maxLength={120}
              value={about.heading}
              onChange={(e) => setAbout({ ...about, heading: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Section Subtitle</label>
            <input
              type="text"
              maxLength={200}
              value={about.subtitle}
              onChange={(e) => setAbout({ ...about, subtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">Bio Card Heading</label>
            <input
              type="text"
              maxLength={120}
              value={about.bioCardTitle}
              onChange={(e) => setAbout({ ...about, bioCardTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">Personal Introduction Lead (Optional)</label>
            <textarea
              rows={2}
              maxLength={1200}
              value={about.introParagraph}
              onChange={(e) => setAbout({ ...about, introParagraph: e.target.value })}
              placeholder="Optional short opening callout above the main biography..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">
              Main Biography (separate paragraphs with a blank line)
            </label>
            <textarea
              rows={6}
              maxLength={5000}
              value={about.biography}
              onChange={(e) => setAbout({ ...about, biography: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">Career Objectives (Optional)</label>
            <textarea
              rows={3}
              maxLength={2000}
              value={about.careerObjectives}
              onChange={(e) => setAbout({ ...about, careerObjectives: e.target.value })}
              placeholder="Optional career goal block..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">Professional Journey / Story (Optional)</label>
            <textarea
              rows={3}
              maxLength={2500}
              value={about.professionalJourney}
              onChange={(e) => setAbout({ ...about, professionalJourney: e.target.value })}
              placeholder="Optional learning or engineering journey summary..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>
        </div>

        {/* Supporting About Images */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider">About Gallery Images</h3>
              <p className="text-xs text-slate-500">Add optional images displayed inside your About section.</p>
            </div>
            <button
              type="button"
              onClick={() => setMediaOpen(true)}
              disabled={(about.aboutImages || []).length >= 8}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image</span>
            </button>
          </div>

          {(about.aboutImages || []).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(about.aboutImages || []).map((imgUrl, idx) => (
                <div
                  key={`${imgUrl}-${idx}`}
                  className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 h-28"
                >
                  <img
                    src={resolveUrl(imgUrl)}
                    alt={`About visual ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAbout({
                        ...about,
                        aboutImages: about.aboutImages.filter((_, i) => i !== idx),
                      })
                    }
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-red-600 text-white cursor-pointer"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span>No extra About images selected.</span>
            </div>
          )}
        </div>
      </div>

      <MediaPickerModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        defaultCategory="about"
        acceptTypes="image"
        title="Add About Section Image"
        onSelect={(url) =>
          setAbout({ ...about, aboutImages: [...(about.aboutImages || []), url] })
        }
      />

      <CmsLivePreviewModal isOpen={previewOpen} onClose={closePreview} />
    </div>
  );
};
