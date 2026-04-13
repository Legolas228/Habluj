import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { DEFAULT_OG_IMAGE, getCanonicalUrl, getHreflangLinks } from '../../utils/seo';
import { openSetmoreBooking } from '../../utils/setmore';

const BookingSystem = () => {
  const { t, language } = useTranslation();
  const hreflangLinks = getHreflangLinks('/booking-system');

  return (
    <>
      <Helmet>
        <title>{t('bookingSystem.meta.title')}</title>
        <meta name="description" content={t('bookingSystem.meta.description')} />
        <link rel="canonical" href={getCanonicalUrl('/booking-system', language)} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
        <meta property="og:title" content={t('bookingSystem.meta.ogTitle')} />
        <meta property="og:description" content={t('bookingSystem.meta.ogDescription')} />
        <meta property="og:url" content={getCanonicalUrl('/booking-system', language)} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <section className="bg-white rounded-xl border border-border shadow-soft p-6 md:p-8 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="Calendar" size={26} className="text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-headlines font-bold text-foreground mb-3">
                {t('bookingSystem.hero.title')}
              </h1>
              <p className="text-muted-foreground mb-6">
                Para el lanzamiento, todas las reservas se gestionan exclusivamente a traves de Setmore.
              </p>
              <Button onClick={openSetmoreBooking} iconName="ExternalLink" iconPosition="right">
                Ir a Setmore
              </Button>
            </section>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
};

export default BookingSystem;
