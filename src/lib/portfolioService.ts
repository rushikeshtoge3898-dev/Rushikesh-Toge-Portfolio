import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage, handleFirestoreError, OperationType } from './firebase';
import {
  PersonalInfo,
  PortfolioLink,
  Project,
  Certification,
  SkillCategory,
  EducationItem,
  ExperienceItem,
  ExperienceKind,
  ContactMessage,
  CmsSiteConfig,
  MediaAsset,
  MediaCategory,
} from '../types';
import {
  personalInfo as defaultProfile,
  projectsList as defaultProjects,
  certificationsList as defaultCerts,
  skillCategories as defaultSkills,
  educationList as defaultEducation,
  initialExperienceList as defaultExperiences,
} from '../data/portfolioData';
import { DEFAULT_CMS_CONFIG, mergeCmsConfig } from '../data/defaultCmsConfig';

const assetResolutionCache = new Map<string, string>();

const STATIC_CERT_ASSETS: MediaAsset[] = [
  {
    id: 'static-python101',
    name: 'python101_certificate.svg',
    category: 'certificate',
    mimeType: 'image/svg+xml',
    fileType: 'svg',
    url: '/python101_certificate.svg',
    storageMode: 'public-static',
    size: 0,
  },
  {
    id: 'static-nptel',
    name: 'nptel_python_certificate.svg',
    category: 'certificate',
    mimeType: 'image/svg+xml',
    fileType: 'svg',
    url: '/nptel_python_certificate.svg',
    storageMode: 'public-static',
    size: 0,
  },
  {
    id: 'static-nasa',
    name: 'nasa_arset_certificate.svg',
    category: 'certificate',
    mimeType: 'image/svg+xml',
    fileType: 'svg',
    url: '/nasa_arset_certificate.svg',
    storageMode: 'public-static',
    size: 0,
  },
  {
    id: 'static-cpp',
    name: 'imarticus_cpp_certificate.svg',
    category: 'certificate',
    mimeType: 'image/svg+xml',
    fileType: 'svg',
    url: '/imarticus_cpp_certificate.svg',
    storageMode: 'public-static',
    size: 0,
  },
  {
    id: 'static-buscomm',
    name: 'imarticus_buscomm_certificate.svg',
    category: 'certificate',
    mimeType: 'image/svg+xml',
    fileType: 'svg',
    url: '/imarticus_buscomm_certificate.svg',
    storageMode: 'public-static',
    size: 0,
  },
  {
    id: 'static-pms',
    name: 'pms_robotics_certificate.svg',
    category: 'certificate',
    mimeType: 'image/svg+xml',
    fileType: 'svg',
    url: '/pms_robotics_certificate.svg',
    storageMode: 'public-static',
    size: 0,
  },
  {
    id: 'static-favicon',
    name: 'favicon.svg',
    category: 'seo',
    mimeType: 'image/svg+xml',
    fileType: 'svg',
    url: '/favicon.svg',
    storageMode: 'public-static',
    size: 0,
  },
];

export function slugifyId(prefix: string, raw?: string): string {
  const base = (raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix}-${base || 'item'}-${rand}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function clampString(val: string | undefined, max: number): string {
  return (val || '').trim().slice(0, max);
}

function clampList(list: string[] | undefined, maxItems: number, maxItemLen = 180): string[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((s) => String(s).trim().slice(0, maxItemLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function clampPortfolioLinks(list: PortfolioLink[] | undefined): PortfolioLink[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => ({
      label: clampString(item?.label, 60),
      url: clampString(item?.url, 300),
    }))
    .filter((item) => item.label.length > 0 && item.url.length > 0)
    .slice(0, 10);
}

export async function validateProfileImageFile(file: File): Promise<{
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
  ext: 'png' | 'jpg' | 'webp';
}> {
  if (!file || file.size <= 0) {
    throw new Error('Selected image file is empty.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must not exceed 5 MB.');
  }

  const headerBuf = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(headerBuf);

  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { mimeType: 'image/png', ext: 'png' };
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mimeType: 'image/jpeg', ext: 'jpg' };
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === 'RIFF' &&
    String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === 'WEBP'
  ) {
    return { mimeType: 'image/webp', ext: 'webp' };
  }

  throw new Error('Unsupported image format. Please choose a valid PNG, JPG, or WEBP file.');
}

async function detectAnyMediaFile(file: File): Promise<{
  mimeType: string;
  ext: string;
  fileType: 'image' | 'pdf' | 'svg';
}> {
  if (!file || file.size <= 0) {
    throw new Error('Selected file is empty.');
  }

  const headerBuf = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(headerBuf);

  // PDF: %PDF-
  if (
    bytes.length >= 5 &&
    String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]) === '%PDF-'
  ) {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('PDF files must not exceed 10 MB.');
    }
    return { mimeType: 'application/pdf', ext: 'pdf', fileType: 'pdf' };
  }

  // PNG / JPG / WEBP
  try {
    const imgSig = await validateProfileImageFile(file);
    return { mimeType: imgSig.mimeType, ext: imgSig.ext, fileType: 'image' };
  } catch {
    // Check SVG cleanly
  }

  if (file.name.toLowerCase().endsWith('.svg') || file.type === 'image/svg+xml') {
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('SVG files must not exceed 2 MB.');
    }
    const text = await file.text();
    const hasSvg = /<svg[\s>]/i.test(text);
    const hasUnsafe = /<script|javascript:|on\w+\s*=/i.test(text);
    if (hasSvg && !hasUnsafe) {
      return { mimeType: 'image/svg+xml', ext: 'svg', fileType: 'svg' };
    }
    throw new Error('Unsafe or invalid SVG file.');
  }

  throw new Error('Unsupported file format. Allowed: PNG, JPG, WEBP, SVG, or PDF.');
}

async function compressImageToDataUrl(
  file: File,
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp',
  maxDim = 960
): Promise<{ dataUrl: string; outputMime: 'image/png' | 'image/jpeg' | 'image/webp' }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not decode selected image.'));
      el.src = objectUrl;
    });

    const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
    const width = Math.max(1, Math.round((img.width || 1) * scale));
    const height = Math.max(1, Math.round((img.height || 1) * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable.');
    ctx.drawImage(img, 0, 0, width, height);

    let outputMime: 'image/png' | 'image/jpeg' | 'image/webp' =
      mimeType === 'image/png' ? 'image/webp' : mimeType;
    let dataUrl = canvas.toDataURL(outputMime, 0.86);
    if (!dataUrl.startsWith(`data:${outputMime}`)) {
      outputMime = 'image/jpeg';
      dataUrl = canvas.toDataURL(outputMime, 0.84);
    }
    if (dataUrl.length > 700000) {
      outputMime = 'image/jpeg';
      dataUrl = canvas.toDataURL(outputMime, 0.7);
    }
    if (dataUrl.length > 740000) {
      throw new Error('Image remains too large after optimization. Please choose a smaller file.');
    }

    return { dataUrl, outputMime };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function fileToBase64DataUrl(file: File, mimeType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = typeof reader.result === 'string' ? reader.result : '';
      if (!res.startsWith('data:')) {
        resolve(`data:${mimeType};base64,${res.split(',')[1] || ''}`);
      } else {
        resolve(res);
      }
    };
    reader.onerror = () => reject(new Error('Could not read file for database storage.'));
    reader.readAsDataURL(file);
  });
}

function getStorageFolder(category: MediaCategory): string {
  switch (category) {
    case 'profile':
      return 'profile';
    case 'project':
      return 'projects';
    case 'certificate':
      return 'certificates';
    case 'resume':
      return 'resumes';
    case 'logo':
      return 'logos';
    case 'seo':
      return 'seo';
    case 'about':
      return 'about';
    default:
      return 'media';
  }
}

export async function uploadPersistentMedia(
  file: File,
  category: MediaCategory,
  fixedAssetId?: string
): Promise<MediaAsset & { previewUrl: string }> {
  if (!auth.currentUser) {
    throw new Error('Authentication required before uploading media.');
  }

  const sig = await detectAnyMediaFile(file);
  if (category === 'resume' && sig.fileType !== 'pdf') {
    throw new Error('Resume uploads must be PDF files.');
  }

  const assetId = fixedAssetId || slugifyId(category, file.name.replace(/\.[^.]+$/, ''));
  const folder = getStorageFolder(category);
  const objectPath = `portfolio/${folder}/${assetId}-${Date.now()}.${sig.ext}`;

  let finalUrl = '';
  let previewUrl = '';
  let storageMode: MediaAsset['storageMode'] = 'firebase-storage';
  let storagePath = '';

  // 1. Primary: Firebase Cloud Storage
  try {
    const storageRef = ref(storage, objectPath);
    await Promise.race([
      uploadBytes(storageRef, file, {
        contentType: sig.mimeType,
        cacheControl: 'public, max-age=31536000',
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase Storage upload timed out.')), 12000)
      ),
    ]);
    const downloadUrl = await getDownloadURL(storageRef);
    finalUrl = downloadUrl;
    previewUrl = downloadUrl;
    storagePath = objectPath;
    storageMode = 'firebase-storage';
  } catch (storageErr) {
    console.warn(
      'Firebase Cloud Storage unavailable, attempting persistent Firestore database fallback:',
      storageErr instanceof Error ? storageErr.message : storageErr
    );

    // 2. Persistent Firestore Asset Fallback (site_assets/{assetId})
    let dataUrl = '';
    let outputMime = sig.mimeType;

    if (sig.fileType === 'image') {
      const compressed = await compressImageToDataUrl(
        file,
        sig.mimeType as 'image/png' | 'image/jpeg' | 'image/webp',
        category === 'profile' ? 640 : 1200
      );
      dataUrl = compressed.dataUrl;
      outputMime = compressed.outputMime;
    } else {
      if (file.size > 520 * 1024) {
        throw new Error(
          'This PDF/SVG exceeds 520 KB and Firebase Cloud Storage is not enabled yet. Enable Firebase Storage in Firebase Console (with storage.rules) or compress the file below 520 KB.'
        );
      }
      dataUrl = await fileToBase64DataUrl(file, sig.mimeType);
      if (dataUrl.length > 740000) {
        throw new Error('Encoded file exceeds Firestore 750 KB fallback limit.');
      }
    }

    try {
      await setDoc(doc(db, 'site_assets', assetId), {
        id: assetId,
        mimeType: outputMime,
        dataUrl,
        updatedAt: serverTimestamp(),
      });
      assetResolutionCache.set(`firestore-asset://${assetId}`, dataUrl);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `site_assets/${assetId}`);
    }

    finalUrl = `firestore-asset://${assetId}`;
    previewUrl = dataUrl;
    storageMode = 'firestore-asset';
  }

  // Record in centralized media_assets registry (best-effort; never lose uploaded URL)
  const meta: MediaAsset = {
    id: assetId,
    name: clampString(file.name, 200) || `${category}.${sig.ext}`,
    category,
    mimeType: sig.mimeType,
    fileType: sig.fileType,
    url: finalUrl,
    storageMode,
    storagePath: storagePath || undefined,
    size: file.size,
  };

  try {
    await setDoc(doc(db, 'media_assets', assetId), {
      ...meta,
      storagePath: storagePath || '',
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Could not index asset in media_assets:', err);
  }

  return { ...meta, previewUrl };
}

export async function uploadPersistentProfilePhoto(file: File): Promise<{
  url: string;
  storageMode: 'firebase-storage' | 'firestore-asset';
  previewUrl: string;
}> {
  const uploaded = await uploadPersistentMedia(file, 'profile', 'profile_photo');
  return {
    url: `${uploaded.url}${uploaded.url.includes('?') ? '&' : '?'}v=${Date.now()}`,
    storageMode:
      uploaded.storageMode === 'firebase-storage' ? 'firebase-storage' : 'firestore-asset',
    previewUrl: uploaded.previewUrl,
  };
}

export async function resolveAssetUrl(rawUrl?: string): Promise<string> {
  if (!rawUrl) return '';
  if (!rawUrl.startsWith('firestore-asset://')) return rawUrl;

  const cleanKey = rawUrl.split('?')[0];
  if (assetResolutionCache.has(cleanKey)) {
    return assetResolutionCache.get(cleanKey) || '';
  }

  const assetId = cleanKey.replace('firestore-asset://', '').trim();
  if (!assetId) return '';

  try {
    const snap = await getDoc(doc(db, 'site_assets', assetId));
    if (snap.exists()) {
      const data = snap.data() as { dataUrl?: string };
      const resolved = data.dataUrl || '';
      if (resolved) {
        assetResolutionCache.set(cleanKey, resolved);
      }
      return resolved;
    }
  } catch (err) {
    console.warn(`Could not resolve Firestore asset ${assetId}:`, err);
  }
  return '';
}

export const resolveProfilePhotoUrl = resolveAssetUrl;

export async function resolveManyAssetUrls(urls: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(urls.filter((u) => u && u.startsWith('firestore-asset://'))));
  const out: Record<string, string> = {};
  await Promise.all(
    unique.map(async (u) => {
      out[u] = await resolveAssetUrl(u);
    })
  );
  return out;
}

export async function fetchMediaAssets(): Promise<MediaAsset[]> {
  try {
    const snap = await getDocs(collection(db, 'media_assets'));
    const uploaded = snap.docs
      .map((d) => ({ ...(d.data() as MediaAsset), id: d.id }))
      .sort((a, b) => {
        const aSec = (a.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
        const bSec = (b.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
        return bSec - aSec;
      });
    return [...uploaded, ...STATIC_CERT_ASSETS];
  } catch (err) {
    console.warn('Could not fetch media_assets collection:', err);
    return [...STATIC_CERT_ASSETS];
  }
}

export async function deleteMediaAsset(asset: MediaAsset): Promise<void> {
  if (asset.storageMode === 'public-static') {
    throw new Error('Built-in static public SVG files cannot be deleted from Media Manager.');
  }

  if (asset.storageMode === 'firebase-storage' && asset.storagePath) {
    try {
      await deleteObject(ref(storage, asset.storagePath));
    } catch (err) {
      console.warn('Storage object removal skipped:', err);
    }
  } else if (asset.storageMode === 'firestore-asset') {
    try {
      await deleteDoc(doc(db, 'site_assets', asset.id));
      assetResolutionCache.delete(`firestore-asset://${asset.id}`);
    } catch (err) {
      console.warn('site_assets doc removal skipped:', err);
    }
  } else if (asset.storageMode === 'server-upload' && asset.url.startsWith('/uploads/')) {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      const fname = asset.url.replace('/uploads/', '');
      await fetch(`/api/uploads/${encodeURIComponent(fname)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  }

  try {
    await deleteDoc(doc(db, 'media_assets', asset.id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `media_assets/${asset.id}`);
  }
}

// --- Public Read Queries (strictly filtered by status == 'published') ---
export async function fetchPublicPortfolioData(): Promise<{
  profile: PersonalInfo;
  cmsConfig: CmsSiteConfig;
  projects: Project[];
  certifications: Certification[];
  skillCategories: SkillCategory[];
  education: EducationItem[];
  experiences: ExperienceItem[];
  fromDatabase: boolean;
}> {
  let fromDatabase = false;
  let dbSeeded = false;

  let profile = defaultProfile;
  try {
    const profileSnap = await getDoc(doc(db, 'site_settings', 'profile'));
    if (profileSnap.exists()) {
      profile = { ...defaultProfile, ...(profileSnap.data() as PersonalInfo) };
      fromDatabase = true;
      dbSeeded = true;
    }
  } catch (err) {
    console.warn('Public profile fallback active:', err);
  }

  let cmsConfig = DEFAULT_CMS_CONFIG;
  try {
    const cmsSnap = await getDoc(doc(db, 'site_settings', 'cms_config'));
    if (cmsSnap.exists()) {
      cmsConfig = mergeCmsConfig(DEFAULT_CMS_CONFIG, cmsSnap.data() as Partial<CmsSiteConfig>);
      fromDatabase = true;
    }
  } catch (err) {
    console.warn('Public CMS config fallback active:', err);
  }

  async function loadPublished<T extends { order?: number }>(
    colName: string,
    fallback: T[]
  ): Promise<T[]> {
    try {
      const q = query(collection(db, colName), where('status', '==', 'published'));
      const snap = await getDocs(q);
      if (snap.empty) {
        if (dbSeeded) {
          return [];
        }
        return fallback.filter((item: T & { status?: string }) => item.status !== 'draft');
      }
      fromDatabase = true;
      const items = snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }));
      return items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    } catch (err) {
      console.warn(`Public ${colName} fallback active:`, err);
      return fallback.filter((item: T & { status?: string }) => item.status !== 'draft');
    }
  }

  const [projects, certifications, skillCategories, education, experiences] = await Promise.all([
    loadPublished<Project>('projects', defaultProjects),
    loadPublished<Certification>('certifications', defaultCerts),
    loadPublished<SkillCategory>('skill_categories', defaultSkills),
    loadPublished<EducationItem>('education', defaultEducation),
    loadPublished<ExperienceItem>('experiences', defaultExperiences),
  ]);

  return {
    profile,
    cmsConfig,
    projects,
    certifications,
    skillCategories,
    education,
    experiences,
    fromDatabase,
  };
}

// --- Admin Read Queries (reads published + draft) ---
export async function fetchAdminAllData(): Promise<{
  profile: PersonalInfo;
  profileDraft: PersonalInfo | null;
  cmsConfig: CmsSiteConfig;
  cmsDraft: CmsSiteConfig | null;
  cmsPrev: CmsSiteConfig | null;
  projects: Project[];
  certifications: Certification[];
  skillCategories: SkillCategory[];
  education: EducationItem[];
  experiences: ExperienceItem[];
  messages: ContactMessage[];
  mediaAssets: MediaAsset[];
}> {
  const [
    profSnap,
    draftSnap,
    cmsSnap,
    cmsDraftSnap,
    cmsPrevSnap,
    projSnap,
    certSnap,
    skillSnap,
    eduSnap,
    expSnap,
    msgSnap,
    mediaAssets,
  ] = await Promise.all([
    getDoc(doc(db, 'site_settings', 'profile')).catch((e) =>
      handleFirestoreError(e, OperationType.GET, 'site_settings/profile')
    ),
    getDoc(doc(db, 'site_settings', 'profile_draft')).catch((e) =>
      handleFirestoreError(e, OperationType.GET, 'site_settings/profile_draft')
    ),
    getDoc(doc(db, 'site_settings', 'cms_config')).catch(() => null),
    getDoc(doc(db, 'site_settings', 'cms_config_draft')).catch(() => null),
    getDoc(doc(db, 'site_settings', 'cms_config_prev')).catch(() => null),
    getDocs(collection(db, 'projects')).catch((e) =>
      handleFirestoreError(e, OperationType.LIST, 'projects')
    ),
    getDocs(collection(db, 'certifications')).catch((e) =>
      handleFirestoreError(e, OperationType.LIST, 'certifications')
    ),
    getDocs(collection(db, 'skill_categories')).catch((e) =>
      handleFirestoreError(e, OperationType.LIST, 'skill_categories')
    ),
    getDocs(collection(db, 'education')).catch((e) =>
      handleFirestoreError(e, OperationType.LIST, 'education')
    ),
    getDocs(collection(db, 'experiences')).catch((e) =>
      handleFirestoreError(e, OperationType.LIST, 'experiences')
    ),
    getDocs(collection(db, 'contact_messages')).catch((e) =>
      handleFirestoreError(e, OperationType.LIST, 'contact_messages')
    ),
    fetchMediaAssets(),
  ]);

  const sortByOrder = <T extends { order?: number }>(list: T[]) =>
    list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const profile = profSnap.exists()
    ? { ...defaultProfile, ...(profSnap.data() as PersonalInfo) }
    : defaultProfile;

  const profileDraft = draftSnap.exists()
    ? { ...profile, ...(draftSnap.data() as PersonalInfo) }
    : null;

  const cmsConfig =
    cmsSnap && cmsSnap.exists()
      ? mergeCmsConfig(DEFAULT_CMS_CONFIG, cmsSnap.data() as Partial<CmsSiteConfig>)
      : DEFAULT_CMS_CONFIG;

  const cmsDraft =
    cmsDraftSnap && cmsDraftSnap.exists()
      ? mergeCmsConfig(cmsConfig, cmsDraftSnap.data() as Partial<CmsSiteConfig>)
      : null;

  const cmsPrev =
    cmsPrevSnap && cmsPrevSnap.exists()
      ? mergeCmsConfig(DEFAULT_CMS_CONFIG, cmsPrevSnap.data() as Partial<CmsSiteConfig>)
      : null;

  const projects = sortByOrder(projSnap.docs.map((d) => ({ ...(d.data() as Project), id: d.id })));
  const certifications = sortByOrder(
    certSnap.docs.map((d) => ({ ...(d.data() as Certification), id: d.id }))
  );
  const skillCategories = sortByOrder(
    skillSnap.docs.map((d) => ({ ...(d.data() as SkillCategory), id: d.id }))
  );
  const education = sortByOrder(
    eduSnap.docs.map((d) => ({ ...(d.data() as EducationItem), id: d.id }))
  );
  const experiences = sortByOrder(
    expSnap.docs.map((d) => ({ ...(d.data() as ExperienceItem), id: d.id }))
  );

  const messages = msgSnap.docs
    .map((d) => ({ ...(d.data() as Omit<ContactMessage, 'id'>), id: d.id }))
    .sort((a, b) => {
      const aSec = (a.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
      const bSec = (b.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
      return bSec - aSec;
    });

  return {
    profile,
    profileDraft,
    cmsConfig,
    cmsDraft,
    cmsPrev,
    projects,
    certifications,
    skillCategories,
    education,
    experiences,
    messages,
    mediaAssets,
  };
}

// --- Non-Destructive Initial Database Seeding ---
export async function seedMissingBaselineRecords(): Promise<{ seededCount: number }> {
  let seededCount = 0;

  try {
    const profileRef = doc(db, 'site_settings', 'profile');
    const profSnap = await getDoc(profileRef);
    if (!profSnap.exists()) {
      await saveProfile(defaultProfile);
      seededCount++;
    }

    const cmsRef = doc(db, 'site_settings', 'cms_config');
    const cmsSnap = await getDoc(cmsRef);
    if (!cmsSnap.exists()) {
      await setDoc(cmsRef, sanitizeCmsPayload(DEFAULT_CMS_CONFIG));
      seededCount++;
    }

    const existingProjects = await getDocs(collection(db, 'projects'));
    if (existingProjects.empty) {
      for (const proj of defaultProjects) {
        await saveProject(proj, true);
        seededCount++;
      }
    }

    const existingCerts = await getDocs(collection(db, 'certifications'));
    if (existingCerts.empty) {
      for (const cert of defaultCerts) {
        await saveCertification(cert, true);
        seededCount++;
      }
    }

    const existingSkills = await getDocs(collection(db, 'skill_categories'));
    if (existingSkills.empty) {
      for (const cat of defaultSkills) {
        await saveSkillCategory(cat, true);
        seededCount++;
      }
    }

    const existingEdu = await getDocs(collection(db, 'education'));
    if (existingEdu.empty) {
      for (const edu of defaultEducation) {
        await saveEducation(edu, true);
        seededCount++;
      }
    }

    const existingExp = await getDocs(collection(db, 'experiences'));
    if (existingExp.empty) {
      for (const exp of defaultExperiences) {
        await saveExperience(exp, true);
        seededCount++;
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'seed_baseline');
  }

  return { seededCount };
}

// --- CMS Site Config Mutations (Draft / Publish / Restore / Discard) ---
function sanitizeCmsPayload(config: CmsSiteConfig) {
  const merged = mergeCmsConfig(DEFAULT_CMS_CONFIG, config);
  return {
    hero: {
      ...merged.hero,
      kicker: clampString(merged.hero.kicker, 120),
      headingName: clampString(merged.hero.headingName, 120),
      subtitle: clampString(merged.hero.subtitle, 200),
      introText: clampString(merged.hero.introText, 1200),
      backgroundTagline: clampString(merged.hero.backgroundTagline, 240),
      photoOverrideUrl: clampString(merged.hero.photoOverrideUrl, 500),
      primaryCtaLabel: clampString(merged.hero.primaryCtaLabel, 60),
      primaryCtaHref: clampString(merged.hero.primaryCtaHref, 300),
      secondaryCtaLabel: clampString(merged.hero.secondaryCtaLabel, 60),
      secondaryCtaHref: clampString(merged.hero.secondaryCtaHref, 300),
      resumeButtonLabel: clampString(merged.hero.resumeButtonLabel, 60),
      availabilityText: clampString(merged.hero.availabilityText, 120),
      animatedPhrases: clampList(merged.hero.animatedPhrases, 10, 80),
      visible: merged.hero.visible !== false,
    },
    about: {
      ...merged.about,
      heading: clampString(merged.about.heading, 120),
      subtitle: clampString(merged.about.subtitle, 200),
      bioCardTitle: clampString(merged.about.bioCardTitle, 120),
      introParagraph: clampString(merged.about.introParagraph, 1200),
      biography: clampString(merged.about.biography, 5000),
      careerObjectives: clampString(merged.about.careerObjectives, 2000),
      professionalJourney: clampString(merged.about.professionalJourney, 2500),
      aboutImages: clampList(merged.about.aboutImages, 8, 500),
      visible: merged.about.visible !== false,
    },
    contact: {
      ...merged.contact,
      heading: clampString(merged.contact.heading, 120),
      subtitle: clampString(merged.contact.subtitle, 200),
      directInfoHeading: clampString(merged.contact.directInfoHeading, 120),
      directInfoIntro: clampString(merged.contact.directInfoIntro, 500),
      formHeading: clampString(merged.contact.formHeading, 120),
      formSubtext: clampString(merged.contact.formSubtext, 300),
      formVisible: merged.contact.formVisible !== false,
      nameLabel: clampString(merged.contact.nameLabel, 60),
      emailLabel: clampString(merged.contact.emailLabel, 60),
      subjectLabel: clampString(merged.contact.subjectLabel, 60),
      messageLabel: clampString(merged.contact.messageLabel, 60),
      submitLabel: clampString(merged.contact.submitLabel, 60),
    },
    navigation: {
      brandText: clampString(merged.navigation.brandText, 40) || 'RT',
      items: (merged.navigation.items || []).slice(0, 15).map((item, idx) => ({
        id: clampString(item.id, 64) || `nav-${idx + 1}`,
        label: clampString(item.label, 40) || 'Link',
        href: clampString(item.href, 300) || '#home',
        isExternal: Boolean(item.isExternal),
        visible: item.visible !== false,
        showOnMobile: item.showOnMobile !== false,
        order: Number(item.order ?? idx + 1),
      })),
    },
    footer: {
      ...merged.footer,
      description: clampString(merged.footer.description, 300),
      copyrightText: clampString(merged.footer.copyrightText, 200),
      showSocialLinks: merged.footer.showSocialLinks !== false,
      showContactInfo: Boolean(merged.footer.showContactInfo),
      showFooterNav: Boolean(merged.footer.showFooterNav),
      footerLinks: (merged.footer.footerLinks || []).slice(0, 12).map((l) => ({
        label: clampString(l.label, 40),
        href: clampString(l.href, 300),
        isExternal: Boolean(l.isExternal),
      })),
      visible: merged.footer.visible !== false,
    },
    appearance: merged.appearance,
    layout: {
      sections: (merged.layout.sections || []).slice(0, 12).map((s) => ({
        ...s,
        title: clampString(s.title, 120),
        subtitle: clampString(s.subtitle, 200),
      })),
    },
    seo: {
      ...merged.seo,
      title: clampString(merged.seo.title, 160),
      description: clampString(merged.seo.description, 320),
      keywords: clampString(merged.seo.keywords, 400),
      author: clampString(merged.seo.author, 120),
      ogTitle: clampString(merged.seo.ogTitle, 160),
      ogDescription: clampString(merged.seo.ogDescription, 320),
      ogImage: clampString(merged.seo.ogImage, 500),
      canonicalUrl: clampString(merged.seo.canonicalUrl, 300),
      faviconUrl: clampString(merged.seo.faviconUrl, 500),
    },
    settings: {
      ...merged.settings,
      siteName: clampString(merged.settings.siteName, 120),
      siteUrl: clampString(merged.settings.siteUrl, 300),
      lastUpdatedLabel: new Date().toISOString(),
      maintenanceNotice: {
        enabled: Boolean(merged.settings.maintenanceNotice?.enabled),
        message: clampString(merged.settings.maintenanceNotice?.message, 400),
      },
    },
    resume: {
      buttonText: clampString(merged.resume.buttonText, 60) || 'Download Resume',
      versions: (merged.resume.versions || []).slice(0, 15).map((v) => ({
        id: clampString(v.id, 128),
        label: clampString(v.label, 120),
        url: clampString(v.url, 500),
        fileName: clampString(v.fileName, 200),
        uploadedAt: clampString(v.uploadedAt, 80),
        size: Number(v.size || 0),
      })),
    },
    updatedAt: serverTimestamp(),
  };
}

export async function saveCmsDraft(config: CmsSiteConfig): Promise<void> {
  try {
    await setDoc(doc(db, 'site_settings', 'cms_config_draft'), sanitizeCmsPayload(config));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'site_settings/cms_config_draft');
  }
}

export async function publishCmsConfig(config: CmsSiteConfig): Promise<void> {
  try {
    const liveRef = doc(db, 'site_settings', 'cms_config');
    const prevSnap = await getDoc(liveRef);
    if (prevSnap.exists()) {
      const prevData = prevSnap.data() as CmsSiteConfig;
      await setDoc(doc(db, 'site_settings', 'cms_config_prev'), sanitizeCmsPayload(prevData));
    }

    await setDoc(liveRef, sanitizeCmsPayload(config));

    try {
      await deleteDoc(doc(db, 'site_settings', 'cms_config_draft'));
    } catch {
      // Ignore if draft doesn't exist
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'site_settings/cms_config');
  }
}

export async function discardCmsDraft(): Promise<void> {
  try {
    await deleteDoc(doc(db, 'site_settings', 'cms_config_draft'));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'site_settings/cms_config_draft');
  }
}

export async function restorePreviousCmsConfig(): Promise<CmsSiteConfig | null> {
  try {
    const prevSnap = await getDoc(doc(db, 'site_settings', 'cms_config_prev'));
    if (!prevSnap.exists()) return null;
    const restored = mergeCmsConfig(DEFAULT_CMS_CONFIG, prevSnap.data() as Partial<CmsSiteConfig>);
    await setDoc(doc(db, 'site_settings', 'cms_config'), sanitizeCmsPayload(restored));
    try {
      await deleteDoc(doc(db, 'site_settings', 'cms_config_draft'));
    } catch {
      // Ignore
    }
    return restored;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'site_settings/cms_config_prev');
    return null;
  }
}

// --- Profile & Draft Mutations ---
function buildProfilePayload(profile: PersonalInfo) {
  const rawPhoto = clampString(profile.profilePhotoUrl, 500);
  const safePhotoUrl = rawPhoto.startsWith('data:') ? '' : rawPhoto;

  return {
    name: clampString(profile.name, 120) || 'Rushikesh Toge',
    headline: clampString(profile.headline, 200) || 'Computer Engineering Student',
    subheadline: clampString(profile.subheadline, 240),
    intro: clampString(profile.intro, 1000),
    aboutText: clampString(profile.aboutText, 5000),
    location: clampString(profile.location, 160),
    phone: clampString(profile.phone, 30),
    email: clampString(profile.email, 160) || 'rushikeshtoge3898@gmail.com',
    linkedin: clampString(profile.linkedin, 300),
    github: clampString(profile.github, 300),
    portfolioLinks: clampPortfolioLinks(profile.portfolioLinks),
    profilePhotoUrl: safePhotoUrl,
    resumeUrl: clampString(profile.resumeUrl, 500),
    resumeFileName: clampString(profile.resumeFileName, 200),
    resumeUpdatedAt: clampString(profile.resumeUpdatedAt, 80),
    interests: clampList(profile.interests, 25, 100),
    spokenLanguages: clampList(profile.spokenLanguages, 15, 60),
    relevantCoursework: clampList(profile.relevantCoursework, 30, 100),
    educationSummary: {
      degree: clampString(profile.educationSummary?.degree, 160),
      college: clampString(profile.educationSummary?.college, 200),
      location: clampString(profile.educationSummary?.location, 120),
      year: clampString(profile.educationSummary?.year, 80),
      sem1SGPA: Number(profile.educationSummary?.sem1SGPA || 0),
      sem2SGPA: Number(profile.educationSummary?.sem2SGPA || 0),
      cgpa: Number(profile.educationSummary?.cgpa || 0),
    },
    defaultTheme: profile.defaultTheme === 'light' ? 'light' : 'dark',
    showExperienceSection: profile.showExperienceSection !== false,
    showWorkshopsSection: profile.showWorkshopsSection !== false,
    showResumeDownload: profile.showResumeDownload !== false,
    updatedAt: serverTimestamp(),
  };
}

export async function saveProfile(profile: PersonalInfo): Promise<void> {
  const payload = buildProfilePayload(profile);
  try {
    await setDoc(doc(db, 'site_settings', 'profile'), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'site_settings/profile');
  }
}

export async function saveProfileDraft(profile: PersonalInfo): Promise<void> {
  const payload = buildProfilePayload(profile);
  try {
    await setDoc(doc(db, 'site_settings', 'profile_draft'), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'site_settings/profile_draft');
  }
}

export async function discardProfileDraft(): Promise<void> {
  try {
    await deleteDoc(doc(db, 'site_settings', 'profile_draft'));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'site_settings/profile_draft');
  }
}

export async function publishProfile(profile: PersonalInfo): Promise<void> {
  await saveProfile(profile);
  try {
    await deleteDoc(doc(db, 'site_settings', 'profile_draft'));
  } catch (err) {
    console.warn('Could not clear profile_draft after publish:', err);
  }
}

// --- Project CRUD ---
export async function saveProject(project: Project, isCreate = false): Promise<void> {
  const id = project.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const docRef = doc(db, 'projects', id);
  const snap = isCreate ? null : await getDoc(docRef);
  const exists = snap ? snap.exists() : false;

  const basePayload = {
    id,
    title: clampString(project.title, 200) || 'Untitled Project',
    category: clampString(project.category, 100),
    isFeatured: Boolean(project.isFeatured),
    role: clampString(project.role, 120),
    shortDescription: clampString(project.shortDescription, 600) || 'Project summary',
    fullDescription: clampString(project.fullDescription, 4000),
    keyFeatures: clampList(project.keyFeatures, 25, 160),
    technologies: clampList(project.technologies, 30, 80),
    personalContribution: clampString(project.personalContribution, 2000),
    liveDemoUrl: clampString(project.liveDemoUrl, 500),
    githubUrl: clampString(project.githubUrl, 500),
    thumbnailUrl: clampString(project.thumbnailUrl, 500),
    galleryImages: clampList(project.galleryImages, 12, 500),
    projectStatus: project.projectStatus || 'Completed',
    status: project.status === 'draft' ? 'draft' : 'published',
    order: Number(project.order ?? 1),
    updatedAt: serverTimestamp(),
  };

  try {
    if (!exists) {
      await setDoc(docRef, { ...basePayload, createdAt: serverTimestamp() });
    } else {
      await updateDoc(docRef, basePayload);
    }
  } catch (err) {
    handleFirestoreError(err, exists ? OperationType.UPDATE : OperationType.CREATE, `projects/${id}`);
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
  }
}

// --- Certification CRUD ---
export async function saveCertification(cert: Certification, isCreate = false): Promise<void> {
  const id = cert.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const docRef = doc(db, 'certifications', id);
  const snap = isCreate ? null : await getDoc(docRef);
  const exists = snap ? snap.exists() : false;

  const basePayload = {
    id,
    title: clampString(cert.title, 200) || 'Untitled Certification',
    issuer: clampString(cert.issuer, 200) || 'Issuer',
    date: clampString(cert.date, 100) || '2026',
    gradeOrScore: clampString(cert.gradeOrScore, 120),
    badgeType: clampString(cert.badgeType, 160),
    credentialId: clampString(cert.credentialId, 120),
    credentialUrl: clampString(cert.credentialUrl, 500),
    certificateImage: clampString(cert.certificateImage, 500),
    fileType:
      cert.fileType ||
      (cert.certificateImage?.endsWith('.pdf')
        ? 'pdf'
        : cert.certificateImage?.endsWith('.svg')
        ? 'svg'
        : cert.certificateImage
        ? 'image'
        : 'none'),
    description: clampString(cert.description, 1500),
    status: cert.status === 'draft' ? 'draft' : 'published',
    order: Number(cert.order ?? 1),
    updatedAt: serverTimestamp(),
  };

  try {
    if (!exists) {
      await setDoc(docRef, { ...basePayload, createdAt: serverTimestamp() });
    } else {
      await updateDoc(docRef, basePayload);
    }
  } catch (err) {
    handleFirestoreError(
      err,
      exists ? OperationType.UPDATE : OperationType.CREATE,
      `certifications/${id}`
    );
  }
}

export async function deleteCertification(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'certifications', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `certifications/${id}`);
  }
}

// --- Skill Category CRUD ---
export async function saveSkillCategory(cat: SkillCategory, isCreate = false): Promise<void> {
  const id = cat.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const docRef = doc(db, 'skill_categories', id);
  const snap = isCreate ? null : await getDoc(docRef);
  const exists = snap ? snap.exists() : false;

  const basePayload = {
    id,
    title: clampString(cat.title, 120) || 'Category',
    iconName: clampString(cat.iconName, 40) || 'Code2',
    skills: clampList(cat.skills, 40, 80),
    skillDetails: (cat.skillDetails || []).slice(0, 40).map((d) => ({
      name: clampString(d.name, 80),
      proficiency: clampString(d.proficiency, 60),
      description: clampString(d.description, 200),
      icon: clampString(d.icon, 40),
    })),
    status: cat.status === 'draft' ? 'draft' : 'published',
    order: Number(cat.order ?? 1),
    updatedAt: serverTimestamp(),
  };

  try {
    if (!exists) {
      await setDoc(docRef, { ...basePayload, createdAt: serverTimestamp() });
    } else {
      await updateDoc(docRef, basePayload);
    }
  } catch (err) {
    handleFirestoreError(
      err,
      exists ? OperationType.UPDATE : OperationType.CREATE,
      `skill_categories/${id}`
    );
  }
}

export async function deleteSkillCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'skill_categories', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `skill_categories/${id}`);
  }
}

// --- Education CRUD ---
export async function saveEducation(edu: EducationItem, isCreate = false): Promise<void> {
  const id = edu.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const docRef = doc(db, 'education', id);
  const snap = isCreate ? null : await getDoc(docRef);
  const exists = snap ? snap.exists() : false;

  const basePayload = {
    id,
    level: clampString(edu.level, 160) || 'Degree',
    fieldOfStudy: clampString(edu.fieldOfStudy, 160),
    institution: clampString(edu.institution, 200) || 'Institution',
    boardOrUniversity: clampString(edu.boardOrUniversity, 200),
    year: clampString(edu.year, 80) || '2026',
    startYear: clampString(edu.startYear, 40),
    endYear: clampString(edu.endYear, 40),
    scoreLabel: clampString(edu.scoreLabel, 60) || 'Score',
    scoreValue: clampString(edu.scoreValue, 60) || '-',
    description: clampString(edu.description, 2000),
    details: clampList(edu.details, 15, 160),
    institutionLogo: clampString(edu.institutionLogo, 500),
    supportingDocUrl: clampString(edu.supportingDocUrl, 500),
    isCurrent: Boolean(edu.isCurrent),
    status: edu.status === 'draft' ? 'draft' : 'published',
    order: Number(edu.order ?? 1),
    updatedAt: serverTimestamp(),
  };

  try {
    if (!exists) {
      await setDoc(docRef, { ...basePayload, createdAt: serverTimestamp() });
    } else {
      await updateDoc(docRef, basePayload);
    }
  } catch (err) {
    handleFirestoreError(
      err,
      exists ? OperationType.UPDATE : OperationType.CREATE,
      `education/${id}`
    );
  }
}

export async function deleteEducation(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'education', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `education/${id}`);
  }
}

// --- Experience / Training / Achievements CRUD ---
const VALID_KINDS: ExperienceKind[] = [
  'internship',
  'workshop',
  'industrial_training',
  'professional_experience',
  'achievement',
  'event',
  'volunteering',
];

export async function saveExperience(exp: ExperienceItem, isCreate = false): Promise<void> {
  const id = exp.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const docRef = doc(db, 'experiences', id);
  const snap = isCreate ? null : await getDoc(docRef);
  const exists = snap ? snap.exists() : false;

  const basePayload = {
    id,
    kind: VALID_KINDS.includes(exp.kind) ? exp.kind : 'internship',
    title: clampString(exp.title, 200) || 'Title',
    organization: clampString(exp.organization, 200) || 'Organization',
    role: clampString(exp.role, 120),
    domain: clampString(exp.domain, 120),
    duration: clampString(exp.duration, 100) || '2026',
    startDate: clampString(exp.startDate, 60),
    endDate: clampString(exp.endDate, 60),
    workMode: clampString(exp.workMode, 100),
    credentialId: clampString(exp.credentialId, 120),
    commencementDate: clampString(exp.commencementDate, 60),
    completionDate: clampString(exp.completionDate, 60),
    description: clampString(exp.description, 2000),
    highlights: clampList(exp.highlights, 20, 300),
    skillsLearned: clampList(exp.skillsLearned, 25, 80),
    technologies: clampList(exp.technologies, 25, 80),
    certificateImage: clampString(exp.certificateImage, 500),
    verificationUrl: clampString(exp.verificationUrl, 500),
    organizationLogo: clampString(exp.organizationLogo, 500),
    isCurrent: Boolean(exp.isCurrent),
    status: exp.status === 'draft' ? 'draft' : 'published',
    order: Number(exp.order ?? 1),
    updatedAt: serverTimestamp(),
  };

  try {
    if (!exists) {
      await setDoc(docRef, { ...basePayload, createdAt: serverTimestamp() });
    } else {
      await updateDoc(docRef, basePayload);
    }
  } catch (err) {
    handleFirestoreError(
      err,
      exists ? OperationType.UPDATE : OperationType.CREATE,
      `experiences/${id}`
    );
  }
}

export async function deleteExperience(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'experiences', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `experiences/${id}`);
  }
}

// --- Contact Messages ---
export async function submitContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const checkRes = await fetch('/api/contact/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const checkJson = (await checkRes.json()) as {
    allowed?: boolean;
    error?: string;
    sanitized?: { name: string; email: string; subject: string; message: string };
  };

  if (!checkRes.ok || !checkJson.allowed || !checkJson.sanitized) {
    throw new Error(checkJson.error || 'Message validation failed.');
  }

  try {
    await addDoc(collection(db, 'contact_messages'), {
      name: checkJson.sanitized.name,
      email: checkJson.sanitized.email,
      subject: checkJson.sanitized.subject,
      message: checkJson.sanitized.message,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'contact_messages');
  }
}

export async function markContactMessageRead(id: string, isRead: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'contact_messages', id), { isRead });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `contact_messages/${id}`);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'contact_messages', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `contact_messages/${id}`);
  }
}

// --- Unified Admin File Upload (delegates to persistent Cloud Storage -> Firestore Asset) ---
export async function uploadAdminFile(
  file: File,
  category: 'profile' | 'project' | 'certificate' | 'resume' | 'experience' | 'general'
): Promise<{ url: string; fileName: string; fileType: 'image' | 'pdf' | 'svg'; size: number }> {
  const mappedCategory: MediaCategory = category === 'experience' ? 'certificate' : category;
  const uploaded = await uploadPersistentMedia(file, mappedCategory);
  return {
    url: uploaded.url,
    fileName: uploaded.name,
    fileType: uploaded.fileType,
    size: uploaded.size,
  };
}
