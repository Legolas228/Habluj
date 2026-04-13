import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from '../../hooks/useTranslation';
import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import AboutHero from './components/AboutHero';
import PersonalStory from './components/PersonalStory';
import TeachingPhilosophy from './components/TeachingPhilosophy';
import VideoIntroduction from './components/VideoIntroduction';
import { DEFAULT_OG_IMAGE, getCanonicalUrl, getHreflangLinks } from '../../utils/seo';

const AboutTheTeacher = () => {
  const { t, language } = useTranslation();
  const hreflangLinks = getHreflangLinks('/about-the-teacher');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('about.meta.title')}</title>
        <meta
          name="description"
          content={t('about.meta.description')}
        />
        <meta name="keywords" content="španielčina, lektorka španielčiny, Ester Mesároš, Habluj, online lekcie, slovenčina, čeština" />
        <meta property="og:title" content={t('about.meta.title')} />
        <meta property="og:description" content={t('about.meta.description')} />
        <meta property="og:url" content={getCanonicalUrl('/about-the-teacher', language)} />
        <meta property="og:type" content="profile" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <link rel="canonical" href={getCanonicalUrl('/about-the-teacher', language)} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {/* Hero Section */}
          <AboutHero />

          {/* Personal Story */}
          <PersonalStory />

          {/* Teaching Philosophy */}
          <TeachingPhilosophy />

          {/* Video Introduction */}
          <VideoIntroduction />
        </main>

        <SiteFooter />
      </div>
    </>
  );
};

export default AboutTheTeacher;
