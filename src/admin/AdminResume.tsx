import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Check,
  Save,
  FolderOpen,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  saveProfile,
  publishCmsConfig,
  uploadPersistentMedia,
  slugifyId,
} from '../lib/portfolioService';
import { ResumeVersion } from '../types';
import { MediaPickerModal } from '../components/admin/MediaPickerModal';

export const AdminResume: React.FC = () => {
  const { profile, adminCmsConfig, resolveUrl, refreshAdminData } = usePortfolio();
  const [buttonText, setButtonText] = useState(adminCmsConfig.resume.buttonText || 'Download Resume');
  const [versions, setVersions] = useState<ResumeVersion[]>(adminCmsConfig.resume.versions || []);
  const [versionLabel, setVersionLabel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmDeleteVersion, setConfirmDeleteVersion] = useState<ResumeVersion | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setButtonText(adminCmsConfig.resume.buttonText || 'Download Resume');
    setVersions(adminCmsConfig.resume.versions || []);
  }, [adminCmsConfig.resume]);

  const activePreviewUrl = resolveUrl(profile.resumeUrl);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setNotice(null);
    try {
      const uploaded = await uploadPersistentMedia(file, 'resume');
      const nowIso = new Date().toISOString();
      const newVersion: ResumeVersion = {
        id: slugifyId('res', versionLabel || file.name.replace(/\.pdf$/i, '')),
        label: versionLabel.trim() || file.name.replace(/\.pdf$/i, ''),
        url: uploaded.url,
        fileName: uploaded.name,
        uploadedAt: nowIso,
        size: uploaded.size,
      };
      const nextVersions = [newVersion, ...versions];
      await Promise.all([
        saveProfile({
          ...profile,
          resumeUrl: uploaded.url,
          resumeFileName: uploaded.name,
          resumeUpdatedAt: nowIso,
          showResumeDownload: true,
        }),
        publishCmsConfig({
          ...adminCmsConfig,
          resume: {
            buttonText: buttonText.trim() || 'Download Resume',
            versions: nextVersions,
          },
        }),
      ]);
      setVersionLabel('');
      await refreshAdminData();
      setNotice({ type: 'ok', text: `Uploaded and activated resume: ${uploaded.name}` });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Resume upload failed.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSetActiveVersion = async (v: ResumeVersion) => {
    setSavingMeta(true);
    setNotice(null);
    try {
      await saveProfile({
        ...profile,
        resumeUrl: v.url,
        resumeFileName: v.fileName,
        resumeUpdatedAt: v.uploadedAt,
        showResumeDownload: true,
      });
      await refreshAdminData();
      setNotice({ type: 'ok', text: `Activated resume version: ${v.label}` });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to activate version.',
      });
    } finally {
      setSavingMeta(false);
    }
  };

  const handleDeleteVersionConfirm = async () => {
    if (!confirmDeleteVersion) return;
    const nextVersions = versions.filter((v) => v.id !== confirmDeleteVersion.id);
    const removingActive = profile.resumeUrl === confirmDeleteVersion.url;
    await Promise.all([
      publishCmsConfig({
        ...adminCmsConfig,
        resume: {
          buttonText: buttonText.trim() || 'Download Resume',
          versions: nextVersions,
        },
      }),
      removingActive
        ? saveProfile({
            ...profile,
            resumeUrl: nextVersions[0]?.url || '',
            resumeFileName: nextVersions[0]?.fileName || '',
            resumeUpdatedAt: nextVersions[0]?.uploadedAt || '',
          })
        : Promise.resolve(),
    ]);
    setConfirmDeleteVersion(null);
    await refreshAdminData();
    setNotice({ type: 'ok', text: 'Resume version removed.' });
  };

  const handleRemoveActivePdf = async () => {
    await saveProfile({
      ...profile,
      resumeUrl: '',
      resumeFileName: '',
      resumeUpdatedAt: '',
    });
    await refreshAdminData();
    setNotice({
      type: 'ok',
      text: 'Cleared active PDF. Public site will use the dynamic ATS Resume modal.',
    });
  };

  const handleSaveButtonLabel = async () => {
    setSavingMeta(true);
    setNotice(null);
    try {
      await publishCmsConfig({
        ...adminCmsConfig,
        resume: {
          buttonText: buttonText.trim() || 'Download Resume',
          versions,
        },
      });
      await refreshAdminData();
      setNotice({ type: 'ok', text: 'Resume button text updated.' });
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Save failed.',
      });
    } finally {
      setSavingMeta(false);
    }
  };

  const toggleVisibility = async () => {
    await saveProfile({
      ...profile,
      showResumeDownload: profile.showResumeDownload === false,
    });
    await refreshAdminData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resume Manager</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload multiple resume PDF versions, switch the active public file, and customize the resume button label.
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

      {/* Active Resume & Upload Card */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {profile.resumeUrl ? profile.resumeFileName || 'Active Resume PDF' : 'ATS Summary Mode Active'}
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {profile.resumeUrl
                  ? `Updated: ${profile.resumeUpdatedAt ? new Date(profile.resumeUpdatedAt).toLocaleString() : 'Active'}`
                  : 'No PDF currently active — serving dynamic ATS Resume modal'}
              </p>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleUpload}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2">
            {activePreviewUrl && (
              <>
                <a
                  href={activePreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={profile.resumeFileName || 'Rushikesh_Toge_Resume.pdf'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={handleRemoveActivePdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Use ATS Mode</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Upload New Version */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-mono text-slate-500">
              Version Label (Optional, e.g. Cybersecurity Track)
            </label>
            <input
              type="text"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder="e.g. Cybersecurity Internship Resume v2"
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload New PDF'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold cursor-pointer"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Pick PDF</span>
            </button>
          </div>
        </div>

        {/* Button Text & Visibility */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-500">Public Resume Button Text</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
              />
              <button
                type="button"
                disabled={savingMeta}
                onClick={handleSaveButtonLabel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={profile.showResumeDownload !== false}
              onChange={toggleVisibility}
            />
            <span>Show Resume download button on public website</span>
          </label>
        </div>

        {activePreviewUrl && (
          <iframe
            src={activePreviewUrl}
            title="Uploaded Resume Preview"
            className="w-full h-[55vh] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
          />
        )}
      </div>

      {/* Stored Resume Versions */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold">Stored Resume Versions ({versions.length})</h2>
        {versions.length === 0 ? (
          <p className="text-xs text-slate-500">
            No versioned PDFs recorded yet. Uploading a PDF above adds it to version history automatically.
          </p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {versions.map((v) => {
              const isActive = profile.resumeUrl === v.url;
              return (
                <div
                  key={v.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{v.label}</span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-500 truncate">
                      {v.fileName} · {new Date(v.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isActive && (
                      <button
                        type="button"
                        disabled={savingMeta}
                        onClick={() => handleSetActiveVersion(v)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteVersion(v)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-500 cursor-pointer"
                      aria-label="Delete resume version"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirmDeleteVersion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold">Delete Resume Version?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Remove <strong>{confirmDeleteVersion.label}</strong> from resume version history?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteVersion(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVersionConfirm}
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
        defaultCategory="resume"
        acceptTypes="pdf"
        title="Select Existing Resume PDF"
        onSelect={async (url, asset) => {
          const nowIso = new Date().toISOString();
          const label = asset?.name || 'Selected Resume';
          const newV: ResumeVersion = {
            id: slugifyId('res', label),
            label,
            url,
            fileName: asset?.name || 'resume.pdf',
            uploadedAt: nowIso,
            size: asset?.size || 0,
          };
          const nextVersions = versions.some((x) => x.url === url)
            ? versions
            : [newV, ...versions];
          await Promise.all([
            saveProfile({
              ...profile,
              resumeUrl: url,
              resumeFileName: asset?.name || 'resume.pdf',
              resumeUpdatedAt: nowIso,
              showResumeDownload: true,
            }),
            publishCmsConfig({
              ...adminCmsConfig,
              resume: { buttonText, versions: nextVersions },
            }),
          ]);
          await refreshAdminData();
          setNotice({ type: 'ok', text: `Activated resume PDF: ${label}` });
        }}
      />
    </div>
  );
};
