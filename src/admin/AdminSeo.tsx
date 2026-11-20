import React, { useState } from 'react';
import { Globe, Image as ImageIcon } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useCmsConfigEditor } from '../lib/useCmsConfigEditor';
import { CmsActionToolbar } from '../components/admin/CmsActionToolbar';
import { MediaPickerModal } from '../components/admin/MediaPickerModal';
import { CmsLivePreviewModal } from '../components/admin/CmsLivePreviewModal';

export const AdminSeo: React.FC = () => {
  const { resolveUrl } = usePortfolio();
  const {
    sectionState: seo,
    setSectionState: setSeo,
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
  } = useCmsConfigEditor('seo');

  const [pickerTarget, setPickerTarget] = useState<'ogImage' | 'faviconUrl' | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SEO &amp; Social Metadata Manager</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Control browser title, meta description, keywords, OpenGraph sharing cards, canonical URL, favicon, and search indexing.
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

      {/* Search Snippet Preview */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <Globe className="w-3.5 h-3.5 text-blue-500" />
          <span>Search Result Snippet Preview</span>
        </div>
        <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 truncate">
          {seo.canonicalUrl || window.location.origin}
        </p>
        <h3 className="text-base font-bold text-blue-600 dark:text-blue-400 truncate">
          {seo.title}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{seo.description}</p>
      </div>

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">Website Title</label>
            <input
              type="text"
              maxLength={160}
              value={seo.title}
              onChange={(e) => setSeo({ ...seo, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">Meta Description</label>
            <textarea
              rows={2}
              maxLength={320}
              value={seo.description}
              onChange={(e) => setSeo({ ...seo, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">Keywords (comma-separated)</label>
            <input
              type="text"
              maxLength={400}
              value={seo.keywords}
              onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Author</label>
            <input
              type="text"
              maxLength={120}
              value={seo.author}
              onChange={(e) => setSeo({ ...seo, author: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Search Engine Robots</label>
            <select
              value={seo.robots}
              onChange={(e) =>
                setSeo({ ...seo, robots: e.target.value as 'index, follow' | 'noindex, nofollow' })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            >
              <option value="index, follow">index, follow (Public Search Visible)</option>
              <option value="noindex, nofollow">noindex, nofollow (Hide from Search)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">OpenGraph Share Title</label>
            <input
              type="text"
              maxLength={160}
              value={seo.ogTitle}
              onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Canonical URL (Optional)</label>
            <input
              type="url"
              maxLength={300}
              placeholder="https://..."
              value={seo.canonicalUrl}
              onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">OpenGraph Share Description</label>
            <textarea
              rows={2}
              maxLength={320}
              value={seo.ogDescription}
              onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Social Sharing Image (OG Image)</label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={500}
                value={seo.ogImage}
                onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                placeholder="Select or upload social banner"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setPickerTarget('ogImage')}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Pick</span>
              </button>
            </div>
            {seo.ogImage && (
              <img
                src={resolveUrl(seo.ogImage)}
                alt="OG banner preview"
                className="mt-2 h-20 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Favicon Icon</label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={500}
                value={seo.faviconUrl}
                onChange={(e) => setSeo({ ...seo, faviconUrl: e.target.value })}
                placeholder="/favicon.svg"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setPickerTarget('faviconUrl')}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Pick</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        defaultCategory="seo"
        acceptTypes="image"
        title={pickerTarget === 'ogImage' ? 'Select Social Share Image' : 'Select Favicon'}
        onSelect={(url) => {
          if (pickerTarget) {
            setSeo({ ...seo, [pickerTarget]: url });
          }
        }}
      />

      <CmsLivePreviewModal isOpen={previewOpen} onClose={closePreview} />
    </div>
  );
};
