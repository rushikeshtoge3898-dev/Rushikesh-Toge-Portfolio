import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCmsConfigEditor } from '../lib/useCmsConfigEditor';
import { CmsActionToolbar } from '../components/admin/CmsActionToolbar';
import { CmsLivePreviewModal } from '../components/admin/CmsLivePreviewModal';
import { CmsNavItem } from '../types';

export const AdminNavigation: React.FC = () => {
  const {
    sectionState: navigation,
    setSectionState: setNavigation,
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
  } = useCmsConfigEditor('navigation');

  const items = navigation.items || [];

  const updateItem = (idx: number, patch: Partial<CmsNavItem>) => {
    const next = items.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    setNavigation({ ...navigation, items: next });
  };

  const addItem = () => {
    if (items.length >= 15) return;
    const nextItem: CmsNavItem = {
      id: `nav-${Date.now()}`,
      label: 'New Link',
      href: '#about',
      isExternal: false,
      visible: true,
      showOnMobile: true,
      order: items.length + 1,
    };
    setNavigation({ ...navigation, items: [...items, nextItem] });
  };

  const removeItem = (idx: number) => {
    setNavigation({ ...navigation, items: items.filter((_, i) => i !== idx) });
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    setNavigation({
      ...navigation,
      items: next.map((item, i) => ({ ...item, order: i + 1 })),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Navigation Manager</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Add, rename, reorder, hide, or configure mobile visibility for header navbar links.
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

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-mono mb-1">Navbar Brand Text</label>
            <input
              type="text"
              maxLength={40}
              value={navigation.brandText}
              onChange={(e) => setNavigation({ ...navigation, brandText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold"
            />
          </div>
          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={addItem}
              disabled={items.length >= 15}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add Nav Item</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-mono text-slate-500 mb-1">Label</label>
                  <input
                    type="text"
                    maxLength={40}
                    value={item.label}
                    onChange={(e) => updateItem(idx, { label: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  />
                </div>
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-mono text-slate-500 mb-1">
                    Target (#section or https://...)
                  </label>
                  <input
                    type="text"
                    maxLength={300}
                    value={item.href}
                    onChange={(e) => updateItem(idx, { href: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-3 flex items-center justify-end gap-1.5 pt-4 sm:pt-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, -1)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 cursor-pointer"
                    aria-label="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => moveItem(idx, 1)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 cursor-pointer"
                    aria-label="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-red-500 cursor-pointer"
                    aria-label="Delete nav item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5 text-xs">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.visible !== false}
                    onChange={(e) => updateItem(idx, { visible: e.target.checked })}
                  />
                  <span>Visible</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.showOnMobile !== false}
                    onChange={(e) => updateItem(idx, { showOnMobile: e.target.checked })}
                  />
                  <span>Include in Mobile Drawer</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(item.isExternal)}
                    onChange={(e) => updateItem(idx, { isExternal: e.target.checked })}
                  />
                  <span>Open External Tab</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CmsLivePreviewModal isOpen={previewOpen} onClose={closePreview} />
    </div>
  );
};
