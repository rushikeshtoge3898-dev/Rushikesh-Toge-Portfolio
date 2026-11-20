import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, isVerifiedAdminUser, testFirestoreConnection } from '../lib/firebase';
import {
  fetchPublicPortfolioData,
  fetchAdminAllData,
  seedMissingBaselineRecords,
  resolveProfilePhotoUrl,
  resolveManyAssetUrls,
} from '../lib/portfolioService';
import {
  PersonalInfo,
  Project,
  Certification,
  SkillCategory,
  EducationItem,
  ExperienceItem,
  ContactMessage,
  CmsSiteConfig,
  MediaAsset,
} from '../types';
import {
  personalInfo as defaultProfile,
  projectsList as defaultProjects,
  certificationsList as defaultCerts,
  skillCategories as defaultSkills,
  educationList as defaultEducation,
  initialExperienceList as defaultExperiences,
} from '../data/portfolioData';
import { DEFAULT_CMS_CONFIG } from '../data/defaultCmsConfig';

interface PortfolioContextValue {
  // Public state
  profile: PersonalInfo;
  cmsConfig: CmsSiteConfig;
  resolvedProfilePhotoUrl: string;
  resolvedAssets: Record<string, string>;
  resolveUrl: (raw?: string) => string;
  projects: Project[];
  certifications: Certification[];
  skillCategories: SkillCategory[];
  education: EducationItem[];
  experiences: ExperienceItem[];
  publicLoading: boolean;
  dbConnected: boolean;

  // Admin state
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  profileDraft: PersonalInfo | null;
  resolvedDraftPhotoUrl: string;
  adminCmsConfig: CmsSiteConfig;
  cmsDraft: CmsSiteConfig | null;
  cmsPrev: CmsSiteConfig | null;
  cmsPreviewOverride: CmsSiteConfig | null;
  setCmsPreviewOverride: (cfg: CmsSiteConfig | null) => void;
  adminProjects: Project[];
  adminCertifications: Certification[];
  adminSkillCategories: SkillCategory[];
  adminEducation: EducationItem[];
  adminExperiences: ExperienceItem[];
  adminMessages: ContactMessage[];
  mediaAssets: MediaAsset[];
  adminLoading: boolean;
  adminError: string | null;
  hasUnsavedProfileChanges: boolean;
  setHasUnsavedProfileChanges: (dirty: boolean) => void;

  refreshPublicData: () => Promise<void>;
  refreshAdminData: () => Promise<void>;
  logoutAdmin: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue>({
  profile: defaultProfile,
  cmsConfig: DEFAULT_CMS_CONFIG,
  resolvedProfilePhotoUrl: '',
  resolvedAssets: {},
  resolveUrl: (raw) => raw || '',
  projects: defaultProjects.filter((p) => p.status !== 'draft'),
  certifications: defaultCerts,
  skillCategories: defaultSkills,
  education: defaultEducation,
  experiences: defaultExperiences,
  publicLoading: true,
  dbConnected: true,
  user: null,
  authReady: false,
  isAdmin: false,
  profileDraft: null,
  resolvedDraftPhotoUrl: '',
  adminCmsConfig: DEFAULT_CMS_CONFIG,
  cmsDraft: null,
  cmsPrev: null,
  cmsPreviewOverride: null,
  setCmsPreviewOverride: () => {},
  adminProjects: [],
  adminCertifications: [],
  adminSkillCategories: [],
  adminEducation: [],
  adminExperiences: [],
  adminMessages: [],
  mediaAssets: [],
  adminLoading: false,
  adminError: null,
  hasUnsavedProfileChanges: false,
  setHasUnsavedProfileChanges: () => {},
  refreshPublicData: async () => {},
  refreshAdminData: async () => {},
  logoutAdmin: async () => {},
});

function collectAssetUrls(
  profile: PersonalInfo,
  cms: CmsSiteConfig,
  projects: Project[],
  certs: Certification[],
  edu: EducationItem[],
  exp: ExperienceItem[],
  media: MediaAsset[] = []
): string[] {
  const urls: string[] = [];
  if (profile.profilePhotoUrl) urls.push(profile.profilePhotoUrl);
  if (profile.resumeUrl) urls.push(profile.resumeUrl);
  if (cms.hero.photoOverrideUrl) urls.push(cms.hero.photoOverrideUrl);
  if (cms.seo.ogImage) urls.push(cms.seo.ogImage);
  if (cms.seo.faviconUrl) urls.push(cms.seo.faviconUrl);
  cms.about.aboutImages.forEach((u) => urls.push(u));
  cms.resume.versions.forEach((v) => urls.push(v.url));
  projects.forEach((p) => {
    if (p.thumbnailUrl) urls.push(p.thumbnailUrl);
    (p.galleryImages || []).forEach((g) => urls.push(g));
  });
  certs.forEach((c) => c.certificateImage && urls.push(c.certificateImage));
  edu.forEach((e) => {
    if (e.institutionLogo) urls.push(e.institutionLogo);
    if (e.supportingDocUrl) urls.push(e.supportingDocUrl);
  });
  exp.forEach((x) => {
    if (x.certificateImage) urls.push(x.certificateImage);
    if (x.organizationLogo) urls.push(x.organizationLogo);
  });
  media.forEach((m) => urls.push(m.url));
  return urls.filter(Boolean);
}

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PersonalInfo>(defaultProfile);
  const [cmsConfig, setCmsConfig] = useState<CmsSiteConfig>(DEFAULT_CMS_CONFIG);
  const [cmsPreviewOverride, setCmsPreviewOverride] = useState<CmsSiteConfig | null>(null);
  const [resolvedProfilePhotoUrl, setResolvedProfilePhotoUrl] = useState<string>('');
  const [resolvedAssets, setResolvedAssets] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Project[]>(
    defaultProjects.filter((p) => p.status !== 'draft')
  );
  const [certifications, setCertifications] = useState<Certification[]>(defaultCerts);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(defaultSkills);
  const [education, setEducation] = useState<EducationItem[]>(defaultEducation);
  const [experiences, setExperiences] = useState<ExperienceItem[]>(defaultExperiences);
  const [publicLoading, setPublicLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [profileDraft, setProfileDraft] = useState<PersonalInfo | null>(null);
  const [resolvedDraftPhotoUrl, setResolvedDraftPhotoUrl] = useState<string>('');
  const [cmsDraft, setCmsDraft] = useState<CmsSiteConfig | null>(null);
  const [cmsPrev, setCmsPrev] = useState<CmsSiteConfig | null>(null);
  const [adminProjects, setAdminProjects] = useState<Project[]>([]);
  const [adminCertifications, setAdminCertifications] = useState<Certification[]>([]);
  const [adminSkillCategories, setAdminSkillCategories] = useState<SkillCategory[]>([]);
  const [adminEducation, setAdminEducation] = useState<EducationItem[]>([]);
  const [adminExperiences, setAdminExperiences] = useState<ExperienceItem[]>([]);
  const [adminMessages, setAdminMessages] = useState<ContactMessage[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [hasUnsavedProfileChanges, setHasUnsavedProfileChanges] = useState(false);

  const refreshPublicData = useCallback(async () => {
    try {
      const data = await fetchPublicPortfolioData();
      setProfile(data.profile);
      setCmsConfig(data.cmsConfig);
      setProjects(data.projects);
      setCertifications(data.certifications);
      setSkillCategories(data.skillCategories);
      setEducation(data.education);
      setExperiences(data.experiences);

      const candidateUrls = collectAssetUrls(
        data.profile,
        data.cmsConfig,
        data.projects,
        data.certifications,
        data.education,
        data.experiences
      );
      const [resolvedPhoto, assetMap] = await Promise.all([
        resolveProfilePhotoUrl(data.cmsConfig.hero.photoOverrideUrl || data.profile.profilePhotoUrl),
        resolveManyAssetUrls(candidateUrls),
      ]);
      setResolvedProfilePhotoUrl(resolvedPhoto);
      setResolvedAssets((prev) => ({ ...prev, ...assetMap }));
    } catch (err) {
      console.error('Failed to load public portfolio data:', err);
    } finally {
      setPublicLoading(false);
    }
  }, []);

  const refreshAdminData = useCallback(async () => {
    if (!isVerifiedAdminUser(auth.currentUser)) return;
    setAdminLoading(true);
    setAdminError(null);
    try {
      await seedMissingBaselineRecords();
      const data = await fetchAdminAllData();
      setProfile(data.profile);
      setProfileDraft(data.profileDraft);
      setCmsConfig(data.cmsConfig);
      setCmsDraft(data.cmsDraft);
      setCmsPrev(data.cmsPrev);
      setAdminProjects(data.projects);
      setAdminCertifications(data.certifications);
      setAdminSkillCategories(data.skillCategories);
      setAdminEducation(data.education);
      setAdminExperiences(data.experiences);
      setAdminMessages(data.messages);
      setMediaAssets(data.mediaAssets);

      const candidateUrls = collectAssetUrls(
        data.profile,
        data.cmsDraft || data.cmsConfig,
        data.projects,
        data.certifications,
        data.education,
        data.experiences,
        data.mediaAssets
      );

      const [pubPhoto, draftPhoto, assetMap] = await Promise.all([
        resolveProfilePhotoUrl(data.profile.profilePhotoUrl),
        data.profileDraft?.profilePhotoUrl
          ? resolveProfilePhotoUrl(data.profileDraft.profilePhotoUrl)
          : Promise.resolve(''),
        resolveManyAssetUrls(candidateUrls),
      ]);

      setResolvedProfilePhotoUrl(pubPhoto);
      setResolvedDraftPhotoUrl(draftPhoto);
      setResolvedAssets((prev) => ({ ...prev, ...assetMap }));
      await refreshPublicData();
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Failed to load admin records.');
    } finally {
      setAdminLoading(false);
    }
  }, [refreshPublicData]);

  useEffect(() => {
    testFirestoreConnection().then(setDbConnected);
    refreshPublicData();

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      const adminValid = isVerifiedAdminUser(firebaseUser);
      setIsAdmin(adminValid);
      setAuthReady(true);

      if (adminValid) {
        await refreshAdminData();
      } else {
        setProfileDraft(null);
        setResolvedDraftPhotoUrl('');
        setCmsDraft(null);
        setCmsPrev(null);
        setAdminProjects([]);
        setAdminCertifications([]);
        setAdminSkillCategories([]);
        setAdminEducation([]);
        setAdminExperiences([]);
        setAdminMessages([]);
        setMediaAssets([]);
      }
    });

    return () => unsub();
  }, [refreshPublicData, refreshAdminData]);

  const logoutAdmin = async () => {
    await signOut(auth);
    setIsAdmin(false);
    setUser(null);
  };

  const resolveUrl = useCallback(
    (raw?: string) => {
      if (!raw) return '';
      if (raw.startsWith('firestore-asset://')) {
        return resolvedAssets[raw] || resolvedAssets[raw.split('?')[0]] || '';
      }
      return raw;
    },
    [resolvedAssets]
  );

  const effectiveCmsConfig = useMemo(
    () => cmsPreviewOverride || cmsConfig,
    [cmsPreviewOverride, cmsConfig]
  );

  return (
    <PortfolioContext.Provider
      value={{
        profile,
        cmsConfig: effectiveCmsConfig,
        resolvedProfilePhotoUrl,
        resolvedAssets,
        resolveUrl,
        projects,
        certifications,
        skillCategories,
        education,
        experiences,
        publicLoading,
        dbConnected,
        user,
        authReady,
        isAdmin,
        profileDraft,
        resolvedDraftPhotoUrl,
        adminCmsConfig: cmsConfig,
        cmsDraft,
        cmsPrev,
        cmsPreviewOverride,
        setCmsPreviewOverride,
        adminProjects,
        adminCertifications,
        adminSkillCategories,
        adminEducation,
        adminExperiences,
        adminMessages,
        mediaAssets,
        adminLoading,
        adminError,
        hasUnsavedProfileChanges,
        setHasUnsavedProfileChanges,
        refreshPublicData,
        refreshAdminData,
        logoutAdmin,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
