import React from 'react';
import { Helmet } from 'react-helmet';

import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import AdvancedSpanishTestForm from '../../components/AdvancedSpanishTestForm';
import { useTranslation } from '../../hooks/useTranslation';
import { getCanonicalUrl, getHreflangLinks, DEFAULT_OG_IMAGE } from '../../utils/seo';

const LevelQuestionnairePage = () => {
  const { t } = useTranslation();
  const hreflangLinks = getHreflangLinks('/level-questionnaire');

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t('levelQuiz.page.title')}</title>
        <meta name="description" content={t('levelQuiz.page.description')} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={getCanonicalUrl('/level-questionnaire')} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
        <meta property="og:title" content={t('levelQuiz.page.title')} />
        <meta property="og:description" content={t('levelQuiz.page.description')} />
        <meta property="og:url" content={getCanonicalUrl('/level-questionnaire')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>

      <Header />
      <main className="py-14 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-headlines font-bold text-foreground mb-3">
              {t('levelQuiz.page.heading')}
            </h1>
            <p className="text-muted-foreground">
              {t('levelQuiz.page.subheading')}
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <AdvancedSpanishTestForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LevelQuestionnairePage;
