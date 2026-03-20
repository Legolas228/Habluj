import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from '../../hooks/useTranslation';
import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import ContactHero from './components/ContactHero';
import ContactMethods from './components/ContactMethods';
import ContactForm from './components/ContactForm';
import FAQ from './components/FAQ';
import { DEFAULT_OG_IMAGE, getCanonicalUrl, getHreflangLinks } from '../../utils/seo';

const ContactPage = () => {
  const { t } = useTranslation();
  const hreflangLinks = getHreflangLinks('/contact');

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t('meta.contactTitle')}</title>
        <meta name="description" content={t('meta.contactDescription')} />
        <link rel="canonical" href={getCanonicalUrl('/contact')} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
        <meta property="og:title" content={t('meta.contactTitle')} />
        <meta property="og:description" content={t('meta.contactDescription')} />
        <meta property="og:url" content="https://habluj.sk/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>

      <Header />

      <main>
        <ContactHero />
        <ContactMethods />
        <ContactForm />
        <FAQ />
      </main>
      <SiteFooter />
    </div>
  );
};

export default ContactPage;
