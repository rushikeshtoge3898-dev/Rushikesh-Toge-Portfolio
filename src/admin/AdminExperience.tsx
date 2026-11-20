import React, { useState, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ExperienceItem, ExperienceKind, PublishStatus } from '../types';
import {
  saveExperience,
  deleteExperience,
  slugifyId,
  uploadPersistentMedia,
} from '../lib/portfolioService';
import { MediaPickerModal } from '../components/admin/MediaPickerModal';

const KIND_LABELS: Record<ExperienceKind, string> = {
  internship: 'Internship',
  workshop: 'Workshop',
  industrial_training: 'Industrial Training',
  professional_experience: 'Professional Experience',
  achievement: 'Achievement',
  event: 'Event / Hackathon',
  volunteering: 'Volunteering',
};

const ALL_KINDS = Object.keys(KIND_LABELS) as ExperienceKind[];

export const AdminExperience: React.FC = () => {
  const { adminExperiences, resolveUrl, refreshAdminData } = usePortfolio();
  const [kindFilter, setKindFilter] = useState<'all' | ExperienceKind>('all');
  const [editing, setEditing] = useState<ExperienceItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [highlightsText, setHighlightsText] = useState('');
  const [techText, setTechText] = useState('');
  const [skillsLearnedText, setSkillsLearnedText] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'cert' | 'logo' | null>(null);
  const [pickerField, setPickerField] = useState<'cert' | 'logo' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ExperienceItem | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const openEditor = (item?: ExperienceItem) => {
    if (item) {
      setIsNew(false);
      setEditing({ ...item });
      setHighlightsText((item.highlights || []).join('\n'));
      setTechText((item.technologies || []).join(', '));
      setSkillsLearnedText((item.skillsLearned || []).join(', '));
    } else {
      setIsNew(true);
      setEditing({
        id: slugifyId('exp', 'item'),
        kind: kindFilter === 'all' ? 'internship' : kindFilter,
        title: '',
        organization: '',
        role: '',
        domain: '',
        duration: '',
        startDate: '',
        endDate: '',
        workMode: '',
        credentialId: '',
        description: '',
        highlights: [],
        skillsLearned: [],
        technologies: [],
        certificateImage: '',
        verificationUrl: '',
        organizationLogo: '',
        isCurrent: false,
        status: 'published',
        order: adminExperiences.length + 1,
      });
      setHighlightsText('');
      setTechText('');
      setSkillsLearnedText('');
    }
    setNotice(null);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'cert' | 'logo'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploadingField(target);
    try {
      const res = await uploadPersistentMedia(
        file,
        target === 'logo' ? 'logo' : 'certificate'
      );
      setEditing({
        ...editing,
        ...(target === 'logo' ? { organizationLogo: res.url } : { certificateImage: res.url }),
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
      const highlights = highlightsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const splitComma = (raw: string) =>
        raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      const finalId = isNew ? slugifyId('exp', editing.title) : editing.id;
      await saveExperience(
        {
          ...editing,
          id: finalId,
          highlights,
          technologies: splitComma(techText),
          skillsLearned: splitComma(skillsLearnedText),
          status: statusOverride || editing.status || 'published',
        },
        isNew
      );
      await refreshAdminData();
      setEditing(null);
      setNotice({ type: 'ok', text: `${KIND_LABELS[editing.kind]} record saved.` });
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
    if (target < 0 || target >= adminExperiences.length) return;
    const a = adminExperiences[idx];
    const b = adminExperiences[target];
    await Promise.all([
      saveExperience({ ...a, order: b.order ?? target + 1 }),
      saveExperience({ ...b, order: a.order ?? idx + 1 }),
    ]);
    await refreshAdminData();
  };

  const filtered = adminExperiences.filter(
    (item) => kindFilter === 'all' || item.kind === kindFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Experience, Training &amp; Achievements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage internships, workshops, industrial training, professional roles, achievements, events, and volunteering.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Entry</span>
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

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setKindFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            kindFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          All ({adminExperiences.length})
        </button>
        {ALL_KINDS.map((k) => {
          const count = adminExperiences.filter((e) => e.kind === k).length;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setKindFilter(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                kindFilter === k
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {KIND_LABELS[k]} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-sm text-slate-500">
            No entries found for this category. Click &quot;Add Entry&quot; above to add one.
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                {item.organizationLogo && (
                  <img
                    src={resolveUrl(item.organizationLogo)}
                    alt={item.organization}
                    className="w-10 h-10 rounded-lg object-contain border border-slate-200 dark:border-slate-800 bg-white p-1 shrink-0"
                  />
                )}
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {KIND_LABELS[item.kind] || item.kind}
                    </span>
                    <span>·</span>
                    <span
                      className={
                        item.status === 'draft'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }
                    >
                      {item.status === 'draft' ? 'Draft' : 'Published'}
                    </span>
                    <span>·</span>
                    <span>{item.duration}</span>
                  </div>
                  <h3 className="text-base font-bold truncate">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.organization}
                    {item.domain ? ` · ${item.domain}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {kindFilter === 'all' && (
                  <>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveOrder(idx, -1)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                      aria-label="Move entry up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === filtered.length - 1}
                      onClick={() => moveOrder(idx, 1)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                      aria-label="Move entry down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    const nextStatus: PublishStatus = item.status === 'draft' ? 'published' : 'draft';
                    await saveExperience({ ...item, status: nextStatus });
                    await refreshAdminData();
                  }}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                  aria-label="Toggle visibility"
                >
                  {item.status === 'draft' ? (
                    <Eye className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-amber-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => openEditor(item)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-blue-600 cursor-pointer"
                  aria-label="Edit entry"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(item)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-500 cursor-pointer"
                  aria-label="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold">
                {isNew ? 'Add Experience / Achievement Entry' : 'Edit Entry'}
              </h2>
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
                  <label className="block text-xs font-mono mb-1">Category *</label>
                  <select
                    value={editing.kind}
                    onChange={(e) =>
                      setEditing({ ...editing, kind: e.target.value as ExperienceKind })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    {ALL_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {KIND_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Duration *</label>
                  <input
                    type="text"
                    required
                    value={editing.duration}
                    onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                    placeholder="e.g. 1 Month / Aug 2026"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono mb-1">Title / Program Name *</label>
                  <input
                    type="text"
                    required
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={editing.organization}
                    onChange={(e) => setEditing({ ...editing, organization: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Role (Optional)</label>
                  <input
                    type="text"
                    value={editing.role || ''}
                    onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Domain / Field</label>
                  <input
                    type="text"
                    value={editing.domain || ''}
                    onChange={(e) => setEditing({ ...editing, domain: e.target.value })}
                    placeholder="e.g. Cybersecurity / Robotics"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Work Mode / Location</label>
                  <input
                    type="text"
                    value={editing.workMode || ''}
                    onChange={(e) => setEditing({ ...editing, workMode: e.target.value })}
                    placeholder="e.g. Virtual / On-site"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Start Date</label>
                  <input
                    type="text"
                    value={editing.startDate || ''}
                    onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                    placeholder="Aug 2026"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">End Date</label>
                  <input
                    type="text"
                    value={editing.endDate || ''}
                    onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
                    placeholder="Sep 2026"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Credential / Reg ID</label>
                  <input
                    type="text"
                    value={editing.credentialId || ''}
                    onChange={(e) => setEditing({ ...editing, credentialId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">Verification URL</label>
                  <input
                    type="url"
                    value={editing.verificationUrl || ''}
                    onChange={(e) => setEditing({ ...editing, verificationUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono mb-1">
                  Key Highlights (one per line)
                </label>
                <textarea
                  rows={3}
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono mb-1">
                    Technologies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={techText}
                    onChange={(e) => setTechText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono mb-1">
                    Skills Learned (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={skillsLearnedText}
                    onChange={(e) => setSkillsLearnedText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="block text-xs font-mono">Certificate / Supporting File</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf,.pdf"
                    onChange={(e) => handleFileUpload(e, 'cert')}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={uploadingField === 'cert'}
                      onClick={() => fileRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingField === 'cert' ? 'Uploading...' : 'Upload'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerField('cert')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Library</span>
                    </button>
                    {editing.certificateImage && (
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, certificateImage: '' })}
                        className="text-xs text-red-500 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {editing.certificateImage && (
                    <p className="text-[11px] font-mono text-slate-500 truncate">
                      Attached: {editing.certificateImage}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono">Organization Logo</label>
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={uploadingField === 'logo'}
                      onClick={() => logoRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingField === 'logo' ? 'Uploading...' : 'Upload'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerField('logo')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Library</span>
                    </button>
                    {editing.organizationLogo && (
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, organizationLogo: '' })}
                        className="text-xs text-red-500 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {editing.organizationLogo && (
                    <img
                      src={resolveUrl(editing.organizationLogo)}
                      alt="Org logo"
                      className="h-12 rounded-lg object-contain border border-slate-200 dark:border-slate-800 bg-white p-1"
                    />
                  )}
                </div>
              </div>

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
                  <span>{saving ? 'Saving...' : 'Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold">Delete Entry?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Delete <strong>{confirmDelete.title}</strong>?
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
                  await deleteExperience(confirmDelete.id);
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
        title={pickerField === 'logo' ? 'Select Organization Logo' : 'Select Certificate Asset'}
        onSelect={(url) => {
          if (!editing) return;
          setEditing({
            ...editing,
            ...(pickerField === 'logo' ? { organizationLogo: url } : { certificateImage: url }),
          });
        }}
      />
    </div>
  );
};
