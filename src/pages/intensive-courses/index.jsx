import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from '../../hooks/useTranslation';
import { getCanonicalUrl, getHreflangLinks, DEFAULT_OG_IMAGE } from '../../utils/seo';
import { contactInfo, getContactLinks } from '../../utils/contactInfo';
import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import GoogleFormEmbed from './components/GoogleFormEmbed';

const IntensiveCoursesPage = () => {
  const { t, language } = useTranslation();
  const hreflangLinks = getHreflangLinks('/intensive-courses');
  const [expandedFaq, setExpandedFaq] = useState(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const benefits = [
    { icon: 'Zap', label: 'Rápido' },
    { icon: 'Users', label: 'Grupos' },
    { icon: 'Clock', label: 'Flexible' },
    { icon: 'TrendingUp', label: 'Resultados' },
  ];

  const features = [
    {
      icon: 'Zap',
      title: 'intensive.features.intensity.title',
      description: 'intensive.features.intensity.desc',
    },
    {
      icon: 'Clock',
      title: 'intensive.features.schedule.title',
      description: 'intensive.features.schedule.desc',
    },
    {
      icon: 'Users',
      title: 'intensive.features.group.title',
      description: 'intensive.features.group.desc',
    },
    {
      icon: 'TrendingUp',
      title: 'intensive.features.results.title',
      description: 'intensive.features.results.desc',
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t('intensive.meta.title')}</title>
        <meta name="description" content={t('intensive.meta.description')} />
        <meta property="og:title" content={t('intensive.meta.title')} />
        <meta property="og:description" content={t('intensive.meta.description')} />
        <meta property="og:url" content={getCanonicalUrl('/intensive-courses', language)} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <link rel="canonical" href={getCanonicalUrl('/intensive-courses', language)} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {/* Hero Section */}
          <section className="relative min-h-96 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-16 lg:py-24 overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 lg:px-6 relative z-10">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <h1 className="text-4xl lg:text-6xl font-headlines font-bold text-foreground leading-tight">
                  {t('intensive.hero.title')}
                  {' '}
                  <span className="text-primary">{t('intensive.hero.highlight')}</span>
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed">
                  {t('intensive.hero.subtitle')}
                </p>

                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  {benefits.map((benefit) => (
                    <div key={benefit.label} className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
                      <Icon name={benefit.icon} size={16} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">{benefit.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Price & Urgency Section - PROMINENT */}
          <section className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="max-w-3xl mx-auto">
                {/* Main Price Badge */}
                <div className="text-center mb-12">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="inline-flex items-center gap-3 bg-primary px-8 py-4 rounded-full text-white shadow-lg">
                      <span className="text-sm font-semibold">{t('intensive.price.badge')}</span>
                      <span className="text-3xl font-bold">{t('intensive.price.euro')}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{t('intensive.price.description')}</p>
                  </div>
                </div>

                {/* Urgency Signals */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-border text-center max-w-xs">
                    <p className="font-semibold text-foreground text-sm">{t('intensive.urgency.groupSizes')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-16 lg:py-24 bg-white/50">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-headlines font-bold text-foreground mb-4">
                  {t('intensive.features.title')}
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {t('intensive.features.subtitle')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, idx) => (
                  <div key={idx} className="p-6 bg-white rounded-xl border border-border hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon name={feature.icon} size={24} className="text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{t(feature.title)}</h3>
                    <p className="text-sm text-muted-foreground">{t(feature.description)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Before Form */}
          <section className="py-12 lg:py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-2xl lg:text-3xl font-headlines font-bold text-primary">
                  {t('intensive.form.cta.strong')}
                </h2>
                <p className="text-muted-foreground">
                  {t('intensive.form.cta.subtitle')}
                </p>
              </div>
            </div>
          </section>

          {/* Google Form Section */}
          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="max-w-4xl mx-auto">
                <GoogleFormEmbed />
              </div>
            </div>
          </section>

          {/* FAQ or Additional Info */}
          <section className="py-16 lg:py-24 bg-white/50">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-headlines font-bold text-foreground mb-4">
                    {t('intensive.info.title')}
                  </h2>
                </div>

                {/* Accordion FAQ */}
                <div className="space-y-4">
                  {[
                    { q: 'intensive.info.q1', a: 'intensive.info.a1' },
                    { q: 'intensive.info.q2', a: 'intensive.info.a2' },
                    { q: 'intensive.info.q3', a: 'intensive.info.a3' },
                  ].map((item, idx) => (
                    <div key={idx} className="border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full p-6 bg-white hover:bg-primary/2 transition-colors flex items-center justify-between text-left"
                      >
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                          <Icon name="HelpCircle" size={20} className="text-primary flex-shrink-0" />
                          {t(item.q)}
                        </h3>
                        <Icon
                          name={expandedFaq === idx ? 'ChevronUp' : 'ChevronDown'}
                          size={20}
                          className="text-muted-foreground flex-shrink-0"
                        />
                      </button>
                      {expandedFaq === idx && (
                        <div className="p-6 bg-primary/2 border-t border-border">
                          <p className="text-muted-foreground">{t(item.a)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Alternative CTA Section */}
          <section className="py-16 bg-gradient-to-r from-secondary/10 to-accent/10">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">{t('intensive.altcta.title')}</h3>
                <p className="text-muted-foreground text-sm mb-6">{t('intensive.altcta.subtitle')}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                  <a
                    href={getContactLinks.email()}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Icon name="Mail" size={18} />
                    {t('intensive.altcta.email')}
                  </a>
                  <a
                    href={getContactLinks.instagram()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
                  >
                    <Icon name="Instagram" size={18} />
                    Instagram
                  </a>
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

export default IntensiveCoursesPage;
