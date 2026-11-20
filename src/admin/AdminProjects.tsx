import React, { useState, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Upload,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Project, ProjectWorkStatus, PublishStatus } from '../types';
import {
  saveProject,
  deleteProject,
  slugifyId,
  uploadPersistentMedia,
} from '../lib/portfolioService';
import { MediaPickerModal } from '../components/admin/MediaPickerModal';

const EMPTY_PROJECT: Project = {
  id: '',
  title: '',
  category: '',
  isFeatured: false,
  role: '',
  shortDescription: '',
  fullDescription: '',
  keyFeatures: [],
  technologies: [],
  personalContribution: '',
  liveDemoUrl: '',
  githubUrl: '',
  thumbnailUrl: '',
  galleryImages: [],
  projectStatus: 'Completed',
  status: 'draft',
  order: 1,
};

export const AdminProjects: React.FC = () => {
  const { adminProjects, resolveUrl, refreshAdminData } = usePortfolio();
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Project | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [featuresText, setFeaturesText] = useState('');
  const [techText, setTechText] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'thumbnail' | 'gallery' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  const openEditor = (proj?: Project) => {
    if (proj) {
      setIsNew(false);
      setEditing({ ...proj, galleryImages: proj.galleryImages || [] });
      setFeaturesText((proj.keyFeatures || []).join(', '));
      setTechText((proj.technologies || []).join(', '));
    } else {
      setIsNew(true);
      setEditing({
        ...EMPTY_PROJECT,
        id: slugifyId('proj', 'project'),
        order: adminProjects.length + 1,
      });
      setFeaturesText('');
      setTechText('');
    }
    setNotice(null);
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const res = await uploadPersistentMedia(file, 'project');
      setEditing({ ...editing, thumbnailUrl: res.url });
      await refreshAdminData();
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Thumbnail upload failed.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !editing) return;
    const files: File[] = Array.from(fileList);
    setGalleryUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const f of files) {
        const res = await uploadPersistentMedia(f, 'project');
        uploadedUrls.push(res.url);
      }
      setEditing({
        ...editing,
        galleryImages: [...(editing.galleryImages || []), ...uploadedUrls],
      });
      await refreshAdminData();
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gallery upload failed.',
      });
    } finally {
      setGalleryUploading(false);
      e.target.value = '';
    }
  };

  const moveGalleryImage = (idx: number, dir: -1 | 1) => {
    if (!editing) return;
    const list = [...(editing.galleryImages || [])];
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];
    setEditing({ ...editing, galleryImages: list });
  };

  const handleSave = async (e: React.FormEvent, overrideStatus?: PublishStatus) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setNotice(null);
    try {
      const splitComma = (raw: string) =>
        raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

      const finalId = isNew ? slugifyId('proj', editing.title) : editing.id;
      await saveProject(
        {
          ...editing,
          id: finalId,
          status: overrideStatus || editing.status || 'published',
          keyFeatures: splitComma(featuresText),
          technologies: splitComma(techText),
        },
        isNew
      );
      await refreshAdminData();
      setEditing(null);
      setNotice({ type: 'ok', text: 'Project saved to database.' });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save project.',
      });
    } finally {
      setSaving(false);
    }
  };

  const moveProjectOrder = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= adminProjects.length) return;
    const a = adminProjects[idx];
    const b = adminProjects[target];
    const aOrder = a.order ?? idx + 1;
    const bOrder = b.order ?? target + 1;
    await Promise.all([
      saveProject({ ...a, order: bOrder }),
      saveProject({ ...b, order: aOrder }),
    ]);
    await refreshAdminData();
  };

  const togglePublish = async (proj: Project) => {
    try {
      const nextStatus: PublishStatus = proj.status === 'draft' ? 'published' : 'draft';
      await saveProject({ ...proj, status: nextStatus });
      await refreshAdminData();
      setNotice({
        type: 'ok',
        text: `"${proj.title}" marked as ${nextStatus}.`,
      });
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
      await deleteProject(confirmDelete.id);
      await refreshAdminData();
      setConfirmDelete(null);
      setNotice({ type: 'ok', text: 'Project deleted.' });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Delete failed.',
      });
    }
  };

  const filtered = adminProjects.filter((p) => {
    const matchesStatus =
      filter === 'all' || (filter === 'draft' ? p.status === 'draft' : p.status !== 'draft');
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.technologies || []).some((t) => t.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const canReorder = filter === 'all' && !search.trim();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage published projects, drafts, featured flags, categories, thumbnails, and screenshot galleries.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
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

      {/* Filters */}
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
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm sm:w-64"
        />
      </div>

      {/* Project Rows */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500">
            No matching projects found.
          </div>
        ) : (
          filtered.map((proj, idx) => (
            <div
              key={proj.id}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                {proj.thumbnailUrl && (
                  <img
                    src={resolveUrl(proj.thumbnailUrl)}
                    alt={proj.title}
                    className="w-16 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0 hidden sm:block"
                  />
                )}
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span
                      className={
                        proj.status === 'draft'
                          ? 'text-amber-600 dark:text-amber-400 font-semibold'
                          : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      }
                    >
                      {proj.status === 'draft' ? 'Draft' : 'Published'}
                    </span>
                    {proj.isFeatured && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      </>
                    )}
                    {proj.category && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500">{proj.category}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500 tabular-nums">Order #{proj.order ?? idx + 1}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {proj.shortDescription}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {canReorder && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveProjectOrder(idx, -1)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                      aria-label="Move project up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === filtered.length - 1}
                      onClick={() => moveProjectOrder(idx, 1)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                      aria-label="Move project down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => togglePublish(proj)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {proj.status === 'draft' ? (
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
                  onClick={() => openEditor(proj)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-blue-600 cursor-pointer"
                  aria-label="Edit project"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(proj)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                  aria-label="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold">
                {isNew ? 'Add New Project' : 'Edit Project'}
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
                  <label className="block text-xs font-mono mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono mb-1">Category</label>
                  <input
                    type="text"
                    value={editing.category || ''}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    placeholder="e.g. Full-Stack Web / Security"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono mb-1">Role</label>
                  <input
                    type="text"
                    value={editing.role || ''}
                    onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono mb-1">Project Status</label>
                  <select
                    value={editing.projectStatus || 'Completed'}
                    onChange={(e) =>
                      setEditing({ ...editing, projectStatus: e.target.value as ProjectWorkStatus })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Planned">Planned</option>
                  </select>
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
                  <label className="block text-xs font-mono mb-1">Short Description *</label>
                  <textarea
                    required
                    rows={2}
                    value={editing.shortDescription}
                    onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    value={editing.fullDescription}
                    onChange={(e) => setEditing({ ...editing, fullDescription: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
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

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono mb-1">
                    Key Features (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono mb-1">Personal Contribution</label>
                  <textarea
                    rows={2}
                    value={editing.personalContribution}
                    onChange={(e) =>
                      setEditing({ ...editing, personalContribution: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={editing.githubUrl}
                    onChange={(e) => setEditing({ ...editing, githubUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono mb-1">Live Demo URL</label>
                  <input
                    type="text"
                    value={editing.liveDemoUrl || ''}
                    onChange={(e) => setEditing({ ...editing, liveDemoUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-6 pt-1">
                  <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.isFeatured}
                      onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })}
                    />
                    <span>Featured Project</span>
                  </label>
                </div>

                {/* Thumbnail Image */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-mono mb-1.5">Thumbnail Image</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbUpload}
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
                      <span>{uploading ? 'Uploading...' : 'Upload Thumbnail'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerTarget('thumbnail')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Choose from Library</span>
                    </button>
                    {editing.thumbnailUrl && (
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, thumbnailUrl: '' })}
                        className="text-xs text-red-500 cursor-pointer ml-1"
                      >
                        Remove thumbnail
                      </button>
                    )}
                  </div>
                  {editing.thumbnailUrl && (
                    <img
                      src={resolveUrl(editing.thumbnailUrl)}
                      alt="Thumbnail preview"
                      className="mt-2 h-28 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
                    />
                  )}
                </div>

                {/* Multi-Screenshot Gallery */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="block text-xs font-mono">
                    Project Screenshots Gallery (Optional)
                  </label>
                  <input
                    ref={galleryFileRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={galleryUploading}
                      onClick={() => galleryFileRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{galleryUploading ? 'Uploading...' : 'Add Screenshots'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerTarget('gallery')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Pick from Library</span>
                    </button>
                  </div>

                  {(editing.galleryImages || []).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                      {(editing.galleryImages || []).map((imgUrl, gIdx) => (
                        <div
                          key={`${imgUrl}-${gIdx}`}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950"
                        >
                          <img
                            src={resolveUrl(imgUrl)}
                            alt={`Screenshot ${gIdx + 1}`}
                            className="w-full h-20 object-cover"
                          />
                          <div className="p-1 flex items-center justify-between">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                disabled={gIdx === 0}
                                onClick={() => moveGalleryImage(gIdx, -1)}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={gIdx === (editing.galleryImages || []).length - 1}
                                onClick={() => moveGalleryImage(gIdx, 1)}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setEditing({
                                  ...editing,
                                  galleryImages: (editing.galleryImages || []).filter(
                                    (_, i) => i !== gIdx
                                  ),
                                })
                              }
                              className="p-1 text-red-500 cursor-pointer"
                              aria-label="Remove screenshot"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
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
                  <span>{saving ? 'Saving...' : 'Publish Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold">Delete Project?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Permanently delete <strong>{confirmDelete.title}</strong>? This action cannot be undone.
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
        isOpen={Boolean(pickerTarget)}
        onClose={() => setPickerTarget(null)}
        defaultCategory="project"
        acceptTypes="image"
        title={pickerTarget === 'gallery' ? 'Add Gallery Image' : 'Select Project Thumbnail'}
        onSelect={(url) => {
          if (!editing) return;
          if (pickerTarget === 'thumbnail') {
            setEditing({ ...editing, thumbnailUrl: url });
          } else if (pickerTarget === 'gallery') {
            setEditing({
              ...editing,
              galleryImages: [...(editing.galleryImages || []), url],
            });
          }
        }}
      />
    </div>
  );
};
