import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Button from './ui/Button';
import Input from './ui/Input';
import { submitLeadCapture } from '../services/leads';
import { trackImpact } from '../utils/analytics';
import { useTranslation } from '../hooks/useTranslation';
import { getLocalizedPath } from '../utils/seo';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const mapPreferredLanguage = (language) => {
  if (language === 'cz') return 'cz';
  if (language === 'es') return 'es';
  return 'sk';
};

const QUESTIONS = [
  {
    id: 1,
    prompt: 'Yo ___ Maria.',
    options: [
      { key: 'a', text: 'estoy' },
      { key: 'b', text: 'soy' },
      { key: 'c', text: 'tengo' },
      { key: 'd', text: 'hay' },
    ],
  },
  {
    id: 2,
    prompt: '___ dias, como estas?',
    options: [
      { key: 'a', text: 'Buen' },
      { key: 'b', text: 'Buenos' },
      { key: 'c', text: 'Buena' },
      { key: 'd', text: 'Bien' },
    ],
  },
  {
    id: 3,
    prompt: 'El libro ->',
    options: [
      { key: 'a', text: 'los libros' },
      { key: 'b', text: 'los libro' },
      { key: 'c', text: 'los libras' },
      { key: 'd', text: 'los libroes' },
    ],
  },
  {
    id: 4,
    prompt: 'Ayer nosotros ___ en casa.',
    options: [
      { key: 'a', text: 'estamos' },
      { key: 'b', text: 'estuvimos' },
      { key: 'c', text: 'estamos estado' },
      { key: 'd', text: 'estabamos sido' },
    ],
  },
  {
    id: 5,
    prompt: 'Me ___ el cafe.',
    options: [
      { key: 'a', text: 'gusta' },
      { key: 'b', text: 'gustan' },
      { key: 'c', text: 'gusto' },
      { key: 'd', text: 'guste' },
    ],
  },
  {
    id: 6,
    prompt: 'Que frase es correcta?',
    options: [
      { key: 'a', text: 'Voy a casa de mi amigo manana' },
      { key: 'b', text: 'Voy a la casa de mi amigo manana' },
      { key: 'c', text: 'Voy en casa de mi amigo manana' },
      { key: 'd', text: 'Voy casa de mi amigo manana' },
    ],
  },
  {
    id: 7,
    prompt: 'Si tengo tiempo, ___ contigo.',
    options: [
      { key: 'a', text: 'ire' },
      { key: 'b', text: 'iba' },
      { key: 'c', text: 'fuera' },
      { key: 'd', text: 'habria ido' },
    ],
  },
  {
    id: 8,
    prompt: 'No pienso que ella ___ razon.',
    options: [
      { key: 'a', text: 'tiene' },
      { key: 'b', text: 'tendra' },
      { key: 'c', text: 'tenga' },
      { key: 'd', text: 'tuvo' },
    ],
  },
  {
    id: 9,
    prompt: 'Que significa "estar cansado de algo"?',
    options: [
      { key: 'a', text: 'Tener sueno' },
      { key: 'b', text: 'No querer seguir haciendolo' },
      { key: 'c', text: 'Estar enfermo' },
      { key: 'd', text: 'Tener hambre' },
    ],
  },
  {
    id: 10,
    prompt: 'No es que no ___ hacerlo, es que no puedo.',
    options: [
      { key: 'a', text: 'quiero' },
      { key: 'b', text: 'querria' },
      { key: 'c', text: 'quiera' },
      { key: 'd', text: 'quise' },
    ],
  },
  {
    id: 11,
    prompt: 'De haberlo sabido, no ___ asi.',
    options: [
      { key: 'a', text: 'actuaria' },
      { key: 'b', text: 'habria actuado' },
      { key: 'c', text: 'actue' },
      { key: 'd', text: 'hubiera actuar' },
    ],
  },
  {
    id: 12,
    prompt: 'Se fue sin que nadie ___ cuenta.',
    options: [
      { key: 'a', text: 'se daba' },
      { key: 'b', text: 'se de' },
      { key: 'c', text: 'se diera' },
      { key: 'd', text: 'se dio' },
    ],
  },
  {
    id: 13,
    prompt: 'Cuanto mas lo pienso, menos claro ___ veo.',
    options: [
      { key: 'a', text: 'lo' },
      { key: 'b', text: 'le' },
      { key: 'c', text: 'se' },
      { key: 'd', text: 'me' },
    ],
  },
  {
    id: 14,
    prompt: 'No solo no llamo, ___ dio explicaciones.',
    options: [
      { key: 'a', text: 'pero' },
      { key: 'b', text: 'sino' },
      { key: 'c', text: 'sino que' },
      { key: 'd', text: 'ademas' },
    ],
  },
  {
    id: 15,
    prompt: 'Nunca habia visto algo ___ extrano.',
    options: [
      { key: 'a', text: 'tan' },
      { key: 'b', text: 'tanto' },
      { key: 'c', text: 'tal' },
      { key: 'd', text: 'muy' },
    ],
  },
];

const ANSWER_KEY = {
  1: 'b',
  2: 'b',
  3: 'a',
  4: 'b',
  5: 'a',
  6: 'a',
  7: 'a',
  8: 'c',
  9: 'b',
  10: 'c',
  11: 'b',
  12: 'c',
  13: 'a',
  14: 'c',
  15: 'c',
};

const computeBand = (score) => {
  if (score <= 3) return 'A0-A1';
  if (score <= 6) return 'A2';
  if (score <= 9) return 'B1';
  if (score <= 12) return 'B1 alto';
  return 'B2 (maximo del test)';
};

const AdvancedSpanishTestForm = () => {
  const { language, t } = useTranslation();

  const [answers, setAnswers] = useState({});
  const [testError, setTestError] = useState('');
  const [contactError, setContactError] = useState('');
  const [status, setStatus] = useState('idle');
  const [step, setStep] = useState('quiz');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);

  const score = useMemo(() => {
    return QUESTIONS.reduce((total, question) => {
      return total + (answers[question.id] === ANSWER_KEY[question.id] ? 1 : 0);
    }, 0);
  }, [answers]);

  const band = useMemo(() => computeBand(score), [score]);
  const activeQuestion = QUESTIONS[activeQuestionIndex];
  const totalQuestions = QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((activeQuestionIndex + 1) / totalQuestions) * 100);

  const bookingSystemPath = getLocalizedPath('/booking-system', language);
  const contactPath = getLocalizedPath('/contact', language);

  const onSelectAnswer = (questionId, optionKey) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
    setTestError('');
  };

  const onContinueQuestion = (event) => {
    event.preventDefault();

    if (!answers[activeQuestion.id]) {
      setTestError('Selecciona una respuesta para continuar.');
      return;
    }

    setTestError('');

    if (activeQuestionIndex < totalQuestions - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
      return;
    }

    setStep('result');

    trackImpact('advanced_test_submitted', {
      location: 'level_questionnaire',
      score,
      band,
    });
  };

  const onBackQuestion = () => {
    if (activeQuestionIndex === 0) return;
    setActiveQuestionIndex((prev) => prev - 1);
    setTestError('');
  };

  const onOpenContactStep = () => {
    setStep('contact');
  };

  const onRestartTest = () => {
    setStep('quiz');
    setActiveQuestionIndex(0);
    setAnswers({});
    setTestError('');
    setContactError('');
    setStatus('idle');
  };

  const onSubmitContact = async (event) => {
    event.preventDefault();
    setContactError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setContactError('Introduce un email válido.');
      return;
    }

    if (!consentPrivacy) {
      setContactError('Debes aceptar la política de privacidad.');
      return;
    }

    setStatus('submitting');
    try {
      const answersText = QUESTIONS.map((question) => {
        const picked = answers[question.id] || '-';
        return `q${question.id}:${picked}`;
      }).join(' | ');

      const notes = [
        'test_type:advanced_spanish_b2_ceiling',
        `test_score:${score}/15`,
        `test_band:${band}`,
        answersText,
      ].join(' | ');

      await submitLeadCapture({
        full_name: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        preferred_language: mapPreferredLanguage(language),
        source: 'advanced_level_test',
        notes,
        consent_privacy: true,
        consent_marketing: consentMarketing,
        consent_version: 'v1',
      });

      trackImpact('advanced_test_lead_submitted', {
        location: 'level_questionnaire',
        score,
        band,
      });

      setStatus('success');
      setStep('success');
    } catch (error) {
      setContactError(error?.message || 'No se pudo enviar el formulario. Inténtalo de nuevo.');
      setStatus('idle');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-border p-6">
      <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-5">
        <h3 className="text-2xl font-headlines font-bold text-foreground mb-2">Test de nivel</h3>
        <p className="text-foreground/80 text-sm">
          Flujo guiado en 3 pasos: respuestas, resultado y recomendación personalizada.
        </p>
      </div>

      {step === 'quiz' && (
        <>
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Pregunta {activeQuestionIndex + 1} de {totalQuestions}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <form onSubmit={onContinueQuestion} className="space-y-5">
            <fieldset className="border border-border rounded-lg p-4 md:p-5">
              <legend className="text-sm font-semibold text-foreground px-1">
                {activeQuestion.id}. {activeQuestion.prompt}
              </legend>
              <div className="mt-3 space-y-2">
                {activeQuestion.options.map((option) => {
                  const isSelected = answers[activeQuestion.id] === option.key;
                  return (
                    <label
                      key={`${activeQuestion.id}-${option.key}`}
                      className={`flex items-start gap-3 text-sm rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${activeQuestion.id}`}
                        value={option.key}
                        checked={isSelected}
                        onChange={() => onSelectAnswer(activeQuestion.id, option.key)}
                        className="mt-1"
                      />
                      <span>{option.key}) {option.text}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {testError && (
              <div className="rounded-lg border border-error/20 bg-error/10 p-3 text-error text-sm" role="alert">
                {testError}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-muted-foreground">Respondidas: {answeredCount}/{totalQuestions}</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onBackQuestion} disabled={activeQuestionIndex === 0}>
                  {t('common.previous')}
                </Button>
                <Button type="submit" iconName="ArrowRight" iconPosition="right">
                  {activeQuestionIndex === totalQuestions - 1 ? 'Ver resultado' : t('common.next')}
                </Button>
              </div>
            </div>
          </form>
        </>
      )}

      {step === 'result' && (
        <section className="space-y-4">
          <div className="rounded-xl border border-success/25 bg-success/10 p-5">
            <p className="text-xs font-semibold text-success uppercase tracking-wide mb-2">Resultado listo</p>
            <h4 className="text-xl font-headlines font-bold text-foreground mb-2">Tu nivel estimado: {band}</h4>
            <p className="text-sm text-muted-foreground">Aciertos: {score}/{totalQuestions}. Te enviaremos una recomendación personalizada y próximos pasos.</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Recomendación UX: reserva una clase demo después de enviarnos tus datos para recibir feedback individual.
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={onRestartTest}>Repetir test</Button>
            <Button onClick={onOpenContactStep}>Continuar y recibir evaluación</Button>
          </div>
        </section>
      )}

      {step === 'contact' && (
        <form onSubmit={onSubmitContact} className="border-t border-border pt-6 space-y-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
            <p className="font-medium">Estás a un paso de tu recomendación personalizada.</p>
            <p className="text-muted-foreground">Déjanos tus datos y te escribimos con nivel, plan recomendado y CTA de siguiente acción.</p>
          </div>

          <Input
            type="text"
            placeholder="Nombre y apellidos"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            autoComplete="name"
            aria-label="Nombre y apellidos"
          />
          <Input
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            aria-label="Tu correo electrónico"
          />
          <Input
            type="tel"
            placeholder="Teléfono (opcional)"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            aria-label="Teléfono (opcional)"
          />

          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={consentPrivacy}
              onChange={(event) => setConsentPrivacy(event.target.checked)}
              className="mt-1"
              required
            />
            <span>Acepto el tratamiento de datos personales según la política de privacidad.</span>
          </label>

          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={consentMarketing}
              onChange={(event) => setConsentMarketing(event.target.checked)}
              className="mt-1"
            />
            <span>Quiero recibir novedades por email.</span>
          </label>

          {contactError && (
            <div className="rounded-lg border border-error/20 bg-error/10 p-3 text-error text-sm" role="alert">
              {contactError}
            </div>
          )}

          <div className="flex justify-between gap-3 flex-wrap">
            <Button type="button" variant="outline" onClick={() => setStep('result')}>
              {t('common.previous')}
            </Button>
            <Button type="submit" loading={status === 'submitting'} disabled={status === 'submitting'}>
              Recibir evaluación por correo
            </Button>
          </div>
        </form>
      )}

      {step === 'success' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-success/20 bg-success/10 p-4 text-success text-sm">
            Gracias. Hemos recibido tu test y te enviaremos por correo resultados, recomendaciones y enlaces para continuar.
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button asChild variant="outline">
              <Link to={contactPath}>Hablar con Habluj</Link>
            </Button>
            <Button asChild>
              <Link to={bookingSystemPath}>Reservar siguiente paso</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSpanishTestForm;
