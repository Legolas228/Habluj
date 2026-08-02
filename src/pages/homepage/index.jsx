import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import MethodDemoSection from './components/MethodDemoSection';
import LearningPathsSection from './components/LearningPathsSection';
import TestimonialsSection from './components/TestimonialsSection';
import MeetEster from './components/MeetEster';
import CTASection from './components/CTASection';
import SiteFooter from '../../components/ui/SiteFooter';
import { useTranslation } from '../../hooks/useTranslation';
import { DEFAULT_OG_IMAGE, SITE_LOGO_IMAGE, getCanonicalUrl, getHreflangLinks } from '../../utils/seo';

const Homepage = () => {
  const { t, language } = useTranslation();
  const hreflangLinks = getHreflangLinks('/');
  const localeByLanguage = {
    sk: 'sk-SK',
    cz: 'cs-CZ',
    es: 'es-ES',
  };
  const ogLocaleByLanguage = {
    sk: 'sk_SK',
    cz: 'cs_CZ',
    es: 'es_ES',
  };
  const locale = localeByLanguage[language] || 'sk-SK';
  const ogLocale = ogLocaleByLanguage[language] || 'sk_SK';
  const offerByLanguage = {
    sk: { currency: 'EUR', price: '20', label: 'od 20 € / lekcia' },
    cz: { currency: 'CZK', price: '500', label: 'od 500 CZK / lekcia' },
    es: { currency: 'EUR', price: '20', label: 'desde 20 € / clase' },
  };
  const activeOffer = offerByLanguage[language] || offerByLanguage.sk;

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Habluj',
    url: getCanonicalUrl('/', language),
    logo: SITE_LOGO_IMAGE,
    sameAs: ['https://www.instagram.com/habluj_sk/'],
    areaServed: ['SK', 'CZ'],
    inLanguage: [locale, 'es-ES'],
    description: t('meta.homeDescription'),
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Habluj',
    url: getCanonicalUrl('/', language),
    inLanguage: locale,
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Online Spanish Lessons',
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Habluj',
      url: getCanonicalUrl('/', language),
    },
    areaServed: ['SK', 'CZ'],
    availableLanguage: ['es', 'sk', 'cs'],
    offers: {
      '@type': 'Offer',
      priceCurrency: activeOffer.currency,
      price: activeOffer.price,
      description: activeOffer.label,
      availability: 'https://schema.org/InStock',
      url: getCanonicalUrl('/tutoring-services', language),
    },
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t('meta.homeTitle')}</title>
        <meta name="description" content={t('meta.homeDescription')} />
        <meta name="keywords" content={t('meta.homeKeywords')} />
        <link rel="canonical" href={getCanonicalUrl('/', language)} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
        {/* Open Graph */}
        <meta property="og:title" content={t('meta.homeTitle')} />
        <meta property="og:description" content={t('meta.homeDescription')} />
        <meta property="og:url" content={getCanonicalUrl('/', language)} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:image:secure_url" content={DEFAULT_OG_IMAGE} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Habluj - online lekcie španielčiny s Ester Mesároš Borrull" />
        <meta property="og:locale" content={ogLocale} />
        <meta property="og:locale:alternate" content="sk_SK" />
        <meta property="og:locale:alternate" content="cs_CZ" />
        <meta property="og:locale:alternate" content="es_ES" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('meta.homeTitle')} />
        <meta name="twitter:description" content={t('meta.homeDescription')} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:image:alt" content="Habluj - online lekcie španielčiny s Ester Mesároš Borrull" />
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
      </Helmet>

      <Header />
      <main>
        <HeroSection />
        <MethodDemoSection />
        <LearningPathsSection />
        <TestimonialsSection />
        <MeetEster />
        <CTASection />
      </main>

      <SiteFooter />
    </div>
  );
};

export default Homepage;
