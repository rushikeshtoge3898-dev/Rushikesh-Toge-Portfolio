import React from 'react';
import {
  Save,
  Eye,
  Send,
  RotateCcw,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface CmsActionToolbarProps {
  hasDraft: boolean;
  hasPrev: boolean;
  isDirty: boolean;
  savingAction: 'draft' | 'publish' | 'discard' | 'restore' | null;
  notice: { type: 'ok' | 'err'; text: string } | null;
  onSaveDraft: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onDiscardDraft?: () => void;
  onRestorePrevious?: () => void;
}

export const CmsActionToolbar: React.FC<CmsActionToolbarProps> = ({
  hasDraft,
  hasPrev,
  isDirty,
  savingAction,
  notice,
  onSaveDraft,
  onPreview,
  onPublish,
  onDiscardDraft,
  onRestorePrevious,
}) => {
  const busy = savingAction !== null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {hasDraft ? (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
              Unpublished CMS Draft Pending
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
              Live Synced
            </span>
          )}
          {isDirty && (
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300">
              Unsaved Local Edits
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasPrev && onRestorePrevious && (
            <button
              type="button"
              disabled={busy}
              onClick={onRestorePrevious}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500/60 text-xs font-semibold cursor-pointer disabled:opacity-50"
              title="Restore last published snapshot"
            >
              <History className="w-3.5 h-3.5 text-amber-500" />
              <span>{savingAction === 'restore' ? 'Restoring...' : 'Restore Previous'}</span>
            </button>
          )}
          {hasDraft && onDiscardDraft && (
            <button
              type="button"
              disabled={busy}
              onClick={onDiscardDraft}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{savingAction === 'discard' ? 'Discarding...' : 'Discard Draft'}</span>
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={onPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Preview Public Site</span>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onSaveDraft}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {savingAction === 'draft' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{savingAction === 'draft' ? 'Saving Draft...' : 'Save Draft'}</span>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onPublish}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {savingAction === 'publish' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{savingAction === 'publish' ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {isDirty && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            You have unsaved changes. Click <strong>Save Draft</strong> to preview/store privately or{' '}
            <strong>Publish Live</strong> to update the public portfolio.
          </span>
        </div>
      )}

      {notice && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            notice.type === 'ok'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200'
          }`}
        >
          {notice.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}
    </div>
  );
};
