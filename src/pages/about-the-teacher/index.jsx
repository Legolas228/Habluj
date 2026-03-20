import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import AboutHero from './components/AboutHero';
import PersonalStory from './components/PersonalStory';
import TeachingPhilosophy from './components/TeachingPhilosophy';
import VideoIntroduction from './components/VideoIntroduction';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { DEFAULT_OG_IMAGE, getCanonicalUrl, getHreflangLinks } from '../../utils/seo';

const AboutTheTeacher = () => {
  const { t } = useTranslation();
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
        <meta property="og:url" content={getCanonicalUrl('/about-the-teacher')} />
        <meta property="og:type" content="profile" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <link rel="canonical" href={getCanonicalUrl('/about-the-teacher')} />
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

          {/* Call to Action Section */}
          <section className="py-16 lg:py-24 bg-gradient-cultural text-white">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="max-w-4xl mx-auto text-center">
                <div className="mb-8">
                  <Icon name="Sparkles" size={48} className="text-white/80 mx-auto mb-6" />
                  <h2 className="font-headlines text-3xl lg:text-4xl font-bold mb-6">
                    {t('about.cta.title').replace('{highlight}', '')} <span className="text-accent">{t('about.cta.titleHighlight')}</span>?
                  </h2>
                  <p className="text-xl text-white/90 leading-relaxed mb-8">
                    {t('about.cta.description')}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <Icon name="Calendar" size={32} className="text-white mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{t('about.cta.card1.title')}</h3>
                    <p className="text-white/80 text-sm">{t('about.cta.card1.desc')}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <Icon name="Target" size={32} className="text-white mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{t('about.cta.card2.title')}</h3>
                    <p className="text-white/80 text-sm">{t('about.cta.card2.desc')}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <Icon name="Map" size={32} className="text-white mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{t('about.cta.card3.title')}</h3>
                    <p className="text-white/80 text-sm">{t('about.cta.card3.desc')}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white text-white hover:bg-white hover:text-primary"
                      iconName="MessageCircle"
                      iconPosition="left"
                    >
                      {t('about.cta.button')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
};

export default AboutTheTeacher;
