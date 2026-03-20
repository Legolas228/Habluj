export const BASE_URL = 'https://habluj.sk';
export const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/images/og-image.webp`;

export const getCanonicalUrl = (path = '/') => `${BASE_URL}${path}`;

export const getHreflangLinks = (path = '/') => ([
  { hrefLang: 'sk', href: `${BASE_URL}${path}` },
  { hrefLang: 'cs', href: `${BASE_URL}${path}` },
  { hrefLang: 'es', href: `${BASE_URL}${path}` },
  { hrefLang: 'x-default', href: `${BASE_URL}${path}` },
]);
