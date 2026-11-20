import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCmsConfigEditor } from '../lib/useCmsConfigEditor';
import { CmsActionToolbar } from '../components/admin/CmsActionToolbar';
import { CmsLivePreviewModal } from '../components/admin/CmsLivePreviewModal';
import { CmsFooterLink } from '../types';

export const AdminFooter: React.FC = () => {
  const {
    sectionState: footer,
    setSectionState: setFooter,
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
  } = useCmsConfigEditor('footer');

  const links = footer.footerLinks || [];

  const updateLink = (idx: number, patch: Partial<CmsFooterLink>) => {
    const next = links.map((l, i) => (i === idx ? { ...l, ...patch } : l));
    setFooter({ ...footer, footerLinks: next });
  };

  const addLink = () => {
    if (links.length >= 12) return;
    setFooter({
      ...footer,
      footerLinks: [...links, { label: 'Projects', href: '#projects', isExternal: false }],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Footer Manager</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Edit footer description, copyright notice, social/contact visibility, and footer quick links.
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
        <div className="flex flex-wrap items-center gap-6 pb-4 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={footer.visible !== false}
              onChange={(e) => setFooter({ ...footer, visible: e.target.checked })}
            />
            <span>Show Footer</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={footer.showSocialLinks !== false}
              onChange={(e) => setFooter({ ...footer, showSocialLinks: e.target.checked })}
            />
            <span>Show Social Icons</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(footer.showContactInfo)}
              onChange={(e) => setFooter({ ...footer, showContactInfo: e.target.checked })}
            />
            <span>Show Contact Details</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(footer.showFooterNav)}
              onChange={(e) => setFooter({ ...footer, showFooterNav: e.target.checked })}
            />
            <span>Show Footer Quick Links</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">Footer Description / Tagline</label>
            <input
              type="text"
              maxLength={300}
              value={footer.description}
              onChange={(e) => setFooter({ ...footer, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">Copyright Text (year prepended automatically)</label>
            <input
              type="text"
              maxLength={200}
              value={footer.copyrightText}
              onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider">Footer Navigation Links</h3>
            <button
              type="button"
              onClick={addLink}
              disabled={links.length >= 12}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Link</span>
            </button>
          </div>

          {links.map((link, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <input
                type="text"
                maxLength={40}
                placeholder="Label"
                value={link.label}
                onChange={(e) => updateLink(idx, { label: e.target.value })}
                className="sm:col-span-4 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
              <input
                type="text"
                maxLength={300}
                placeholder="#section or https://..."
                value={link.href}
                onChange={(e) => updateLink(idx, { href: e.target.value })}
                className="sm:col-span-5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
              />
              <label className="sm:col-span-2 inline-flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(link.isExternal)}
                  onChange={(e) => updateLink(idx, { isExternal: e.target.checked })}
                />
                <span>External</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setFooter({ ...footer, footerLinks: links.filter((_, i) => i !== idx) })
                }
                className="sm:col-span-1 p-2 rounded-lg text-red-500 cursor-pointer flex justify-center"
                aria-label="Remove footer link"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <CmsLivePreviewModal isOpen={previewOpen} onClose={closePreview} />
    </div>
  );
};
