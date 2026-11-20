import React, { useState, useEffect } from 'react';
import {
  Save,
  Database,
  CheckCircle2,
  AlertCircle,
  DownloadCloud,
  FileDown,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';
import {
  saveProfile,
  publishCmsConfig,
  seedMissingBaselineRecords,
  saveProject,
  saveCertification,
  slugifyId,
} from '../lib/portfolioService';
import { Project, Certification } from '../types';

export const AdminSettings: React.FC = () => {
  const {
    profile,
    adminCmsConfig,
    adminProjects,
    adminCertifications,
    adminSkillCategories,
    adminEducation,
    adminExperiences,
    refreshAdminData,
  } = usePortfolio();
  const { theme, setTheme } = useTheme();

  const [siteName, setSiteName] = useState(adminCmsConfig.settings.siteName);
  const [siteUrl, setSiteUrl] = useState(adminCmsConfig.settings.siteUrl);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(
    adminCmsConfig.settings.maintenanceNotice.enabled
  );
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    adminCmsConfig.settings.maintenanceNotice.message
  );
  const [showExp, setShowExp] = useState(profile.showExperienceSection !== false);
  const [showWorkshops, setShowWorkshops] = useState(profile.showWorkshopsSection !== false);
  const [showResume, setShowResume] = useState(profile.showResumeDownload !== false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    setSiteName(adminCmsConfig.settings.siteName);
    setSiteUrl(adminCmsConfig.settings.siteUrl);
    setMaintenanceEnabled(adminCmsConfig.settings.maintenanceNotice.enabled);
    setMaintenanceMessage(adminCmsConfig.settings.maintenanceNotice.message);
    setShowExp(profile.showExperienceSection !== false);
    setShowWorkshops(profile.showWorkshopsSection !== false);
    setShowResume(profile.showResumeDownload !== false);
  }, [adminCmsConfig, profile]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setNotice(null);
    try {
      await Promise.all([
        saveProfile({
          ...profile,
          defaultTheme: theme,
          showExperienceSection: showExp,
          showWorkshopsSection: showWorkshops,
          showResumeDownload: showResume,
        }),
        publishCmsConfig({
          ...adminCmsConfig,
          appearance: {
            ...adminCmsConfig.appearance,
            defaultTheme: theme,
          },
          layout: {
            sections: adminCmsConfig.layout.sections.map((s) => {
              if (s.id === 'experience') return { ...s, visible: showExp };
              if (s.id === 'activities') return { ...s, visible: showWorkshops };
              return s;
            }),
          },
          settings: {
            ...adminCmsConfig.settings,
            siteName,
            siteUrl,
            showExperienceSection: showExp,
            showWorkshopsSection: showWorkshops,
            showResumeDownload: showResume,
            maintenanceNotice: {
              enabled: maintenanceEnabled,
              message: maintenanceMessage,
            },
            lastUpdatedLabel: new Date().toISOString(),
          },
        }),
      ]);
      await refreshAdminData();
      setNotice({ type: 'ok', text: 'Website settings & visibility flags saved to Firestore.' });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackupJson = () => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      profile,
      cmsConfig: adminCmsConfig,
      projects: adminProjects,
      certifications: adminCertifications,
      skillCategories: adminSkillCategories,
      education: adminEducation,
      experiences: adminExperiences,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rushikesh-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice({ type: 'ok', text: 'Portfolio JSON backup exported cleanly.' });
  };

  const handleSeedMissing = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await seedMissingBaselineRecords();
      await refreshAdminData();
      setNotice({
        type: 'ok',
        text:
          res.seededCount > 0
            ? `Seeded ${res.seededCount} missing baseline records without overwriting existing entries.`
            : 'All baseline collections are already populated in Firestore.',
      });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Seeding failed.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImportLegacyLocalStorage = async () => {
    setSaving(true);
    setNotice(null);
    try {
      let imported = 0;
      const customProjsRaw = localStorage.getItem('portfolio_custom_projects');
      if (customProjsRaw) {
        const list = JSON.parse(customProjsRaw) as Project[];
        for (const p of list) {
          await saveProject({ ...p, id: slugifyId('proj', p.title), status: 'draft' }, true);
          imported++;
        }
      }
      const customCertsRaw = localStorage.getItem('portfolio_custom_certificates');
      if (customCertsRaw) {
        const list = JSON.parse(customCertsRaw) as Certification[];
        for (const c of list) {
          await saveCertification({ ...c, id: slugifyId('cert', c.title), status: 'draft' }, true);
          imported++;
        }
      }
      await refreshAdminData();
      setNotice({
        type: 'ok',
        text:
          imported > 0
            ? `Imported ${imported} legacy browser items as drafts into Firestore.`
            : 'No legacy custom browser items found in localStorage.',
      });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Legacy import failed.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Website Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure site identity, maintenance banner, section visibility, backups, and safe database helpers.
        </p>
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

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold">General Identity &amp; Maintenance Banner</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-500">Website Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-500">Website URL</label>
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={maintenanceEnabled}
              onChange={(e) => setMaintenanceEnabled(e.target.checked)}
            />
            <span>Show public announcement / maintenance notice banner</span>
          </label>
          {maintenanceEnabled && (
            <input
              type="text"
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="e.g. Updating portfolio sections — feel free to reach out via email."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
            />
          )}
        </div>

        <h3 className="text-sm font-bold pt-2">Theme &amp; Section Visibility</h3>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500">Active Theme:</span>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              theme === 'light' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Light
          </button>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showExp}
              onChange={(e) => setShowExp(e.target.checked)}
            />
            <span>Display Internship &amp; Experience section on public portfolio</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showWorkshops}
              onChange={(e) => setShowWorkshops(e.target.checked)}
            />
            <span>Display Workshops, Industrial Training &amp; Achievements section on public portfolio</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showResume}
              onChange={(e) => setShowResume(e.target.checked)}
            />
            <span>Enable Resume Preview / Download on public portfolio</span>
          </label>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveSettings}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold">Backup &amp; Non-Destructive Database Utilities</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Non-destructive utilities: existing Firestore documents are never overwritten or deleted. Export a full JSON backup before major edits.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportBackupJson}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-blue-500 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export Portfolio JSON Backup</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSeedMissing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-blue-500 cursor-pointer"
          >
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Verify / Seed Missing Baseline Records</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleImportLegacyLocalStorage}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-blue-500 cursor-pointer"
          >
            <DownloadCloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Import Legacy Browser Drafts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
