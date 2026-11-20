import React, { useState, useRef } from 'react';
import {
  Upload,
  Trash2,
  Copy,
  Check,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { uploadPersistentMedia, deleteMediaAsset } from '../lib/portfolioService';
import { MediaAsset, MediaCategory } from '../types';

export const AdminMedia: React.FC = () => {
  const { mediaAssets, resolveUrl, refreshAdminData } = usePortfolio();
  const [filter, setFilter] = useState<'all' | MediaCategory>('all');
  const [uploadCat, setUploadCat] = useState<MediaCategory>('general');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MediaAsset | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setNotice(null);
    try {
      const uploaded = await uploadPersistentMedia(file, uploadCat);
      await refreshAdminData();
      setNotice({
        type: 'ok',
        text: `Uploaded "${uploaded.name}" persistently (${
          uploaded.storageMode === 'firebase-storage'
            ? 'Firebase Cloud Storage'
            : 'Firestore Persistent Database Asset'
        }).`,
      });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Media upload failed.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCopy = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMediaAsset(confirmDelete);
      await refreshAdminData();
      setNotice({ type: 'ok', text: `Deleted "${confirmDelete.name}".` });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Delete failed.',
      });
    } finally {
      setConfirmDelete(null);
    }
  };

  const filtered = mediaAssets.filter((m) => filter === 'all' || m.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Centralized Media Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upload, organize, preview, and reuse persistent images, certificates, logos, resumes, and SEO assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <select
            value={uploadCat}
            onChange={(e) => setUploadCat(e.target.value as MediaCategory)}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono capitalize"
            aria-label="Upload category"
          >
            <option value="general">General</option>
            <option value="profile">Profile</option>
            <option value="project">Project</option>
            <option value="certificate">Certificate</option>
            <option value="resume">Resume (PDF)</option>
            <option value="logo">Logo</option>
            <option value="about">About</option>
            <option value="seo">SEO / Favicon</option>
          </select>

          <input
            ref={fileRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,image/*,application/pdf"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{uploading ? 'Uploading...' : 'Upload Asset'}</span>
          </button>
        </div>
      </div>

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

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        {(['all', 'profile', 'project', 'certificate', 'resume', 'logo', 'about', 'seo', 'general'] as const).map(
          (cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize cursor-pointer ${
                filter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((asset) => {
          const previewUrl = resolveUrl(asset.url);
          return (
            <div
              key={asset.id}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
            >
              <div className="h-40 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-slate-800">
                {asset.fileType === 'pdf' ? (
                  <div className="text-center space-y-1">
                    <FileText className="w-10 h-10 text-red-500 mx-auto" />
                    <span className="text-xs font-mono text-slate-500 block">PDF Document</span>
                  </div>
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={asset.name}
                    className="w-full h-full object-contain p-2"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-slate-400" />
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
                    <span className="capitalize text-blue-600 dark:text-blue-400 font-semibold">
                      {asset.category}
                    </span>
                    <span>{asset.storageMode}</span>
                  </div>
                  <p className="text-xs font-bold truncate mt-1">{asset.name}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleCopy(asset)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Ref</span>
                      </>
                    )}
                  </button>

                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-blue-600"
                      aria-label="Open file"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {asset.storageMode !== 'public-static' && (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(asset)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-500 cursor-pointer"
                      aria-label="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold">Delete Media Asset?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Delete <strong>{confirmDelete.name}</strong>? Any portfolio item still referencing this URL will no longer display it.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
