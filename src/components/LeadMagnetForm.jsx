import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { submitLeadCapture } from '../services/leads';
import Input from './ui/Input';
import Button from './ui/Button';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const mapPreferredLanguage = (language) => {
  if (language === 'cz') return 'cz';
  if (language === 'es') return 'es';
  return 'sk';
};

const LeadMagnetForm = ({ source = 'lead_magnet' }) => {
  const { t, language } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setStatus('error');
      setError(t('leadMagnet.error'));
      return;
    }
    setStatus('submitting');
    try {
      await submitLeadCapture({
        full_name: fullName.trim(),
        email: normalizedEmail,
        preferred_language: mapPreferredLanguage(language),
        source,
        consent_privacy: consentPrivacy,
        consent_marketing: consentMarketing,
        consent_version: 'v1',
      });
      setStatus('success');
      setFullName('');
      setEmail('');
      setConsentPrivacy(false);
      setConsentMarketing(false);
    } catch (submitError) {
      setStatus('error');
      setError(submitError.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-border p-6">
      <h3 className="text-xl font-headlines font-bold text-foreground mb-2">{t('leadMagnet.title')}</h3>
      <p className="text-muted-foreground text-sm mb-6">{t('leadMagnet.subtitle')}</p>

      {status === 'success' && (
        <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
          {t('leadMagnet.success')}
        </div>
      )}

      {status === 'error' && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm" role="alert">
          {error || t('leadMagnet.error')}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder={t('leadMagnet.namePlaceholder')}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          autoComplete="name"
          aria-label={t('leadMagnet.namePlaceholder')}
        />
        <Input
          type="email"
          placeholder={t('leadMagnet.emailPlaceholder')}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          inputMode="email"
          aria-label={t('leadMagnet.emailPlaceholder')}
        />

        <label htmlFor="lead-magnet-privacy" className="flex items-start gap-2 text-sm text-muted-foreground">
          <Input
            id="lead-magnet-privacy"
            type="checkbox"
            checked={consentPrivacy}
            onChange={(event) => setConsentPrivacy(event.target.checked)}
            required
            className="mt-0.5"
            aria-label={t('leadMagnet.privacyConsent')}
          />
          <span>{t('leadMagnet.privacyConsent')}</span>
        </label>
        <label htmlFor="lead-magnet-marketing" className="flex items-start gap-2 text-sm text-muted-foreground">
          <Input
            id="lead-magnet-marketing"
            type="checkbox"
            checked={consentMarketing}
            onChange={(event) => setConsentMarketing(event.target.checked)}
            className="mt-0.5"
            aria-label={t('leadMagnet.marketingConsent')}
          />
          <span>{t('leadMagnet.marketingConsent')}</span>
        </label>

        <Button
          type="submit"
          disabled={status === 'submitting'}
          fullWidth
          aria-label={t('leadMagnet.submit')}
        >
          {status === 'submitting' ? t('leadMagnet.submitting') : t('leadMagnet.submit')}
        </Button>
      </form>
    </div>
  );
};

export default LeadMagnetForm;
