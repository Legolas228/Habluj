import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import Button from '../../components/ui/Button';
import AppIcon from '../../components/AppIcon';
import { getEbookAccess } from '../../services/studentAuth';
import { getLocalizedPath } from '../../utils/seo';
import { useTranslation } from '../../hooks/useTranslation';

const EbookSuccessPage = () => {
  const { t, language } = useTranslation();
  const [searchParams] = useSearchParams();
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError(t('ebook.success.invalid'));
      return;
    }

    getEbookAccess(sessionId)
      .then((data) => setDownloadUrl(data.download_url))
      .catch((accessError) => setError(accessError.message));
  }, [searchParams, t]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <section className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 text-center shadow-cultural sm:p-8">
          <AppIcon name={downloadUrl ? 'CheckCircle' : 'Download'} size={42} className="mx-auto text-success" />
          <h1 className="mt-5 text-2xl font-headlines font-bold text-foreground sm:text-3xl">
            {downloadUrl ? t('ebook.success.title') : t('ebook.success.pending')}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {error || (downloadUrl ? t('ebook.success.description') : t('ebook.success.waiting'))}
          </p>
          {downloadUrl ? (
            <a href={downloadUrl} className="mt-6 inline-block w-full sm:w-auto">
              <Button fullWidth iconName="Download" className="w-full sm:w-auto">{t('ebook.success.download')}</Button>
            </a>
          ) : (
            <a href={getLocalizedPath('/ebook', language)} className="mt-6 inline-block text-primary underline">
              {t('ebook.success.back')}
            </a>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default EbookSuccessPage;