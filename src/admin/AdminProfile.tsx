import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Save,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  User,
  Eye,
  Send,
  X,
  Plus,
  RotateCcw,
  Loader2,
  Globe,
  MapPin,
  Mail,
  Phone,
  Github,
  Linkedin,
  AlertTriangle,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  saveProfileDraft,
  publishProfile,
  discardProfileDraft,
  uploadPersistentProfilePhoto,
  validateProfileImageFile,
} from '../lib/portfolioService';
import { PersonalInfo, PortfolioLink } from '../types';

function splitComma(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeForCompare(
  info: PersonalInfo,
  interestsText: string,
  languagesText: string,
  courseworkText: string
): string {
  return JSON.stringify({
    name: info.name || '',
    headline: info.headline || '',
    subheadline: info.subheadline || '',
    intro: info.intro || '',
    aboutText: info.aboutText || '',
    location: info.location || '',
    phone: info.phone || '',
    email: info.email || '',
    linkedin: info.linkedin || '',
    github: info.github || '',
    portfolioLinks: (info.portfolioLinks || []).map((l) => ({
      label: l.label || '',
      url: l.url || '',
    })),
    profilePhotoUrl: info.profilePhotoUrl || '',
    interests: splitComma(interestsText),
    spokenLanguages: splitComma(languagesText),
    relevantCoursework: splitComma(courseworkText),
    educationSummary: info.educationSummary || {},
  });
}

export const AdminProfile: React.FC = () => {
  const {
    profile,
    profileDraft,
    resolvedProfilePhotoUrl,
    resolvedDraftPhotoUrl,
    refreshAdminData,
    setHasUnsavedProfileChanges,
  } = usePortfolio();

  const initialSource = profileDraft ?? profile;

  const [form, setForm] = useState<PersonalInfo>(initialSource);
  const [interestsText, setInterestsText] = useState('');
  const [languagesText, setLanguagesText] = useState('');
  const [courseworkText, setCourseworkText] = useState('');
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [pendingPhotoPreview, setPendingPhotoPreview] = useState<string>('');
  const [baselineSnapshot, setBaselineSnapshot] = useState<string>('');

  const [savingAction, setSavingAction] = useState<'draft' | 'publish' | 'discard' | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const src = profileDraft ?? profile;
    const nextInterests = (src.interests || []).join(', ');
    const nextLanguages = (src.spokenLanguages || []).join(', ');
    const nextCoursework = (src.relevantCoursework || []).join(', ');
    setForm({
      ...src,
      portfolioLinks: src.portfolioLinks || [],
    });
    setInterestsText(nextInterests);
    setLanguagesText(nextLanguages);
    setCourseworkText(nextCoursework);
    setBaselineSnapshot(normalizeForCompare(src, nextInterests, nextLanguages, nextCoursework));
    setPendingPhotoFile(null);
    setPendingPhotoPreview('');
  }, [profile, profileDraft]);

  useEffect(() => {
    return () => {
      if (pendingPhotoPreview) {
        URL.revokeObjectURL(pendingPhotoPreview);
      }
    };
  }, [pendingPhotoPreview]);

  const currentSnapshot = useMemo(
    () => normalizeForCompare(form, interestsText, languagesText, courseworkText),
    [form, interestsText, languagesText, courseworkText]
  );

  const isDirty = Boolean(pendingPhotoFile) || (baselineSnapshot !== '' && currentSnapshot !== baselineSnapshot);

  useEffect(() => {
    setHasUnsavedProfileChanges(isDirty);
  }, [isDirty, setHasUnsavedProfileChanges]);

  useEffect(() => {
    return () => setHasUnsavedProfileChanges(false);
  }, [setHasUnsavedProfileChanges]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const activePhotoPreview = useMemo(() => {
    if (pendingPhotoPreview) return pendingPhotoPreview;
    if (!form.profilePhotoUrl) return '';
    if (form.profilePhotoUrl === profileDraft?.profilePhotoUrl && resolvedDraftPhotoUrl) {
      return resolvedDraftPhotoUrl;
    }
    if (form.profilePhotoUrl === profile.profilePhotoUrl && resolvedProfilePhotoUrl) {
      return resolvedProfilePhotoUrl;
    }
    if (!form.profilePhotoUrl.startsWith('firestore-asset://')) {
      return form.profilePhotoUrl;
    }
    return resolvedDraftPhotoUrl || resolvedProfilePhotoUrl || '';
  }, [
    pendingPhotoPreview,
    form.profilePhotoUrl,
    profileDraft?.profilePhotoUrl,
    profile.profilePhotoUrl,
    resolvedDraftPhotoUrl,
    resolvedProfilePhotoUrl,
  ]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusMsg(null);

    try {
      await validateProfileImageFile(file);
      if (pendingPhotoPreview) {
        URL.revokeObjectURL(pendingPhotoPreview);
      }
      const objectUrl = URL.createObjectURL(file);
      setPendingPhotoFile(file);
      setPendingPhotoPreview(objectUrl);
      setStatusMsg({
        type: 'ok',
        text: `Preview loaded for "${file.name}". Click "Save Changes" or "Publish" to store permanently.`,
      });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Invalid profile image selected.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const clearPendingPhoto = () => {
    if (pendingPhotoPreview) {
      URL.revokeObjectURL(pendingPhotoPreview);
    }
    setPendingPhotoFile(null);
    setPendingPhotoPreview('');
  };

  const buildCompleteProfile = async (): Promise<{
    payload: PersonalInfo;
    storageNote: string;
  }> => {
    let nextPhotoUrl = form.profilePhotoUrl || '';
    let storageNote = '';

    if (pendingPhotoFile) {
      setUploadingPhoto(true);
      try {
        const uploaded = await uploadPersistentProfilePhoto(pendingPhotoFile);
        nextPhotoUrl = uploaded.url;
        storageNote =
          uploaded.storageMode === 'firebase-storage'
            ? ' Profile picture uploaded to Firebase Cloud Storage.'
            : ' Profile picture stored persistently in Firestore database (Firebase Cloud Storage bucket rules were unavailable).';
      } finally {
        setUploadingPhoto(false);
      }
    }

    const payload: PersonalInfo = {
      ...form,
      profilePhotoUrl: nextPhotoUrl,
      interests: splitComma(interestsText),
      spokenLanguages: splitComma(languagesText),
      relevantCoursework: splitComma(courseworkText),
      portfolioLinks: (form.portfolioLinks || [])
        .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
        .filter((l) => l.label && l.url),
    };

    return { payload, storageNote };
  };

  const handleSaveDraft = async () => {
    if (!form.name.trim() || !form.headline.trim() || !form.email.trim()) {
      setStatusMsg({
        type: 'err',
        text: 'Full Name, Professional Headline, and Email Address are required.',
      });
      return;
    }

    setSavingAction('draft');
    setStatusMsg(null);
    try {
      const { payload, storageNote } = await buildCompleteProfile();
      await saveProfileDraft(payload);
      clearPendingPhoto();
      await refreshAdminData();
      setStatusMsg({
        type: 'ok',
        text: `Draft saved to Firestore.${storageNote} Public visitors will continue seeing the last published version until you click Publish.`,
      });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save draft.',
      });
    } finally {
      setSavingAction(null);
    }
  };

  const handlePublish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name.trim() || !form.headline.trim() || !form.email.trim()) {
      setStatusMsg({
        type: 'err',
        text: 'Full Name, Professional Headline, and Email Address are required.',
      });
      return;
    }

    setSavingAction('publish');
    setStatusMsg(null);
    try {
      const { payload, storageNote } = await buildCompleteProfile();
      await publishProfile(payload);
      clearPendingPhoto();
      await refreshAdminData();
      setStatusMsg({
        type: 'ok',
        text: `Profile & About changes published to the live portfolio.${storageNote}`,
      });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to publish profile.',
      });
    } finally {
      setSavingAction(null);
    }
  };

  const handleResetLocalEdits = () => {
    const src = profileDraft ?? profile;
    setForm({ ...src, portfolioLinks: src.portfolioLinks || [] });
    setInterestsText((src.interests || []).join(', '));
    setLanguagesText((src.spokenLanguages || []).join(', '));
    setCourseworkText((src.relevantCoursework || []).join(', '));
    clearPendingPhoto();
    setShowCancelConfirm(false);
    setStatusMsg({ type: 'ok', text: 'Unsaved local changes reverted.' });
  };

  const handleDiscardSavedDraft = async () => {
    setSavingAction('discard');
    setStatusMsg(null);
    try {
      await discardProfileDraft();
      clearPendingPhoto();
      await refreshAdminData();
      setShowCancelConfirm(false);
      setStatusMsg({
        type: 'ok',
        text: 'Unpublished draft discarded. Reverted to live published profile.',
      });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to discard draft.',
      });
    } finally {
      setSavingAction(null);
    }
  };

  const addPortfolioLink = () => {
    const current = form.portfolioLinks || [];
    if (current.length >= 10) return;
    setForm({
      ...form,
      portfolioLinks: [...current, { label: '', url: '' }],
    });
  };

  const updatePortfolioLink = (index: number, field: keyof PortfolioLink, value: string) => {
    const current = [...(form.portfolioLinks || [])];
    current[index] = { ...current[index], [field]: value };
    setForm({ ...form, portfolioLinks: current });
  };

  const removePortfolioLink = (index: number) => {
    const current = [...(form.portfolioLinks || [])];
    current.splice(index, 1);
    setForm({ ...form, portfolioLinks: current });
  };

  const previewParagraphs = (form.aboutText || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const previewInterests = splitComma(interestsText);

  const isBusy = savingAction !== null || uploadingPhoto;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile &amp; About</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your personal profile, profile picture, portfolio links, and About Me copy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {profileDraft ? (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
              Unpublished Draft Saved
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
              Live Synced
            </span>
          )}
          {isDirty && (
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300">
              Unsaved Changes
            </span>
          )}
        </div>
      </div>

      {isDirty && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            You have unsaved changes. Click <strong>Save Changes</strong> to store a draft or{' '}
            <strong>Publish</strong> to update the live website.
          </span>
        </div>
      )}

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            statusMsg.type === 'ok'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200'
          }`}
        >
          {statusMsg.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Profile Picture Card */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/30 bg-slate-100 dark:bg-slate-950 flex items-center justify-center shrink-0">
          {activePhotoPreview ? (
            <img
              src={activePhotoPreview}
              alt={form.name || 'Profile Preview'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="w-10 h-10 text-slate-400" />
          )}
          {uploadingPhoto && (
            <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-sm font-bold">Profile Picture</h2>
            {pendingPhotoFile && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Preview ready — save or publish to apply
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload PNG, JPG, or WEBP (max 5 MB). Existing profile picture stays intact until you save or publish a replacement.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
            >
              {uploadingPhoto ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>
                {uploadingPhoto
                  ? 'Uploading...'
                  : activePhotoPreview
                  ? 'Replace Photo'
                  : 'Upload Photo'}
              </span>
            </button>

            {pendingPhotoFile && (
              <button
                type="button"
                disabled={isBusy}
                onClick={clearPendingPhoto}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-slate-400 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Keep Previous</span>
              </button>
            )}

            {(form.profilePhotoUrl || pendingPhotoFile) && (
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  clearPendingPhoto();
                  setForm({ ...form, profilePhotoUrl: '' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Profile & About Editor Form */}
      <form
        onSubmit={handlePublish}
        className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-name" className="block text-xs font-mono mb-1">
              Full Name *
            </label>
            <input
              id="profile-name"
              type="text"
              required
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label htmlFor="profile-location" className="block text-xs font-mono mb-1">
              Location
            </label>
            <input
              id="profile-location"
              type="text"
              maxLength={160}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="profile-headline" className="block text-xs font-mono mb-1">
              Professional Headline *
            </label>
            <input
              id="profile-headline"
              type="text"
              required
              maxLength={200}
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="profile-subheadline" className="block text-xs font-mono mb-1">
              Professional Summary / Subheadline
            </label>
            <input
              id="profile-subheadline"
              type="text"
              maxLength={240}
              value={form.subheadline}
              onChange={(e) => setForm({ ...form, subheadline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="profile-intro" className="block text-xs font-mono mb-1">
              Personal Introduction (Hero Section)
            </label>
            <textarea
              id="profile-intro"
              rows={3}
              maxLength={1000}
              value={form.intro}
              onChange={(e) => setForm({ ...form, intro: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="profile-about" className="block text-xs font-mono mb-1">
              About Me Content (separate paragraphs with a blank line)
            </label>
            <textarea
              id="profile-about"
              rows={5}
              maxLength={5000}
              value={form.aboutText}
              onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-xs font-mono mb-1">
              Email Address *
            </label>
            <input
              id="profile-email"
              type="email"
              required
              maxLength={160}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-xs font-mono mb-1">
              Phone Number (optional)
            </label>
            <input
              id="profile-phone"
              type="text"
              maxLength={30}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label htmlFor="profile-github" className="block text-xs font-mono mb-1">
              GitHub URL
            </label>
            <input
              id="profile-github"
              type="url"
              maxLength={300}
              value={form.github}
              onChange={(e) => setForm({ ...form, github: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label htmlFor="profile-linkedin" className="block text-xs font-mono mb-1">
              LinkedIn URL
            </label>
            <input
              id="profile-linkedin"
              type="url"
              maxLength={300}
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          {/* Portfolio Links Section */}
          <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-mono">Additional Portfolio Links</label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Optional external profiles or portfolio links (e.g., TryHackMe, LeetCode, Blog, Personal Site).
                </p>
              </div>
              <button
                type="button"
                onClick={addPortfolioLink}
                disabled={(form.portfolioLinks || []).length >= 10}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            {(form.portfolioLinks || []).map((link, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  maxLength={60}
                  placeholder="Label (e.g. TryHackMe)"
                  value={link.label}
                  onChange={(e) => updatePortfolioLink(idx, 'label', e.target.value)}
                  className="sm:col-span-4 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
                <input
                  type="url"
                  maxLength={300}
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => updatePortfolioLink(idx, 'url', e.target.value)}
                  className="sm:col-span-7 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
                <button
                  type="button"
                  onClick={() => removePortfolioLink(idx)}
                  aria-label="Remove portfolio link"
                  className="sm:col-span-1 p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="profile-interests" className="block text-xs font-mono mb-1">
              Career Interests (comma-separated)
            </label>
            <input
              id="profile-interests"
              type="text"
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label htmlFor="profile-languages" className="block text-xs font-mono mb-1">
              Spoken Languages (comma-separated)
            </label>
            <input
              id="profile-languages"
              type="text"
              value={languagesText}
              onChange={(e) => setLanguagesText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>

          <div>
            <label htmlFor="profile-cgpa" className="block text-xs font-mono mb-1">
              First Year CGPA
            </label>
            <input
              id="profile-cgpa"
              type="number"
              step="0.01"
              value={form.educationSummary?.cgpa ?? 9.39}
              onChange={(e) =>
                setForm({
                  ...form,
                  educationSummary: {
                    ...form.educationSummary,
                    cgpa: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono tabular-nums"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="profile-coursework" className="block text-xs font-mono mb-1">
              Relevant Coursework (comma-separated)
            </label>
            <input
              id="profile-coursework"
              type="text"
              value={courseworkText}
              onChange={(e) => setCourseworkText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
          </div>
        </div>

        {/* Action Toolbar: Cancel, Preview, Save Changes (Draft), Publish */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                if (isDirty || profileDraft) {
                  setShowCancelConfirm(true);
                } else {
                  setStatusMsg({ type: 'ok', text: 'No unsaved edits to cancel.' });
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold cursor-pointer"
            >
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Preview</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isBusy}
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60 text-slate-900 dark:text-slate-100 text-xs font-semibold cursor-pointer"
            >
              {savingAction === 'draft' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{savingAction === 'draft' ? 'Saving Draft...' : 'Save Changes'}</span>
            </button>

            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold cursor-pointer"
            >
              {savingAction === 'publish' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{savingAction === 'publish' ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-[#060913] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold">Public Portfolio Preview</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Previewing current edits before publishing live.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hero Preview */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row gap-6 items-center">
              <div className="w-28 h-28 rounded-full border-2 border-blue-500/30 bg-white dark:bg-slate-950 overflow-hidden flex items-center justify-center shrink-0">
                {activePhotoPreview ? (
                  <img
                    src={activePhotoPreview}
                    alt={form.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-blue-500" />
                )}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-2xl font-extrabold uppercase tracking-tight">{form.name}</h3>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {form.headline}
                </p>
                {form.subheadline && (
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {form.subheadline}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {form.intro}
                </p>
                <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {form.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {form.location}
                    </span>
                  )}
                  {form.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> {form.email}
                    </span>
                  )}
                  {form.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> +91 {form.phone}
                    </span>
                  )}
                  {form.github && (
                    <span className="inline-flex items-center gap-1">
                      <Github className="w-3.5 h-3.5" /> GitHub
                    </span>
                  )}
                  {form.linkedin && (
                    <span className="inline-flex items-center gap-1">
                      <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                    </span>
                  )}
                  {(form.portfolioLinks || [])
                    .filter((l) => l.label && l.url)
                    .map((l, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> {l.label}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* About Preview */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400">
                About Me Preview
              </h4>
              {previewParagraphs.map((para, i) => (
                <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {para}
                </p>
              ))}
              {previewInterests.length > 0 && (
                <p className="text-xs font-mono text-blue-600 dark:text-blue-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  Interests: {previewInterests.join(' · ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel / Discard Confirmation Modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold">Cancel Editing?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Choose whether to discard your unsaved local edits or discard any saved unpublished draft and restore the live published version.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              {isDirty && (
                <button
                  type="button"
                  onClick={handleResetLocalEdits}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Revert Unsaved Local Edits
                </button>
              )}
              {profileDraft && (
                <button
                  type="button"
                  disabled={savingAction === 'discard'}
                  onClick={handleDiscardSavedDraft}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
                >
                  {savingAction === 'discard'
                    ? 'Discarding Draft...'
                    : 'Discard Saved Draft & Restore Live Profile'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
