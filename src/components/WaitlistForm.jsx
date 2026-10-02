import React, { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { submitLeadCapture } from '../services/leads';
import Input from './ui/Input';
import Button from './ui/Button';
import TurnstileField from './TurnstileField';

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
  { value: 'intensive_a1', labelKey: 'waitlist.intensiveCourse.summerA1' },
  { value: 'intensive_a2', labelKey: 'waitlist.intensiveCourse.summerA2' },
  { value: 'intensive_b1', labelKey: 'waitlist.intensiveCourse.summerB1' },
  { value: 'intensive_conversation', labelKey: 'waitlist.intensiveCourse.conversation' },
];

const GROUP_COURSE_OPTIONS = [
  { value: 'group_small', labelKey: 'waitlist.groupCourse.small' },
  { value: 'group_maturita', labelKey: 'waitlist.groupCourse.maturita' },
  { value: 'group_pair', labelKey: 'waitlist.groupCourse.pair' },
  { value: 'group_private', labelKey: 'waitlist.groupCourse.private' },
];

const FieldLabel = ({ children, required = false }) => (
  <span className="text-sm font-medium text-foreground">
    {children}{required && <span className="ml-1 text-destructive" aria-hidden="true">*</span>}
  </span>
);

const WaitlistForm = ({ preferredCourseType = 'intensive' }) => {
  const { t, language } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [courseType, setCourseType] = useState(preferredCourseType);
  const [intensiveCourse, setIntensiveCourse] = useState('intensive_a1');
  const [groupCourse, setGroupCourse] = useState('group_pair');
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  useEffect(() => {
    setCourseType(preferredCourseType || 'intensive');
  }, [preferredCourseType]);

  useEffect(() => {
    if (courseType !== 'intensive') {
      setIntensiveCourse('intensive_a1');
    }
    if (courseType !== 'small_group') {
      setGroupCourse('group_pair');
    }
  }, [courseType]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!consentPrivacy) {
      setStatus('error');
      setError(t('waitlist.privacyConsent'));
      return;
    }

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
      const selectedCourse = courseType === 'intensive' ? intensiveCourse : groupCourse;
      const courseMeta = `[COURSE:${selectedCourse}]`;
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
        turnstile_token: turnstileToken,
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
      <TurnstileField onToken={setTurnstileToken} />

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
          <label><FieldLabel required>{t('waitlist.courseLabel')}</FieldLabel></label>
          <select
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={courseType}
            onChange={(event) => setCourseType(event.target.value)}
            required
          >
            <option value="intensive">{t('waitlist.course.intensive')}</option>
            <option value="small_group">{t('waitlist.course.smallGroup')}</option>
          </select>
        </div>

        {courseType === 'intensive' && (
          <div className="space-y-2">
            <label><FieldLabel required>{t('waitlist.intensiveCourseLabel')}</FieldLabel></label>
            <select
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={intensiveCourse}
              onChange={(event) => setIntensiveCourse(event.target.value)}
              required
            >
              {INTENSIVE_COURSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
              ))}
            </select>
          </div>
        )}

        {courseType === 'small_group' && (
          <div className="space-y-2">
            <label><FieldLabel required>{t('waitlist.groupCourseLabel')}</FieldLabel></label>
            <select
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={groupCourse}
              onChange={(event) => setGroupCourse(event.target.value)}
              required
            >
              {GROUP_COURSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
              ))}
            </select>
          </div>
        )}

        <Input
          type="text"
          label={t('waitlist.nameLabel')}
          placeholder={t('waitlist.namePlaceholder')}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          autoComplete="name"
          aria-label={t('waitlist.namePlaceholder')}
        />

        <Input
          type="email"
          label={t('waitlist.emailLabel')}
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
          label={t('waitlist.phoneLabel')}
          placeholder={t('waitlist.phonePlaceholder')}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
          inputMode="tel"
          aria-label={t('waitlist.phonePlaceholder')}
        />

        <div className="space-y-2">
          <label htmlFor="waitlist-message"><FieldLabel>{t('waitlist.messageLabel')}</FieldLabel></label>
          <textarea
            id="waitlist-message"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24"
            placeholder={t('waitlist.messagePlaceholder')}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            aria-label={t('waitlist.messagePlaceholder')}
          />
        </div>

        <label htmlFor="waitlist-privacy" className="flex items-start gap-2 text-sm text-muted-foreground">
          <input
            id="waitlist-privacy"
            type="checkbox"
            checked={consentPrivacy}
            onChange={(event) => setConsentPrivacy(event.target.checked)}
            required
            className="mt-0.5 h-4 w-4 rounded border border-primary/60 bg-white accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={t('waitlist.privacyConsent')}
          />
          <span>{t('waitlist.privacyConsent')} <span className="text-destructive" aria-hidden="true">*</span></span>
        </label>

        <label htmlFor="waitlist-marketing" className="flex items-start gap-2 text-sm text-muted-foreground">
          <input
            id="waitlist-marketing"
            type="checkbox"
            checked={consentMarketing}
            onChange={(event) => setConsentMarketing(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border border-primary/60 bg-white accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
