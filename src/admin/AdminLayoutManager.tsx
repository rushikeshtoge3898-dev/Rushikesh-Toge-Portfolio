import React, { useState } from 'react';
import { GripVertical, ArrowUp, ArrowDown, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useCmsConfigEditor } from '../lib/useCmsConfigEditor';
import { CmsActionToolbar } from '../components/admin/CmsActionToolbar';
import { CmsLivePreviewModal } from '../components/admin/CmsLivePreviewModal';
import { CmsSectionConfig } from '../types';

export const AdminLayoutManager: React.FC = () => {
  const {
    sectionState: layout,
    setSectionState: setLayout,
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
  } = useCmsConfigEditor('layout');

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sections = layout.sections || [];

  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= sections.length || from === to) return;
    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLayout({ ...layout, sections: next });
  };

  const updateSection = (idx: number, patch: Partial<CmsSectionConfig>) => {
    const next = sections.map((sec, i) => (i === idx ? { ...sec, ...patch } : sec));
    setLayout({ ...layout, sections: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Section &amp; Page Layout Manager</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Drag and drop (or use arrows) to reorder public sections, hide/show sections without losing data, and customize section headers and spacing.
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

      <div className="space-y-3">
        {sections.map((sec, idx) => {
          const isExpanded = expandedId === sec.id;
          return (
            <div
              key={sec.id}
              draggable
              onDragStart={() => setDragIndex(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) moveSection(dragIndex, idx);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`bg-white dark:bg-slate-900/80 border rounded-2xl p-4 sm:p-5 transition-colors ${
                dragIndex === idx
                  ? 'border-blue-500 opacity-75'
                  : sec.visible === false
                  ? 'border-slate-200 dark:border-slate-800/60 opacity-70'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-grab shrink-0"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-500 tabular-nums">#{idx + 1}</span>
                      <span>·</span>
                      <span
                        className={
                          sec.visible === false
                            ? 'text-amber-600 dark:text-amber-400 font-semibold'
                            : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        }
                      >
                        {sec.visible === false ? 'Hidden' : 'Visible'}
                      </span>
                      <span>·</span>
                      <span className="text-slate-500">{sec.spacing}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold truncate">{sec.title || sec.label}</h3>
                    <p className="text-xs text-slate-500 truncate">{sec.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, idx - 1)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                    aria-label="Move section up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => moveSection(idx, idx + 1)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                    aria-label="Move section down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSection(idx, { visible: sec.visible === false })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {sec.visible === false ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Show</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                        <span>Hide</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : sec.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    <span>Customize</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono mb-1">Section Title</label>
                    <input
                      type="text"
                      maxLength={120}
                      value={sec.title}
                      onChange={(e) => updateSection(idx, { title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono mb-1">Section Subtitle</label>
                    <input
                      type="text"
                      maxLength={200}
                      value={sec.subtitle}
                      onChange={(e) => updateSection(idx, { subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono mb-1">Section Spacing</label>
                    <select
                      value={sec.spacing}
                      onChange={(e) =>
                        updateSection(idx, {
                          spacing: e.target.value as CmsSectionConfig['spacing'],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <option value="compact">Compact</option>
                      <option value="normal">Normal</option>
                      <option value="relaxed">Relaxed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono mb-1">Background Emphasis</label>
                    <select
                      value={sec.backgroundVariant}
                      onChange={(e) =>
                        updateSection(idx, {
                          backgroundVariant: e.target.value as CmsSectionConfig['backgroundVariant'],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <option value="default">Default Canvas</option>
                      <option value="subtle">Subtle Tinted Band</option>
                      <option value="accent">Soft Accent Wash</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CmsLivePreviewModal isOpen={previewOpen} onClose={closePreview} />
    </div>
  );
};
