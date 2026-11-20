import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useCmsConfigEditor } from '../lib/useCmsConfigEditor';
import { CmsActionToolbar } from '../components/admin/CmsActionToolbar';
import { CmsLivePreviewModal } from '../components/admin/CmsLivePreviewModal';

export const AdminContact: React.FC = () => {
  const { profile } = usePortfolio();
  const {
    sectionState: contact,
    setSectionState: setContact,
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
  } = useCmsConfigEditor('contact');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contact Section Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure contact section headings, form labels, and contact form visibility.
          </p>
        </div>
        <Link
          to="/admin/profile"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-blue-500 self-start sm:self-auto"
        >
          <span>Edit Email / Phone / Social URLs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
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

      {/* Current Active Contact Details Summary */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div>
          <span className="text-slate-500 block">Public Email</span>
          <span className="font-semibold">{profile.email}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Phone</span>
          <span className="font-semibold">{profile.phone || 'Hidden'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Location</span>
          <span className="font-semibold">{profile.location}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold">Public Contact Form</h2>
            <p className="text-xs text-slate-500">
              Enable or disable the rate-limited visitor message form on the public portfolio.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={contact.formVisible !== false}
              onChange={(e) => setContact({ ...contact, formVisible: e.target.checked })}
            />
            <span>Enable Contact Form</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono mb-1">Section Heading</label>
            <input
              type="text"
              maxLength={120}
              value={contact.heading}
              onChange={(e) => setContact({ ...contact, heading: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Section Subtitle</label>
            <input
              type="text"
              maxLength={200}
              value={contact.subtitle}
              onChange={(e) => setContact({ ...contact, subtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Direct Info Card Heading</label>
            <input
              type="text"
              maxLength={120}
              value={contact.directInfoHeading}
              onChange={(e) => setContact({ ...contact, directInfoHeading: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Form Card Heading</label>
            <input
              type="text"
              maxLength={120}
              value={contact.formHeading}
              onChange={(e) => setContact({ ...contact, formHeading: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">Direct Info Description</label>
            <textarea
              rows={2}
              maxLength={500}
              value={contact.directInfoIntro}
              onChange={(e) => setContact({ ...contact, directInfoIntro: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono mb-1">Form Helper Subtext</label>
            <input
              type="text"
              maxLength={300}
              value={contact.formSubtext}
              onChange={(e) => setContact({ ...contact, formSubtext: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Name Field Label</label>
            <input
              type="text"
              maxLength={60}
              value={contact.nameLabel}
              onChange={(e) => setContact({ ...contact, nameLabel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Email Field Label</label>
            <input
              type="text"
              maxLength={60}
              value={contact.emailLabel}
              onChange={(e) => setContact({ ...contact, emailLabel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Subject Field Label</label>
            <input
              type="text"
              maxLength={60}
              value={contact.subjectLabel}
              onChange={(e) => setContact({ ...contact, subjectLabel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Message Field Label</label>
            <input
              type="text"
              maxLength={60}
              value={contact.messageLabel}
              onChange={(e) => setContact({ ...contact, messageLabel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1">Submit Button Text</label>
            <input
              type="text"
              maxLength={60}
              value={contact.submitLabel}
              onChange={(e) => setContact({ ...contact, submitLabel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>
        </div>
      </div>

      <CmsLivePreviewModal isOpen={previewOpen} onClose={closePreview} />
    </div>
  );
};
