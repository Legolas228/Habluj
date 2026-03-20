import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import {
  createStudentBooking,
  getLessons,
  getUserProfile,
  updateUserProfile,
} from '../../services/studentAuth';
import { DEFAULT_OG_IMAGE, getCanonicalUrl, getHreflangLinks } from '../../utils/seo';

const TIME_SLOTS = [
  '09:00:00',
  '10:00:00',
  '11:00:00',
  '12:00:00',
  '15:00:00',
  '16:00:00',
  '17:00:00',
  '18:00:00',
];

const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const formatSlotLabel = (slot) => slot.slice(0, 5);

const BookingSystem = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const hreflangLinks = getHreflangLinks('/booking-system');

  const [step, setStep] = useState(1);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      setIsLoading(true);
      setError('');
      try {
        const [lessonList, profile] = await Promise.all([
          getLessons(token),
          getUserProfile(token),
        ]);
        setLessons(lessonList);
        if (lessonList.length > 0) {
          setSelectedLessonId(String(lessonList[0].id));
        }
        if (profile?.language_level && LEVEL_OPTIONS.includes(profile.language_level)) {
          setSelectedLevel(profile.language_level);
        }
      } catch (loadError) {
        setError(loadError?.message || 'No se pudieron cargar los datos de reserva.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token]);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => String(lesson.id) === String(selectedLessonId)) || null,
    [lessons, selectedLessonId],
  );

  const canContinueStep1 = Boolean(selectedLessonId && selectedLevel && lessons.length > 0);
  const canContinueStep2 = Boolean(selectedDate);
  const canContinueStep3 = Boolean(selectedTime);

  const onConfirmBooking = async () => {
    if (!token || !selectedLessonId || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    setError('');
    try {
      await Promise.all([
        createStudentBooking({
          token,
          lesson_id: Number(selectedLessonId),
          date: selectedDate,
          time: selectedTime,
          notes,
        }),
        updateUserProfile({
          token,
          language_level: selectedLevel,
        }),
      ]);
      setIsBooked(true);
      setStep(4);
    } catch (submitError) {
      setError(submitError?.message || 'No se pudo confirmar la reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reserva de clases | Habluj</title>
        <meta
          name="description"
          content="Reserva tu clase de espanol seleccionando nivel, fecha y horario en 4 pasos."
        />
        <link rel="canonical" href={getCanonicalUrl('/booking-system')} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
        <meta property="og:title" content="Reserva de clases | Habluj" />
        <meta
          property="og:description"
          content="Sistema de reserva propio de Habluj para estudiantes registrados."
        />
        <meta property="og:url" content={getCanonicalUrl('/booking-system')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-headlines font-bold text-foreground">Reserva tu clase</h1>
              <p className="text-muted-foreground mt-2">
                Flujo propio de Habluj: nivel, fecha, hora y confirmacion.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-soft p-6 md:p-8">
              <div className="grid grid-cols-4 gap-2 mb-8">
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full ${index <= step ? 'bg-primary' : 'bg-muted'}`}
                  />
                ))}
              </div>

              {error && (
                <div className="mb-6 p-3 rounded-md border border-error/20 bg-error/10 text-error text-sm" role="alert">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="py-16 text-center">
                  <div className="w-9 h-9 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-4">Cargando datos de reserva...</p>
                </div>
              ) : (
                <>
                  {step === 1 && (
                    <section className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground">Paso 1: Nivel y tipo de clase</h2>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Nivel actual</label>
                        <select
                          value={selectedLevel}
                          onChange={(event) => setSelectedLevel(event.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {LEVEL_OPTIONS.map((level) => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Clase</label>
                        {lessons.length > 0 ? (
                          <select
                            value={selectedLessonId}
                            onChange={(event) => setSelectedLessonId(event.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {lessons.map((lesson) => (
                              <option key={lesson.id} value={lesson.id}>
                                {lesson.title} ({lesson.duration} min) - EUR {lesson.price}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-foreground">
                            No hay clases cargadas en el backend. Pide a Ester que cree al menos una clase en el admin de Django.
                          </div>
                        )}
                      </div>

                      {selectedLesson && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-foreground">
                          <p className="font-medium mb-1">{selectedLesson.title}</p>
                          <p>{selectedLesson.description}</p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button onClick={() => setStep(2)} disabled={!canContinueStep1}>
                          Continuar
                          <Icon name="ChevronRight" size={16} className="ml-2" />
                        </Button>
                      </div>
                    </section>
                  )}

                  {step === 2 && (
                    <section className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground">Paso 2: Selecciona fecha</h2>
                      <Input
                        label="Fecha"
                        type="date"
                        value={selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(event) => setSelectedDate(event.target.value)}
                        required
                      />

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(1)}>Atras</Button>
                        <Button onClick={() => setStep(3)} disabled={!canContinueStep2}>
                          Continuar
                          <Icon name="ChevronRight" size={16} className="ml-2" />
                        </Button>
                      </div>
                    </section>
                  )}

                  {step === 3 && (
                    <section className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground">Paso 3: Selecciona horario</h2>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                              selectedTime === slot
                                ? 'border-primary bg-primary text-white'
                                : 'border-border hover:border-primary/40'
                            }`}
                          >
                            {formatSlotLabel(slot)}
                          </button>
                        ))}
                      </div>

                      <Input
                        label="Notas (opcional)"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Objetivo de la clase, dudas, temas que quieres practicar..."
                      />

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(2)}>Atras</Button>
                        <Button onClick={() => setStep(4)} disabled={!canContinueStep3}>
                          Revisar reserva
                          <Icon name="ChevronRight" size={16} className="ml-2" />
                        </Button>
                      </div>
                    </section>
                  )}

                  {step === 4 && (
                    <section className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground">Paso 4: Confirmacion</h2>

                      <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
                        <p><span className="font-medium">Nivel:</span> {selectedLevel}</p>
                        <p><span className="font-medium">Clase:</span> {selectedLesson?.title || '-'}</p>
                        <p><span className="font-medium">Fecha:</span> {selectedDate}</p>
                        <p><span className="font-medium">Hora:</span> {formatSlotLabel(selectedTime || '')}</p>
                        <p><span className="font-medium">Precio:</span> EUR {selectedLesson?.price || '20.00'}</p>
                        {notes && <p><span className="font-medium">Notas:</span> {notes}</p>}
                      </div>

                      {isBooked ? (
                        <div className="rounded-md border border-success/20 bg-success/10 p-4 text-success text-sm">
                          Reserva confirmada. Ya la puedes ver en tu dashboard.
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-3 justify-between">
                        <Button variant="outline" onClick={() => setStep(3)} disabled={isSubmitting || isBooked}>
                          Atras
                        </Button>
                        <div className="flex gap-3">
                          <Button
                            onClick={onConfirmBooking}
                            loading={isSubmitting}
                            disabled={isSubmitting || isBooked}
                          >
                            Confirmar reserva
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => navigate('/student-dashboard')}
                          >
                            Ir al dashboard
                          </Button>
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Si prefieres, tambien puedes escribirnos desde{' '}
                <Link className="text-primary hover:underline" to="/contact">contacto</Link>.
              </p>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
};

export default BookingSystem;
