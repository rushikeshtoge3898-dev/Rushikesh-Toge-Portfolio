import { CmsSeoConfig, PersonalInfo } from '../types';

function setMetaTag(selector: string, attrName: string, attrValue: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function applySeoToDocument(
  seo: CmsSeoConfig,
  profile: PersonalInfo,
  resolvedOgImage?: string,
  resolvedFavicon?: string
) {
  if (typeof document === 'undefined') return;

  if (seo.title) {
    document.title = seo.title;
  }

  setMetaTag('meta[name="description"]', 'name', 'description', seo.description);
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', seo.keywords);
  setMetaTag('meta[name="author"]', 'name', 'author', seo.author || profile.name);
  setMetaTag('meta[name="robots"]', 'name', 'robots', seo.robots || 'index, follow');

  setMetaTag('meta[property="og:title"]', 'property', 'og:title', seo.ogTitle || seo.title);
  setMetaTag(
    'meta[property="og:description"]',
    'property',
    'og:description',
    seo.ogDescription || seo.description
  );
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', seo.ogTitle || seo.title);
  setMetaTag(
    'meta[name="twitter:description"]',
    'name',
    'twitter:description',
    seo.ogDescription || seo.description
  );

  const ogImg = resolvedOgImage || seo.ogImage;
  if (ogImg) {
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImg);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImg);
  }

  if (seo.canonicalUrl) {
    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = seo.canonicalUrl;
  }

  const fav = resolvedFavicon || seo.faviconUrl;
  if (fav) {
    let icon = document.head.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!icon) {
      icon = document.createElement('link');
      icon.rel = 'icon';
      document.head.appendChild(icon);
    }
    icon.href = fav;
  }

  // Update Person Schema JSON-LD safely
  let ld = document.getElementById('cms-person-jsonld') as HTMLScriptElement | null;
  if (!ld) {
    ld = document.createElement('script');
    ld.id = 'cms-person-jsonld';
    ld.type = 'application/ld+json';
    document.head.appendChild(ld);
  }
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.headline,
    email: `mailto:${profile.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location,
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: profile.educationSummary?.college || '',
    },
    sameAs: [profile.github, profile.linkedin].filter(Boolean),
    url: seo.canonicalUrl || undefined,
  });
}
