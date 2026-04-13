import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = path.resolve(__dirname, '..', '..');

const readFile = (relativePath) =>
  fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');

describe('SEO guardrails', () => {
  it('keeps /homepage redirected to localized home and preserves NotFound route', () => {
    const routes = readFile('src/Routes.jsx');
    expect(routes).toContain('<Route path="/homepage" element={<Navigate to={redirectToLocalized(\'/\')} replace />} />');
    expect(routes).toContain('<Route path="*" element={<NotFound />} />');
  });

  it('ensures all key public pages have canonical and hreflang alternates', () => {
    const pages = [
      'src/pages/homepage/index.jsx',
      'src/pages/contact/index.jsx',
      'src/pages/tutoring-services/index.jsx',
      'src/pages/about-the-teacher/index.jsx',
      'src/pages/booking-system/index.jsx',
      'src/pages/privacy-policy/index.jsx',
      'src/pages/terms-and-conditions/index.jsx',
      'src/pages/cookies-policy/index.jsx',
    ];

    pages.forEach((page) => {
      const content = readFile(page);
      expect(content).toContain('rel="canonical"');
      expect(content).toContain('rel="alternate"');
    });
  });

  it('keeps Open Graph image metadata in key pages', () => {
    const pages = [
      'src/pages/homepage/index.jsx',
      'src/pages/contact/index.jsx',
      'src/pages/tutoring-services/index.jsx',
      'src/pages/about-the-teacher/index.jsx',
      'src/pages/booking-system/index.jsx',
      'src/pages/privacy-policy/index.jsx',
      'src/pages/terms-and-conditions/index.jsx',
      'src/pages/cookies-policy/index.jsx',
    ];

    pages.forEach((page) => {
      const content = readFile(page);
      expect(content).toContain('og:image');
    });
  });

  it('keeps sitemap entries and x-default alternates for public routes', () => {
    const sitemap = readFile('public/sitemap.xml');
    [
      'https://habluj.sk/sk',
      'https://habluj.sk/sk/about-the-teacher',
      'https://habluj.sk/sk/tutoring-services',
      'https://habluj.sk/sk/contact',
      'https://habluj.sk/sk/booking-system',
      'https://habluj.sk/sk/privacy-policy',
      'https://habluj.sk/sk/terms-and-conditions',
      'https://habluj.sk/sk/cookies-policy',
    ].forEach((url) => {
      expect(sitemap).toContain(`<loc>${url}</loc>`);
    });

    expect(sitemap).toContain('hreflang="x-default"');
  });

  it('keeps level questionnaire page as noindex and outside sitemap', () => {
    const routes = readFile('src/Routes.jsx');
    const page = readFile('src/pages/level-questionnaire/index.jsx');
    const sitemap = readFile('public/sitemap.xml');

    expect(routes).toContain('<Route path="/level-questionnaire" element={<Navigate to={redirectToLocalized(\'/level-questionnaire\')} replace />} />');
    expect(routes).toContain('<Route path="level-questionnaire" element={<LevelQuestionnairePage />} />');
    expect(page).toContain('name="robots" content="noindex, nofollow"');
    expect(sitemap).not.toContain('https://habluj.sk/sk/level-questionnaire');
  });
});

