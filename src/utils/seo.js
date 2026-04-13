const configuredSiteUrl = (import.meta.env.VITE_SITE_URL || 'https://habluj.sk').trim();
export const BASE_URL = configuredSiteUrl.replace(/\/$/, '');
export const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/images/og-image.webp`;

const LANGUAGE_TO_SEGMENT = {
  sk: 'sk',
  cz: 'cs',
  es: 'es',
};

const SEGMENT_TO_LANGUAGE = {
  sk: 'sk',
  cs: 'cz',
  es: 'es',
};

const supportedLanguages = new Set(Object.keys(LANGUAGE_TO_SEGMENT));
const supportedSegments = new Set(Object.keys(SEGMENT_TO_LANGUAGE));

export const normalizeLanguage = (language = 'sk') => {
  const value = String(language || '').toLowerCase();
  return supportedLanguages.has(value) ? value : 'sk';
};

export const getLanguageSegment = (language = 'sk') => LANGUAGE_TO_SEGMENT[normalizeLanguage(language)];

export const getLanguageFromSegment = (segment = 'sk') => SEGMENT_TO_LANGUAGE[String(segment || '').toLowerCase()] || 'sk';

export const detectLanguageFromPath = (pathname = '/') => {
  const firstSegment = String(pathname || '/').split('/').filter(Boolean)[0] || '';
  if (!supportedSegments.has(firstSegment)) {
    return null;
  }
  return getLanguageFromSegment(firstSegment);
};

export const stripLanguagePrefix = (pathname = '/') => {
  const cleanPath = String(pathname || '/').split('?')[0].split('#')[0] || '/';
  const parts = cleanPath.split('/').filter(Boolean);
  if (!parts.length) {
    return '/';
  }
  if (!supportedSegments.has(parts[0])) {
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  }
  const nextPath = `/${parts.slice(1).join('/')}`;
  return nextPath === '/' ? '/' : nextPath.replace(/\/$/, '');
};

export const getLocalizedPath = (path = '/', language = 'sk') => {
  const [pathPartWithQuery, hashPart = ''] = String(path || '/').split('#');
  const [pathPartRaw, queryPart = ''] = pathPartWithQuery.split('?');
  const pathPart = stripLanguagePrefix(pathPartRaw || '/');
  const segment = getLanguageSegment(language);
  const localizedPath = pathPart === '/' ? `/${segment}` : `/${segment}${pathPart}`;
  const querySuffix = queryPart ? `?${queryPart}` : '';
  const hashSuffix = hashPart ? `#${hashPart}` : '';
  return `${localizedPath}${querySuffix}${hashSuffix}`;
};

const getDefaultLanguage = () => {
  if (typeof window !== 'undefined') {
    const fromPath = detectLanguageFromPath(window.location.pathname);
    if (fromPath) {
      return fromPath;
    }
    try {
      const fromStorage = normalizeLanguage(localStorage.getItem('language') || '');
      if (fromStorage) {
        return fromStorage;
      }
    } catch (error) {
      // Ignore localStorage errors in restricted browser contexts.
    }
  }
  return 'sk';
};

export const getCanonicalUrl = (path = '/', language = null) => {
  const activeLanguage = language ? normalizeLanguage(language) : getDefaultLanguage();
  return `${BASE_URL}${getLocalizedPath(path, activeLanguage)}`;
};

export const getHreflangLinks = (path = '/') => ([
  { hrefLang: 'sk', href: `${BASE_URL}${getLocalizedPath(path, 'sk')}` },
  { hrefLang: 'cs', href: `${BASE_URL}${getLocalizedPath(path, 'cz')}` },
  { hrefLang: 'es', href: `${BASE_URL}${getLocalizedPath(path, 'es')}` },
  { hrefLang: 'x-default', href: `${BASE_URL}${getLocalizedPath(path, 'sk')}` },
]);
