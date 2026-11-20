import React, { useState, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { EducationItem, PublishStatus } from '../types';
import {
  saveEducation,
  deleteEducation,
  slugifyId,
  uploadPersistentMedia,
} from '../lib/portfolioService';
import { MediaPickerModal } from '../components/admin/MediaPickerModal';

export const AdminEducation: React.FC = () => {
  const { adminEducation, resolveUrl, refreshAdminData } = usePortfolio();
  const [editing, setEditing] = useState<EducationItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [detailsText, setDetailsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'logo' | 'doc' | null>(null);
  const [pickerField, setPickerField] = useState<'logo' | 'doc' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<EducationItem | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const openEditor = (item?: EducationItem) => {
    if (item) {
      setIsNew(false);
      setEditing({ ...item });
      setDetailsText((item.details || []).join(', '));
    } else {
      setIsNew(true);
      setEditing({
        id: slugifyId('edu', 'degree'),
        level: '',
        fieldOfStudy: '',
        institution: '',
        boardOrUniversity: '',
        year: '',
        startYear: '',
        endYear: '',
        scoreLabel: 'CGPA',
        scoreValue: '',
        description: '',
        details: [],
        institutionLogo: '',
        supportingDocUrl: '',
        isCurrent: false,
        status: 'published',
        order: adminEducation.length + 1,
      });
      setDetailsText('');
    }
    setNotice(null);
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'logo' | 'doc'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploadingField(target);
    try {
      const uploaded = await uploadPersistentMedia(
        file,
        target === 'logo' ? 'logo' : 'certificate'
      );
      setEditing({
        ...editing,
        ...(target === 'logo'
          ? { institutionLogo: uploaded.url }
          : { supportingDocUrl: uploaded.url }),
      });
      await refreshAdminData();
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Upload failed.',
      });
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent, statusOverride?: PublishStatus) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setNotice(null);
    try {
      const details = detailsText
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);
      const finalId = isNew ? slugifyId('edu', editing.level) : editing.id;
      await saveEducation(
        {
          ...editing,
          id: finalId,
          details,
          status: statusOverride || editing.status || 'published',
        },
        isNew
      );
      await refreshAdminData();
      setEditing(null);
      setNotice({ type: 'ok', text: 'Education entry saved.' });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Save failed.',
      });
    } finally {
      setSaving(false);
    }
  };

  const moveOrder = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= adminEducation.length) return;
    const a = adminEducation[idx];
    const b = adminEducation[target];
    await Promise.all([
      saveEducation({ ...a, order: b.order ?? target + 1 }),
      saveEducation({ ...b, order: a.order ?? idx + 1 }),
    ]);
    await refreshAdminData();
  };

  const togglePublish = async (item: EducationItem) => {
    const nextStatus: PublishStatus = item.status === 'draft' ? 'published' : 'draft';
    await saveEducation({ ...item, status: nextStatus });
    await refreshAdminData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Education Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage academic degrees, CGPA/SGPA highlights, institution logos, and supporting documents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Education</span>
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

      <div className="space-y-3">
        {adminEducation.map((edu, idx) => (
          <div
            key={edu.id}
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3 min-w-0">
              {edu.institutionLogo && (
                <img
                  src={resolveUrl(edu.institutionLogo)}
                  alt={edu.institution}
                  className="w-10 h-10 rounded-lg object-contain border border-slate-200 dark:border-slate-800 bg-white p-1 shrink-0"
                />
              )}
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span
                    className={
                      edu.status === 'draft'
                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                        : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    }
                  >
                    {edu.status === 'draft' ? 'Draft' : 'Published'}
                  </span>
                  <span>·</span>
                  <span>{edu.year}</span>
                  <span>·</span>
                  <span>
                    {edu.scoreLabel}: {edu.scoreValue}
                  </span>
                </div>
                <h3 className="text-base font-bold truncate">
                  {edu.level}
                  {edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ''}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {edu.institution}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => moveOrder(idx, -1)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                aria-label="Move education up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={idx === adminEducation.length - 1}
                onClick={() => moveOrder(idx, 1)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                aria-label="Move education down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => togglePublish(edu)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                aria-label="Toggle education visibility"
              >
                {edu.status === 'draft' ? (
                  <Eye className="w-4 h-4 text-emerald-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-amber-500" />
                )}
              </button>
              <button
                type="button"
                onClick={() => openEditor(edu)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-blue-600 cursor-pointer"
                aria-label="Edit education"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(edu)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-500 cursor-pointer"
                aria-label="Delete education"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold">{isNew ? 'Add Education' : 'Edit Education'}</h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => handleSave(e)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono mb-1">Degree / Level *</label>
                  <input
                    type="text"
                    required
                    value={editing.level}
                    onChange={(e) => setEditing({ ...editing, level: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={editing.fieldOfStudy || ''}
                    onChange={(e) => setEditing({ ...editing, fieldOfStudy: e.target.value })}
                    placeholder="e.g. Computer Engineering"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono mb-1">Institution *</label>
                  <input
                    type="text"
                    required
                    value={editing.institution}
                    onChange={(e) => setEditing({ ...editing, institution: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Board / University</label>
                  <input
                    type="text"
                    value={editing.boardOrUniversity || ''}
                    onChange={(e) =>
                      setEditing({ ...editing, boardOrUniversity: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Year / Period *</label>
                  <input
                    type="text"
                    required
                    value={editing.year}
                    onChange={(e) => setEditing({ ...editing, year: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Start Year</label>
                  <input
                    type="text"
                    value={editing.startYear || ''}
                    onChange={(e) => setEditing({ ...editing, startYear: e.target.value })}
                    placeholder="2024"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">End Year / Expected</label>
                  <input
                    type="text"
                    value={editing.endYear || ''}
                    onChange={(e) => setEditing({ ...editing, endYear: e.target.value })}
                    placeholder="2028"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Score Label *</label>
                  <input
                    type="text"
                    required
                    value={editing.scoreLabel}
                    onChange={(e) => setEditing({ ...editing, scoreLabel: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Score Value *</label>
                  <input
                    type="text"
                    required
                    value={editing.scoreValue}
                    onChange={(e) => setEditing({ ...editing, scoreValue: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono mb-1">
                  Semester / Additional Details (comma-separated)
                </label>
                <input
                  type="text"
                  value={detailsText}
                  onChange={(e) => setDetailsText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="block text-xs font-mono">Institution Logo</label>
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, 'logo')}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={uploadingField === 'logo'}
                      onClick={() => logoRef.current?.click()}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingField === 'logo' ? 'Uploading...' : 'Upload Logo'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerField('logo')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Library</span>
                    </button>
                    {editing.institutionLogo && (
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, institutionLogo: '' })}
                        className="text-xs text-red-500 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {editing.institutionLogo && (
                    <img
                      src={resolveUrl(editing.institutionLogo)}
                      alt="Institution logo"
                      className="h-12 rounded-lg object-contain border border-slate-200 dark:border-slate-800 bg-white p-1"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono">Supporting Document (Image/PDF)</label>
                  <input
                    ref={docRef}
                    type="file"
                    accept="image/*,application/pdf,.pdf"
                    onChange={(e) => handleUpload(e, 'doc')}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={uploadingField === 'doc'}
                      onClick={() => docRef.current?.click()}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingField === 'doc' ? 'Uploading...' : 'Upload Doc'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerField('doc')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Library</span>
                    </button>
                    {editing.supportingDocUrl && (
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, supportingDocUrl: '' })}
                        className="text-xs text-red-500 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {editing.supportingDocUrl && (
                    <p className="text-[11px] font-mono text-slate-500 truncate">
                      Attached: {editing.supportingDocUrl}
                    </p>
                  )}
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editing.isCurrent)}
                  onChange={(e) => setEditing({ ...editing, isCurrent: e.target.checked })}
                />
                <span>Currently Pursuing</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
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
                  onClick={(e) => handleSave(e, 'published')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Education'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold">Delete Education Entry?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Delete <strong>{confirmDelete.level}</strong>?
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
                onClick={async () => {
                  await deleteEducation(confirmDelete.id);
                  await refreshAdminData();
                  setConfirmDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={Boolean(pickerField)}
        onClose={() => setPickerField(null)}
        defaultCategory={pickerField === 'logo' ? 'logo' : 'certificate'}
        acceptTypes={pickerField === 'logo' ? 'image' : 'all'}
        title={pickerField === 'logo' ? 'Select Institution Logo' : 'Select Supporting Document'}
        onSelect={(url) => {
          if (!editing) return;
          setEditing({
            ...editing,
            ...(pickerField === 'logo' ? { institutionLogo: url } : { supportingDocUrl: url }),
          });
        }}
      />
    </div>
  );
};
