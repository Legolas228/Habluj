import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import LearningPathsSection from './components/LearningPathsSection';
import FeaturesSection from './components/FeaturesSection';
import TestimonialsSection from './components/TestimonialsSection';
import CTASection from './components/CTASection';
import SiteFooter from '../../components/ui/SiteFooter';
import { useTranslation } from '../../hooks/useTranslation';
import { getCanonicalUrl, getHreflangLinks } from '../../utils/seo';

const Homepage = () => {
  const { t } = useTranslation();
  const hreflangLinks = getHreflangLinks('/');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t('meta.homeTitle')}</title>
        <meta name="description" content={t('meta.homeDescription')} />
        <meta name="keywords" content="španielčina, lekcie španielčiny online, Habluj, slovenčina španielčina, čeština španielčina, online kurzy" />
        <link rel="canonical" href={getCanonicalUrl('/')} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
        {/* Open Graph */}
        <meta property="og:title" content={t('meta.homeTitle')} />
        <meta property="og:description" content={t('meta.homeDescription')} />
        <meta property="og:url" content="https://habluj.sk/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://habluj.sk/assets/images/og-image.webp" />
      </Helmet>

      <Header />
      <main>
        <HeroSection />
        <LearningPathsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <SiteFooter />
    </div>
  );
};

export default Homepage;
