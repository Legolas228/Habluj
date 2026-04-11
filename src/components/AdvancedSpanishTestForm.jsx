import React, { useMemo, useState } from 'react';

import Button from './ui/Button';
import Input from './ui/Input';
import { submitLeadCapture } from '../services/leads';
import { trackImpact } from '../utils/analytics';
import { useTranslation } from '../hooks/useTranslation';

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
  const { language } = useTranslation();

  const [answers, setAnswers] = useState({});
  const [testError, setTestError] = useState('');
  const [contactError, setContactError] = useState('');
  const [status, setStatus] = useState('idle');
  const [showContactStep, setShowContactStep] = useState(false);

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

  const onSelectAnswer = (questionId, optionKey) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
    setTestError('');
  };

  const onSubmitTest = (event) => {
    event.preventDefault();

    if (Object.keys(answers).length !== QUESTIONS.length) {
      setTestError('Debes responder las 15 preguntas antes de enviar.');
      return;
    }

    setShowContactStep(true);
    setTestError('');

    trackImpact('advanced_test_submitted', {
      location: 'level_questionnaire',
      score,
      band,
    });
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
          Responde las 15 preguntas y te enviaremos el resultado al correo.
        </p>
      </div>

      {status === 'success' ? (
        <div className="rounded-lg border border-success/20 bg-success/10 p-4 text-success text-sm">
          Gracias. Hemos recibido tu test y te enviaremos por correo resultados, recomendaciones y enlaces de reserva.
        </div>
      ) : (
        <>
          <form onSubmit={onSubmitTest} className="space-y-5">
            {QUESTIONS.map((question) => (
              <fieldset key={question.id} className="border border-border rounded-lg p-4">
                <legend className="text-sm font-semibold text-foreground px-1">
                  {question.id}. {question.prompt}
                </legend>
                <div className="mt-3 space-y-2">
                  {question.options.map((option) => (
                    <label key={`${question.id}-${option.key}`} className="flex items-start gap-2 text-sm text-foreground">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.key}
                        checked={answers[question.id] === option.key}
                        onChange={() => onSelectAnswer(question.id, option.key)}
                        className="mt-1"
                      />
                      <span>{option.key}) {option.text}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            {testError && (
              <div className="rounded-lg border border-error/20 bg-error/10 p-3 text-error text-sm" role="alert">
                {testError}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Progreso: {Object.keys(answers).length}/15 respondidas</p>
              <Button type="submit" iconName="Send" iconPosition="right">Enviar test</Button>
            </div>
          </form>

          {showContactStep && (
            <form onSubmit={onSubmitContact} className="mt-8 border-t border-border pt-6 space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
                <p className="text-muted-foreground">Déjanos tus datos para enviarte la evaluación.</p>
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

              <div className="flex justify-end">
                <Button type="submit" loading={status === 'submitting'} disabled={status === 'submitting'}>
                  Recibir evaluación por correo
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default AdvancedSpanishTestForm;
