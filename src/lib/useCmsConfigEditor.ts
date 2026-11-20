import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  saveCmsDraft,
  publishCmsConfig,
  discardCmsDraft,
  restorePreviousCmsConfig,
} from './portfolioService';
import { CmsSiteConfig } from '../types';

export function useCmsConfigEditor<K extends keyof CmsSiteConfig>(sectionKey: K) {
  const {
    adminCmsConfig,
    cmsDraft,
    cmsPrev,
    refreshAdminData,
    setCmsPreviewOverride,
    setHasUnsavedProfileChanges,
  } = usePortfolio();

  const sourceConfig = useMemo(() => cmsDraft ?? adminCmsConfig, [cmsDraft, adminCmsConfig]);
  const [sectionState, setSectionState] = useState<CmsSiteConfig[K]>(sourceConfig[sectionKey]);
  const [baselineJson, setBaselineJson] = useState<string>(JSON.stringify(sourceConfig[sectionKey]));
  const [savingAction, setSavingAction] = useState<'draft' | 'publish' | 'discard' | 'restore' | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const src = (cmsDraft ?? adminCmsConfig)[sectionKey];
    setSectionState(src);
    setBaselineJson(JSON.stringify(src));
  }, [adminCmsConfig, cmsDraft, sectionKey]);

  const isDirty = useMemo(
    () => JSON.stringify(sectionState) !== baselineJson,
    [sectionState, baselineJson]
  );

  useEffect(() => {
    setHasUnsavedProfileChanges(isDirty);
    return () => setHasUnsavedProfileChanges(false);
  }, [isDirty, setHasUnsavedProfileChanges]);

  const buildFullConfig = useCallback((): CmsSiteConfig => {
    const base = cmsDraft ?? adminCmsConfig;
    return {
      ...base,
      [sectionKey]: sectionState,
    };
  }, [cmsDraft, adminCmsConfig, sectionKey, sectionState]);

  const handleSaveDraft = async () => {
    setSavingAction('draft');
    setNotice(null);
    try {
      await saveCmsDraft(buildFullConfig());
      await refreshAdminData();
      setNotice({
        type: 'ok',
        text: 'Draft saved to Firestore. Visitors continue seeing the live published version until you Publish.',
      });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save draft.',
      });
    } finally {
      setSavingAction(null);
    }
  };

  const handlePublish = async (afterPublish?: (cfg: CmsSiteConfig) => Promise<void>) => {
    setSavingAction('publish');
    setNotice(null);
    try {
      const next = buildFullConfig();
      await publishCmsConfig(next);
      if (afterPublish) {
        await afterPublish(next);
      }
      await refreshAdminData();
      setNotice({ type: 'ok', text: 'Changes published live to the public portfolio.' });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to publish changes.',
      });
    } finally {
      setSavingAction(null);
    }
  };

  const handleDiscardDraft = async () => {
    setSavingAction('discard');
    setNotice(null);
    try {
      await discardCmsDraft();
      await refreshAdminData();
      setNotice({ type: 'ok', text: 'Unpublished CMS draft discarded. Reverted to live settings.' });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to discard draft.',
      });
    } finally {
      setSavingAction(null);
    }
  };

  const handleRestorePrevious = async () => {
    setSavingAction('restore');
    setNotice(null);
    try {
      const restored = await restorePreviousCmsConfig();
      await refreshAdminData();
      setNotice({
        type: restored ? 'ok' : 'err',
        text: restored
          ? 'Restored previous published configuration.'
          : 'No previous published snapshot available yet.',
      });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Restore failed.',
      });
    } finally {
      setSavingAction(null);
    }
  };

  const openPreview = () => {
    setCmsPreviewOverride(buildFullConfig());
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setCmsPreviewOverride(null);
    setPreviewOpen(false);
  };

  return {
    sectionState,
    setSectionState,
    fullConfig: buildFullConfig(),
    hasDraft: Boolean(cmsDraft),
    hasPrev: Boolean(cmsPrev),
    isDirty,
    savingAction,
    notice,
    setNotice,
    previewOpen,
    openPreview,
    closePreview,
    handleSaveDraft,
    handlePublish,
    handleDiscardDraft,
    handleRestorePrevious,
  };
}
