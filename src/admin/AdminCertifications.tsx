import React, { useState, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Save,
  X,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Certification, PublishStatus } from '../types';
import {
  saveCertification,
  deleteCertification,
  slugifyId,
  uploadPersistentMedia,
} from '../lib/portfolioService';
import { MediaPickerModal } from '../components/admin/MediaPickerModal';

const EMPTY_CERT: Certification = {
  id: '',
  title: '',
  issuer: '',
  date: '',
  gradeOrScore: '',
  badgeType: '',
  credentialId: '',
  credentialUrl: '',
  certificateImage: '',
  fileType: 'none',
  description: '',
  status: 'draft',
  order: 1,
};

export const AdminCertifications: React.FC = () => {
  const { adminCertifications, resolveUrl, refreshAdminData } = usePortfolio();
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Certification | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Certification | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openEditor = (cert?: Certification) => {
    if (cert) {
      setIsNew(false);
      setEditing({ ...cert });
    } else {
      setIsNew(true);
      setEditing({
        ...EMPTY_CERT,
        id: slugifyId('cert', 'certificate'),
        order: adminCertifications.length + 1,
      });
    }
    setNotice(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    setNotice(null);
    try {
      const uploaded = await uploadPersistentMedia(file, 'certificate');
      setEditing({
        ...editing,
        certificateImage: uploaded.url,
        fileType: uploaded.fileType,
      });
      await refreshAdminData();
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Certificate upload failed.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent, overrideStatus?: PublishStatus) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setNotice(null);
    try {
      const finalId = isNew ? slugifyId('cert', editing.title) : editing.id;
      await saveCertification(
        {
          ...editing,
          id: finalId,
          status: overrideStatus || editing.status || 'published',
        },
        isNew
      );
      await refreshAdminData();
      setEditing(null);
      setNotice({ type: 'ok', text: 'Certification saved to database.' });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save certification.',
      });
    } finally {
      setSaving(false);
    }
  };

  const moveCertOrder = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= adminCertifications.length) return;
    const a = adminCertifications[idx];
    const b = adminCertifications[target];
    const aOrder = a.order ?? idx + 1;
    const bOrder = b.order ?? target + 1;
    await Promise.all([
      saveCertification({ ...a, order: bOrder }),
      saveCertification({ ...b, order: aOrder }),
    ]);
    await refreshAdminData();
  };

  const togglePublish = async (cert: Certification) => {
    try {
      const nextStatus: PublishStatus = cert.status === 'draft' ? 'published' : 'draft';
      await saveCertification({ ...cert, status: nextStatus });
      await refreshAdminData();
      setNotice({ type: 'ok', text: `"${cert.title}" marked as ${nextStatus}.` });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to update publish status.',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await deleteCertification(confirmDelete.id);
      await refreshAdminData();
      setConfirmDelete(null);
      setNotice({ type: 'ok', text: 'Certification deleted.' });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Delete failed.',
      });
    }
  };

  const filtered = adminCertifications.filter((c) => {
    const matchesStatus =
      filter === 'all' || (filter === 'draft' ? c.status === 'draft' : c.status !== 'draft');
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || c.title.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const canReorder = filter === 'all' && !search.trim();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certifications Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add, edit, delete, reorder, or upload certificate images and PDFs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certification</span>
        </button>
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start">
          {(['all', 'published', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                filter === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Search certifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm sm:w-64"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((cert, idx) => {
          const resolvedFile = resolveUrl(cert.certificateImage);
          return (
            <div
              key={cert.id}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span
                    className={
                      cert.status === 'draft'
                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                        : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    }
                  >
                    {cert.status === 'draft' ? 'Draft' : 'Published'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{cert.date}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums text-slate-500">Order #{cert.order ?? idx + 1}</span>
                </div>
                <h3 className="text-base font-bold truncate">{cert.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {cert.issuer}
                  {cert.credentialId ? ` · ID: ${cert.credentialId}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {canReorder && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveCertOrder(idx, -1)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                      aria-label="Move certification up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === filtered.length - 1}
                      onClick={() => moveCertOrder(idx, 1)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                      aria-label="Move certification down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {resolvedFile && (
                  <a
                    href={resolvedFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-blue-600"
                    aria-label="Open certificate file"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => togglePublish(cert)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {cert.status === 'draft' ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Publish</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                      <span>Unpublish</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => openEditor(cert)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-blue-600 cursor-pointer"
                  aria-label="Edit certification"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(cert)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                  aria-label="Delete certification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold">
                {isNew ? 'Add Certification' : 'Edit Certification'}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleSave(e)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono mb-1">Certificate Title *</label>
                  <input
                    type="text"
                    required
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Issuing Organization *</label>
                  <input
                    type="text"
                    required
                    value={editing.issuer}
                    onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Issue Date *</label>
                  <input
                    type="text"
                    required
                    value={editing.date}
                    onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Credential ID</label>
                  <input
                    type="text"
                    value={editing.credentialId || ''}
                    onChange={(e) => setEditing({ ...editing, credentialId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Grade / Score</label>
                  <input
                    type="text"
                    value={editing.gradeOrScore || ''}
                    onChange={(e) => setEditing({ ...editing, gradeOrScore: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Badge / Label</label>
                  <input
                    type="text"
                    value={editing.badgeType || ''}
                    onChange={(e) => setEditing({ ...editing, badgeType: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={editing.order ?? 1}
                    onChange={(e) =>
                      setEditing({ ...editing, order: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono tabular-nums"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono mb-1">Verification URL</label>
                  <input
                    type="url"
                    value={editing.credentialUrl || ''}
                    onChange={(e) => setEditing({ ...editing, credentialUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono mb-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={editing.description || ''}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>

                {/* Upload Certificate File (Image or PDF) */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-mono mb-2">
                    Certificate File (Image, SVG, or PDF, max 10 MB)
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploading ? 'Uploading...' : 'Upload Image or PDF'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Choose from Library</span>
                    </button>
                    {editing.certificateImage && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({ ...editing, certificateImage: '', fileType: 'none' })
                        }
                        className="text-xs text-red-500 cursor-pointer ml-1"
                      >
                        Remove Attachment
                      </button>
                    )}
                  </div>
                  {editing.certificateImage && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                      {editing.fileType === 'pdf' ||
                      editing.certificateImage.toLowerCase().endsWith('.pdf') ? (
                        <>
                          <FileText className="w-5 h-5 text-red-500 shrink-0" />
                          <span className="text-xs font-mono truncate">
                            {editing.certificateImage}
                          </span>
                        </>
                      ) : (
                        <img
                          src={resolveUrl(editing.certificateImage)}
                          alt="Certificate preview"
                          className="h-24 rounded-lg object-contain"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={(e) => handleSave(e, 'draft')}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={(e) => handleSave(e, 'published')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Publish Certification'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold">Delete Certification?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Permanently delete <strong>{confirmDelete.title}</strong>?
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
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        defaultCategory="certificate"
        acceptTypes="all"
        title="Select Certificate Asset"
        onSelect={(url, asset) => {
          if (!editing) return;
          setEditing({
            ...editing,
            certificateImage: url,
            fileType: asset?.fileType || (url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'),
          });
        }}
      />
    </div>
  );
};
