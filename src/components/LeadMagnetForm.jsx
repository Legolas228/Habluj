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

const LEVEL_OPTIONS = ['beginner', 'basic', 'intermediate', 'advanced'];
const GOAL_OPTIONS = ['travel', 'work', 'exam', 'conversation'];
const PACE_OPTIONS = ['light', 'regular', 'intensive'];
const LESSON_FORMAT_OPTIONS = ['individual', 'small_group'];
const AVAILABILITY_OPTIONS = ['mornings', 'afternoons', 'evenings', 'weekends'];
const START_WINDOW_OPTIONS = ['asap', 'two_weeks', 'one_month', 'later'];
const EXPERIENCE_OPTIONS = ['none', 'self_taught', 'academy', 'living_abroad'];
const CONFIDENCE_OPTIONS = ['low', 'medium', 'high'];

const LeadMagnetForm = ({ source = 'level_quiz' }) => {
  const { t, language } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [learningGoal, setLearningGoal] = useState('conversation');
  const [studyPace, setStudyPace] = useState('regular');
  const [lessonFormat, setLessonFormat] = useState('individual');
  const [availability, setAvailability] = useState('evenings');
  const [startWindow, setStartWindow] = useState('asap');
  const [learningExperience, setLearningExperience] = useState('none');
  const [speakingConfidence, setSpeakingConfidence] = useState('low');
  const [listeningConfidence, setListeningConfidence] = useState('low');
  const [grammarConfidence, setGrammarConfidence] = useState('low');
  const [motivation, setMotivation] = useState('');
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

    if (!motivation.trim()) {
      setStatus('error');
      setError(t('leadMagnet.motivationRequired'));
      return;
    }

    const resolvedSource = source === 'lead_magnet' ? 'level_quiz' : source;
    const quizNotes = [
      `quiz_level:${currentLevel}`,
      `quiz_goal:${learningGoal}`,
      `quiz_pace:${studyPace}`,
      `quiz_format:${lessonFormat}`,
      `quiz_availability:${availability}`,
      `quiz_start:${startWindow}`,
      `quiz_experience:${learningExperience}`,
      `quiz_confidence_speaking:${speakingConfidence}`,
      `quiz_confidence_listening:${listeningConfidence}`,
      `quiz_confidence_grammar:${grammarConfidence}`,
      `quiz_motivation:${motivation.trim().replace(/\s+/g, ' ')}`,
    ].join(' | ');

    setStatus('submitting');
    try {
      await submitLeadCapture({
        full_name: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        preferred_language: mapPreferredLanguage(language),
        source: resolvedSource,
        notes: quizNotes,
        consent_privacy: consentPrivacy,
        consent_marketing: consentMarketing,
        consent_version: 'v1',
      });
      setStatus('success');
      setFullName('');
      setEmail('');
      setPhone('');
      setCurrentLevel('beginner');
      setLearningGoal('conversation');
      setStudyPace('regular');
      setLessonFormat('individual');
      setAvailability('evenings');
      setStartWindow('asap');
      setLearningExperience('none');
      setSpeakingConfidence('low');
      setListeningConfidence('low');
      setGrammarConfidence('low');
      setMotivation('');
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

        <Input
          type="tel"
          placeholder={t('leadMagnet.phonePlaceholder')}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
          inputMode="tel"
          aria-label={t('leadMagnet.phonePlaceholder')}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="lead-magnet-level">
            {t('leadMagnet.levelLabel')}
          </label>
          <select
            id="lead-magnet-level"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={currentLevel}
            onChange={(event) => setCurrentLevel(event.target.value)}
          >
            {LEVEL_OPTIONS.map((option) => (
              <option key={option} value={option}>{t(`leadMagnet.level.${option}`)}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="lead-magnet-goal">
            {t('leadMagnet.goalLabel')}
          </label>
          <select
            id="lead-magnet-goal"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={learningGoal}
            onChange={(event) => setLearningGoal(event.target.value)}
          >
            {GOAL_OPTIONS.map((option) => (
              <option key={option} value={option}>{t(`leadMagnet.goal.${option}`)}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="lead-magnet-pace">
            {t('leadMagnet.paceLabel')}
          </label>
          <select
            id="lead-magnet-pace"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={studyPace}
            onChange={(event) => setStudyPace(event.target.value)}
          >
            {PACE_OPTIONS.map((option) => (
              <option key={option} value={option}>{t(`leadMagnet.pace.${option}`)}</option>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="lead-magnet-format">
              {t('leadMagnet.formatLabel')}
            </label>
            <select
              id="lead-magnet-format"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={lessonFormat}
              onChange={(event) => setLessonFormat(event.target.value)}
            >
              {LESSON_FORMAT_OPTIONS.map((option) => (
                <option key={option} value={option}>{t(`leadMagnet.format.${option}`)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="lead-magnet-availability">
              {t('leadMagnet.availabilityLabel')}
            </label>
            <select
              id="lead-magnet-availability"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
            >
              {AVAILABILITY_OPTIONS.map((option) => (
                <option key={option} value={option}>{t(`leadMagnet.availability.${option}`)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="lead-magnet-start-window">
              {t('leadMagnet.startLabel')}
            </label>
            <select
              id="lead-magnet-start-window"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={startWindow}
              onChange={(event) => setStartWindow(event.target.value)}
            >
              {START_WINDOW_OPTIONS.map((option) => (
                <option key={option} value={option}>{t(`leadMagnet.start.${option}`)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="lead-magnet-experience">
              {t('leadMagnet.experienceLabel')}
            </label>
            <select
              id="lead-magnet-experience"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={learningExperience}
              onChange={(event) => setLearningExperience(event.target.value)}
            >
              {EXPERIENCE_OPTIONS.map((option) => (
                <option key={option} value={option}>{t(`leadMagnet.experience.${option}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="lead-magnet-confidence-speaking">
              {t('leadMagnet.confidence.speakingLabel')}
            </label>
            <select
              id="lead-magnet-confidence-speaking"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={speakingConfidence}
              onChange={(event) => setSpeakingConfidence(event.target.value)}
            >
              {CONFIDENCE_OPTIONS.map((option) => (
                <option key={option} value={option}>{t(`leadMagnet.confidence.${option}`)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="lead-magnet-confidence-listening">
              {t('leadMagnet.confidence.listeningLabel')}
            </label>
            <select
              id="lead-magnet-confidence-listening"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={listeningConfidence}
              onChange={(event) => setListeningConfidence(event.target.value)}
            >
              {CONFIDENCE_OPTIONS.map((option) => (
                <option key={option} value={option}>{t(`leadMagnet.confidence.${option}`)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="lead-magnet-confidence-grammar">
              {t('leadMagnet.confidence.grammarLabel')}
            </label>
            <select
              id="lead-magnet-confidence-grammar"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={grammarConfidence}
              onChange={(event) => setGrammarConfidence(event.target.value)}
            >
              {CONFIDENCE_OPTIONS.map((option) => (
                <option key={option} value={option}>{t(`leadMagnet.confidence.${option}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="lead-magnet-motivation">
            {t('leadMagnet.motivationLabel')}
          </label>
          <textarea
            id="lead-magnet-motivation"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24"
            value={motivation}
            onChange={(event) => setMotivation(event.target.value)}
            placeholder={t('leadMagnet.motivationPlaceholder')}
            aria-label={t('leadMagnet.motivationLabel')}
            required
          />
        </div>

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
