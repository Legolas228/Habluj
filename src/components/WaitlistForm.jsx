import React, { useEffect, useState } from 'react';
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

const mapWaitlistSource = (courseType) => {
  if (courseType === 'small_group') return 'waitlist_small_group';
  return 'waitlist_intensive';
};

const INTENSIVE_COURSE_OPTIONS = [
  { value: 'intensive_general', labelKey: 'waitlist.intensiveCourse.general' },
  { value: 'intensive_conversation', labelKey: 'waitlist.intensiveCourse.conversation' },
  { value: 'intensive_dele', labelKey: 'waitlist.intensiveCourse.dele' },
  { value: 'intensive_business', labelKey: 'waitlist.intensiveCourse.business' },
];

const WaitlistForm = ({ preferredCourseType = 'intensive' }) => {
  const { t, language } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [courseType, setCourseType] = useState(preferredCourseType);
  const [intensiveCourse, setIntensiveCourse] = useState('intensive_general');
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    setCourseType(preferredCourseType || 'intensive');
  }, [preferredCourseType]);

  useEffect(() => {
    if (courseType !== 'intensive') {
      setIntensiveCourse('intensive_general');
    }
  }, [courseType]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setStatus('error');
      setError(t('waitlist.error'));
      return;
    }

    setStatus('submitting');
    try {
      const source = mapWaitlistSource(courseType);
      const cleanMessage = message.trim();
      const cleanPhone = phone.trim();
      const courseMeta = courseType === 'intensive' ? `[COURSE:${intensiveCourse}]` : '';
      const combinedNotes = [courseMeta, cleanMessage].filter(Boolean).join('\n').trim();

      await submitLeadCapture({
        full_name: fullName.trim(),
        email: normalizedEmail,
        phone: cleanPhone,
        preferred_language: mapPreferredLanguage(language),
        source,
        notes: combinedNotes,
        consent_privacy: consentPrivacy,
        consent_marketing: consentMarketing,
        consent_version: 'v1',
      });

      setStatus('success');
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setConsentPrivacy(false);
      setConsentMarketing(false);
    } catch (submitError) {
      setStatus('error');
      setError(submitError?.message || t('waitlist.error'));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-border p-6">
      <h3 className="text-xl font-headlines font-bold text-foreground mb-2">{t('waitlist.title')}</h3>
      <p className="text-muted-foreground text-sm mb-6">{t('waitlist.subtitle')}</p>

      {status === 'success' && (
        <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
          {t('waitlist.success')}
        </div>
      )}

      {status === 'error' && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm" role="alert">
          {error || t('waitlist.error')}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t('waitlist.courseLabel')}</label>
          <select
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={courseType}
            onChange={(event) => setCourseType(event.target.value)}
          >
            <option value="intensive">{t('waitlist.course.intensive')}</option>
            <option value="small_group">{t('waitlist.course.smallGroup')}</option>
          </select>
        </div>

        {courseType === 'intensive' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('waitlist.intensiveCourseLabel')}</label>
            <select
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={intensiveCourse}
              onChange={(event) => setIntensiveCourse(event.target.value)}
            >
              {INTENSIVE_COURSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
              ))}
            </select>
          </div>
        )}

        <Input
          type="text"
          placeholder={t('waitlist.namePlaceholder')}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          autoComplete="name"
          aria-label={t('waitlist.namePlaceholder')}
        />

        <Input
          type="email"
          placeholder={t('waitlist.emailPlaceholder')}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          inputMode="email"
          aria-label={t('waitlist.emailPlaceholder')}
        />

        <Input
          type="tel"
          placeholder={t('waitlist.phonePlaceholder')}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
          inputMode="tel"
          aria-label={t('waitlist.phonePlaceholder')}
        />

        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24"
          placeholder={t('waitlist.messagePlaceholder')}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-label={t('waitlist.messagePlaceholder')}
        />

        <label htmlFor="waitlist-privacy" className="flex items-start gap-2 text-sm text-muted-foreground">
          <Input
            id="waitlist-privacy"
            type="checkbox"
            checked={consentPrivacy}
            onChange={(event) => setConsentPrivacy(event.target.checked)}
            required
            className="mt-0.5"
            aria-label={t('waitlist.privacyConsent')}
          />
          <span>{t('waitlist.privacyConsent')}</span>
        </label>

        <label htmlFor="waitlist-marketing" className="flex items-start gap-2 text-sm text-muted-foreground">
          <Input
            id="waitlist-marketing"
            type="checkbox"
            checked={consentMarketing}
            onChange={(event) => setConsentMarketing(event.target.checked)}
            className="mt-0.5"
            aria-label={t('waitlist.marketingConsent')}
          />
          <span>{t('waitlist.marketingConsent')}</span>
        </label>

        <Button type="submit" disabled={status === 'submitting'} fullWidth>
          {status === 'submitting' ? t('waitlist.submitting') : t('waitlist.submit')}
        </Button>
      </form>
    </div>
  );
};

export default WaitlistForm;
