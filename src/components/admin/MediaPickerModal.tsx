import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, FileText, Check, Loader2 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { uploadPersistentMedia } from '../../lib/portfolioService';
import { MediaAsset, MediaCategory } from '../../types';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, asset?: MediaAsset) => void;
  defaultCategory?: MediaCategory;
  acceptTypes?: 'image' | 'pdf' | 'all';
  title?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  defaultCategory = 'general' as MediaCategory,
  acceptTypes = 'all',
  title = 'Select or Upload Media',
}) => {
  const { mediaAssets, resolveUrl, refreshAdminData } = usePortfolio();
  const [catFilter, setCatFilter] = useState<'all' | MediaCategory>('all');
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filtered = mediaAssets.filter((asset) => {
    if (acceptTypes === 'image' && asset.fileType === 'pdf') return false;
    if (acceptTypes === 'pdf' && asset.fileType !== 'pdf') return false;
    if (catFilter !== 'all' && asset.category !== catFilter) return false;
    return true;
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr(null);
    try {
      const cat = defaultCategory as MediaCategory;
      const uploaded = await uploadPersistentMedia(file, cat);
      await refreshAdminData();
      onSelect(uploaded.url, uploaded);
      onClose();
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const acceptAttr =
    acceptTypes === 'image'
      ? '.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml'
      : acceptTypes === 'pdf'
      ? '.pdf,application/pdf'
      : '.png,.jpg,.jpeg,.webp,.svg,.pdf,image/*,application/pdf';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">{title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose from persistent library assets or upload a new file.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept={acceptAttr}
              onChange={handleUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              aria-label="Close media picker"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-5 pt-3 flex flex-wrap items-center gap-1.5">
          {(['all', 'profile', 'project', 'certificate', 'resume', 'logo', 'seo', 'about', 'general'] as const).map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCatFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono capitalize cursor-pointer ${
                  catFilter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {err && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-200">
            {err}
          </div>
        )}

        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-full py-10 text-center text-xs text-slate-500">
              No matching assets found. Click &quot;Upload New&quot; above to add one.
            </div>
          ) : (
            filtered.map((asset) => {
              const previewSrc = resolveUrl(asset.url);
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    onSelect(asset.url, asset);
                    onClose();
                  }}
                  className="group text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col cursor-pointer transition-colors"
                >
                  <div className="h-24 w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden relative">
                    {asset.fileType === 'pdf' ? (
                      <FileText className="w-8 h-8 text-red-500" />
                    ) : previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    )}
                    <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-blue-600 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-semibold truncate">{asset.name}</p>
                    <p className="text-[10px] font-mono text-slate-500 capitalize">
                      {asset.category} · {asset.fileType.toUpperCase()}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
