import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { SkillCategory, SkillDetail, PublishStatus } from '../types';
import { saveSkillCategory, deleteSkillCategory, slugifyId } from '../lib/portfolioService';

const ICON_OPTIONS = [
  'Code2',
  'Globe',
  'Database',
  'Cpu',
  'Server',
  'GitBranch',
  'Sparkles',
  'Shield',
  'Terminal',
];

export const AdminSkills: React.FC = () => {
  const { adminSkillCategories, refreshAdminData } = usePortfolio();
  const [editing, setEditing] = useState<SkillCategory | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [skillsText, setSkillsText] = useState('');
  const [skillDetails, setSkillDetails] = useState<SkillDetail[]>([]);
  const [quickSkillInputs, setQuickSkillInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<SkillCategory | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const openEditor = (cat?: SkillCategory) => {
    if (cat) {
      setIsNew(false);
      setEditing({ ...cat });
      setSkillsText(cat.skills.join(', '));
      setSkillDetails(cat.skillDetails ? [...cat.skillDetails] : []);
    } else {
      setIsNew(true);
      setEditing({
        id: slugifyId('skill', 'category'),
        title: '',
        iconName: 'Code2',
        skills: [],
        skillDetails: [],
        status: 'published',
        order: adminSkillCategories.length + 1,
      });
      setSkillsText('');
      setSkillDetails([]);
    }
    setNotice(null);
  };

  const syncSkillDetailsFromList = (list: string[], existing: SkillDetail[]): SkillDetail[] => {
    const map = new Map(existing.map((d) => [d.name.toLowerCase(), d]));
    return list.map((name) => {
      const prev = map.get(name.toLowerCase());
      return prev ? { ...prev, name } : { name, proficiency: '', description: '' };
    });
  };

  const handleSaveCategory = async (e: React.FormEvent, overrideStatus?: PublishStatus) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setNotice(null);
    try {
      const skillsList = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const cleanedDetails = skillDetails.filter(
        (d) =>
          skillsList.some((s) => s.toLowerCase() === d.name.toLowerCase()) &&
          ((d.proficiency || '').trim() || (d.description || '').trim())
      );
      const finalId = isNew ? slugifyId('skill', editing.title) : editing.id;
      await saveSkillCategory(
        {
          ...editing,
          id: finalId,
          skills: skillsList,
          skillDetails: cleanedDetails,
          status: overrideStatus || editing.status || 'published',
        },
        isNew
      );
      await refreshAdminData();
      setEditing(null);
      setNotice({ type: 'ok', text: 'Skill category saved.' });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save skill category.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkillToCat = async (cat: SkillCategory) => {
    const val = (quickSkillInputs[cat.id] || '').trim();
    if (!val) return;
    try {
      await saveSkillCategory({
        ...cat,
        skills: [...cat.skills, val],
      });
      setQuickSkillInputs((prev) => ({ ...prev, [cat.id]: '' }));
      await refreshAdminData();
      setNotice({ type: 'ok', text: `Added "${val}" to ${cat.title}.` });
    } catch (err) {
      setNotice({ type: 'err', text: err instanceof Error ? err.message : 'Failed to add skill.' });
    }
  };

  const handleRemoveSkill = async (cat: SkillCategory, idx: number) => {
    try {
      const removedName = cat.skills[idx];
      const next = cat.skills.filter((_, i) => i !== idx);
      const nextDetails = (cat.skillDetails || []).filter(
        (d) => d.name.toLowerCase() !== removedName?.toLowerCase()
      );
      await saveSkillCategory({ ...cat, skills: next, skillDetails: nextDetails });
      await refreshAdminData();
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to remove skill.',
      });
    }
  };

  const moveSkill = async (cat: SkillCategory, idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= cat.skills.length) return;
    const next = [...cat.skills];
    [next[idx], next[target]] = [next[target], next[idx]];
    await saveSkillCategory({ ...cat, skills: next });
    await refreshAdminData();
  };

  const moveCategoryOrder = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= adminSkillCategories.length) return;
    const a = adminSkillCategories[idx];
    const b = adminSkillCategories[target];
    const aOrder = a.order ?? idx + 1;
    const bOrder = b.order ?? target + 1;
    await Promise.all([
      saveSkillCategory({ ...a, order: bOrder }),
      saveSkillCategory({ ...b, order: aOrder }),
    ]);
    await refreshAdminData();
  };

  const togglePublish = async (cat: SkillCategory) => {
    const nextStatus: PublishStatus = cat.status === 'draft' ? 'published' : 'draft';
    await saveSkillCategory({ ...cat, status: nextStatus });
    await refreshAdminData();
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    await deleteSkillCategory(confirmDelete.id);
    await refreshAdminData();
    setConfirmDelete(null);
    setNotice({ type: 'ok', text: 'Skill category deleted.' });
  };

  const currentSkillListInModal = skillsText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skills Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add, edit, reorder categories &amp; skills, or publish/hide genuine skills.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {adminSkillCategories.map((cat, catIdx) => {
          const detailMap = new Map<string, SkillDetail>(
            (cat.skillDetails || []).map((d) => [d.name.toLowerCase(), d])
          );
          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span
                      className={
                        cat.status === 'draft'
                          ? 'text-amber-600 dark:text-amber-400 font-semibold'
                          : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      }
                    >
                      {cat.status === 'draft' ? 'Hidden (Draft)' : 'Published'}
                    </span>
                    <span>·</span>
                    <span className="text-slate-500 tabular-nums">Order #{cat.order ?? catIdx + 1}</span>
                  </div>
                  <h3 className="text-base font-bold mt-0.5">{cat.title}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={catIdx === 0}
                    onClick={() => moveCategoryOrder(catIdx, -1)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                    aria-label="Move category up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={catIdx === adminSkillCategories.length - 1}
                    onClick={() => moveCategoryOrder(catIdx, 1)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                    aria-label="Move category down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePublish(cat)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs cursor-pointer"
                    aria-label="Toggle category visibility"
                  >
                    {cat.status === 'draft' ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditor(cat)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-blue-600 cursor-pointer"
                    aria-label="Edit category"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(cat)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-500 cursor-pointer"
                    aria-label="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {cat.skills.map((skill, idx) => {
                  const detail = detailMap.get(skill.toLowerCase());
                  return (
                    <div
                      key={`${cat.id}-${skill}-${idx}`}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    >
                      <div className="min-w-0 truncate">
                        <span>{skill}</span>
                        {detail?.proficiency && (
                          <span className="ml-2 text-[10px] text-blue-600 dark:text-blue-400">
                            ({detail.proficiency})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveSkill(cat, idx, -1)}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                          aria-label="Move skill up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSkill(cat, idx, 1)}
                          disabled={idx === cat.skills.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                          aria-label="Move skill down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(cat, idx)}
                          className="p-1 text-red-500 hover:text-red-400 cursor-pointer"
                          aria-label="Remove skill"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Wireshark)"
                  value={quickSkillInputs[cat.id] || ''}
                  onChange={(e) =>
                    setQuickSkillInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkillToCat(cat);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkillToCat(cat)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold">
                {isNew ? 'Add Skill Category' : 'Edit Skill Category'}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => handleSaveCategory(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-mono mb-1">Category Title *</label>
                <input
                  type="text"
                  required
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="e.g. Cybersecurity"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono mb-1">Icon</label>
                  <select
                    value={editing.iconName}
                    onChange={(e) => setEditing({ ...editing, iconName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                  >
                    {ICON_OPTIONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
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
              </div>
              <div>
                <label className="block text-xs font-mono mb-1">Skills (comma-separated)</label>
                <textarea
                  rows={2}
                  value={skillsText}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    setSkillsText(nextVal);
                    const nextList = nextVal
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    setSkillDetails((prev) => syncSkillDetailsFromList(nextList, prev));
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>

              {currentSkillListInModal.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-mono text-slate-500">
                    Optional Per-Skill Labels &amp; Notes (leave blank if not needed — never auto-generated)
                  </p>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {currentSkillListInModal.map((skillName) => {
                      const entry = skillDetails.find(
                        (d) => d.name.toLowerCase() === skillName.toLowerCase()
                      ) || { name: skillName, proficiency: '', description: '' };
                      const updateDetail = (patch: Partial<SkillDetail>) => {
                        setSkillDetails((prev) => {
                          const exists = prev.some(
                            (d) => d.name.toLowerCase() === skillName.toLowerCase()
                          );
                          if (exists) {
                            return prev.map((d) =>
                              d.name.toLowerCase() === skillName.toLowerCase()
                                ? { ...d, ...patch }
                                : d
                            );
                          }
                          return [...prev, { ...entry, ...patch }];
                        });
                      };

                      return (
                        <div
                          key={skillName}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                        >
                          <span className="sm:col-span-3 text-xs font-mono font-semibold truncate">
                            {skillName}
                          </span>
                          <input
                            type="text"
                            value={entry.proficiency || ''}
                            onChange={(e) => updateDetail({ proficiency: e.target.value })}
                            placeholder="Level (optional)"
                            className="sm:col-span-4 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                          />
                          <input
                            type="text"
                            value={entry.description || ''}
                            onChange={(e) => updateDetail({ description: e.target.value })}
                            placeholder="Short note (optional)"
                            className="sm:col-span-5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
                  onClick={(e) => handleSaveCategory(e, 'published')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold">Delete Skill Category?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Delete <strong>{confirmDelete.title}</strong> and its skill list?
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
    </div>
  );
};
