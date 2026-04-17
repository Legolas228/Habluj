import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import Icon from '../../components/AppIcon';
import AppImage from '../../components/AppImage';
import Button from '../../components/ui/Button';
import WeeklyBookingGrid from '../../components/WeeklyBookingGrid';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { createStudentBooking, getAvailableBookingSlots, getLessons } from '../../services/studentAuth';
import { DEFAULT_OG_IMAGE, getCanonicalUrl, getHreflangLinks, getLocalizedPath } from '../../utils/seo';

const BookingSystem = () => {
  const { t, language } = useTranslation();
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const hreflangLinks = getHreflangLinks('/booking-system');

  const [lessons, setLessons] = useState([]);
  const [availabilityDays, setAvailabilityDays] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const localizedLoginPath = getLocalizedPath('/login', language);
  const localizedSignupPath = getLocalizedPath('/signup', language);
  const localizedDashboardPath = getLocalizedPath('/student-dashboard', language);

  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    [],
  );

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let isCancelled = false;

    const loadBookingData = async () => {
      setIsDataLoading(true);
      setError('');
      try {
        const [lessonsResponse, availabilityResponse] = await Promise.all([
          getLessons(token),
          getAvailableBookingSlots(token, { daysAhead: 21, timezone }),
        ]);

        if (isCancelled) return;

        setLessons(lessonsResponse);
        setAvailabilityDays(availabilityResponse);

        if (lessonsResponse.length > 0) {
          setSelectedLessonId((current) => current || String(lessonsResponse[0].id));
        }

        if (availabilityResponse.length > 0) {
          const firstDay = availabilityResponse[0];
          setSelectedDate((current) => current || firstDay.date);
          if (firstDay.slots?.length) {
            setSelectedSlot((current) => current || firstDay.slots[0]);
          }
        }
      } catch {
        if (!isCancelled) {
          setError(t('bookingSystem.errors.loadData'));
        }
      } finally {
        if (!isCancelled) {
          setIsDataLoading(false);
        }
      }
    };

    loadBookingData();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, timezone, token, t]);

  const slotsForSelectedDate = useMemo(() => {
    const day = availabilityDays.find((entry) => entry.date === selectedDate);
    return day?.slots || [];
  }, [availabilityDays, selectedDate]);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => String(lesson.id) === String(selectedLessonId)),
    [lessons, selectedLessonId],
  );

  useEffect(() => {
    if (!selectedSlot?.start_time_utc) return;
    const slotStillAvailable = slotsForSelectedDate.some(
      (slot) => slot.start_time_utc === selectedSlot.start_time_utc,
    );
    if (!slotStillAvailable) {
      setSelectedSlot(slotsForSelectedDate[0] || null);
    }
  }, [slotsForSelectedDate, selectedSlot]);

  const handleCreateBooking = async (event) => {
    event.preventDefault();

    if (!selectedLessonId || !selectedDate || !selectedSlot?.start_time_utc || !token) {
      setError(t('bookingSystem.errors.confirmBooking'));
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await createStudentBooking({
        token,
        lesson_id: Number(selectedLessonId),
        date: selectedDate,
        time: selectedSlot.time,
        start_time_utc: selectedSlot.start_time_utc,
        student_timezone: timezone,
        notes,
      });
      setSuccessMessage(t('bookingSystem.success'));
    } catch (submitError) {
      setError(submitError?.message || t('bookingSystem.errors.confirmBooking'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDate = (event) => {
    const nextDate = event.target.value;
    setSelectedDate(nextDate);
    const day = availabilityDays.find((entry) => entry.date === nextDate);
    setSelectedSlot(day?.slots?.[0] || null);
  };

  const isSubmitDisabled = !selectedLessonId || !selectedDate || !selectedSlot?.start_time_utc || isSubmitting;

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
            <section className="bg-white rounded-xl border border-border shadow-soft p-6 md:p-8">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="Calendar" size={26} className="text-primary" />
              </div>
              <h1 className="text-center text-3xl md:text-4xl font-headlines font-bold text-foreground mb-3">
                {t('bookingSystem.hero.title')}
              </h1>
              <p className="text-center text-muted-foreground mb-6">
                {t('bookingSystem.hero.subtitle')}
              </p>

              <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-primary">
                    <Icon name="ShieldCheck" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">{t('booking.info.title')}</p>
                    <p className="text-sm text-muted-foreground">{t('booking.info.item3')}</p>
                  </div>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/40 p-4 text-left">
                    <p className="text-sm text-foreground font-medium mb-1">
                      {t('bookingSystem.steps.singleScreenTitle')}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('bookingSystem.steps.step1Title')} → {t('bookingSystem.steps.step4Title')}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button asChild>
                      <Link to={localizedLoginPath}>{t('header.login')}</Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {t('bookingSystem.contactPrefix')} <Link className="text-primary underline" to={getLocalizedPath('/contact', language)}>{t('bookingSystem.contactLink')}</Link>
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    {t('header.register')}: <Link className="text-primary underline" to={localizedSignupPath}>{t('header.register')}</Link>
                  </p>
                </div>
              )}

              {isAuthenticated && (
                <form className="space-y-6" onSubmit={handleCreateBooking}>
                  {(isAuthLoading || isDataLoading) && (
                    <p className="text-sm text-muted-foreground">{t('bookingSystem.loading')}</p>
                  )}

                  {error && (
                    <div className="rounded-md border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
                      {successMessage}
                    </div>
                  )}

                  {!lessons.length && !isDataLoading && (
                    <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
                      {t('bookingSystem.noLessonsWarning')}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 text-left">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">{t('bookingSystem.fields.lesson')}</span>
                      <select
                        value={selectedLessonId}
                        onChange={(event) => setSelectedLessonId(event.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        {lessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="space-y-2 block text-left">
                    <span className="text-sm font-medium text-foreground">{t('bookingSystem.fields.availableDates')}</span>
                    <select
                      value={selectedDate}
                      onChange={handleSelectDate}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      {availabilityDays.map((day) => (
                        <option key={day.date} value={day.date}>
                          {day.date}
                        </option>
                      ))}
                    </select>
                  </label>

                  {!availabilityDays.length && !isDataLoading && (
                    <p className="text-sm text-muted-foreground text-left">{t('bookingSystem.noDatesAvailable')}</p>
                  )}

                  {availabilityDays.length > 0 && (
                    <div className="space-y-2 text-left">
                      <p className="text-sm font-medium text-foreground">{t('bookingSystem.fields.availableTimes')}</p>
                      <WeeklyBookingGrid
                        selectedDate={selectedDate}
                        availabilityDays={availabilityDays}
                        selectedSlotStartUtc={selectedSlot?.start_time_utc || ''}
                        onSelectSlot={(dayKey, slot) => {
                          setSelectedDate(dayKey);
                          setSelectedSlot(slot);
                        }}
                      />
                      {!slotsForSelectedDate.length && (
                        <p className="text-xs text-muted-foreground">{t('bookingSystem.noTimesForDate')}</p>
                      )}
                    </div>
                  )}

                  <label className="space-y-2 block text-left">
                    <span className="text-sm font-medium text-foreground">{t('bookingSystem.fields.notesOptional')}</span>
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="w-full min-h-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder={t('bookingSystem.fields.notesPlaceholder')}
                    />
                  </label>

                  <div className="rounded-lg border border-border bg-muted/20 p-4 text-left space-y-2">
                    <p className="text-sm text-foreground"><strong>{t('bookingSystem.summary.lesson')}</strong> {selectedLesson?.title || '-'}</p>
                    <p className="text-sm text-foreground"><strong>{t('bookingSystem.summary.date')}</strong> {selectedDate || '-'}</p>
                    <p className="text-sm text-foreground"><strong>{t('bookingSystem.summary.time')}</strong> {selectedSlot?.time?.slice(0, 5) || '-'}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button type="submit" disabled={isSubmitDisabled} loading={isSubmitting}>
                      {t('bookingSystem.actions.confirmBooking')}
                    </Button>
                  </div>

                  <p className="text-sm text-center text-muted-foreground">
                    <Link className="text-primary underline" to={localizedDashboardPath}>{t('bookingSystem.actions.goDashboard')}</Link>
                  </p>
                </form>
              )}

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <article className="rounded-xl border border-border bg-background p-4">
                  <div className="flex gap-3 items-start">
                    <AppImage
                      src="/assets/images/ester-placeholder.webp"
                      alt="Ester Mesaros"
                      className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Ester Mesaros</p>
                      <p className="text-xs text-muted-foreground">{t('about.hero.badge')}</p>
                      <p className="text-xs text-muted-foreground mt-2">{t('testimonials.testimonial1.achievement')}</p>
                    </div>
                  </div>
                </article>
                <article className="rounded-xl border border-border bg-background p-4">
                  <p className="text-sm font-medium text-foreground mb-2">{t('booking.trust.title')}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><Icon name="CheckCircle" size={14} className="text-success" /> {t('booking.trust.item1')}</li>
                    <li className="flex items-center gap-2"><Icon name="CheckCircle" size={14} className="text-success" /> {t('booking.trust.item2')}</li>
                    <li className="flex items-center gap-2"><Icon name="CheckCircle" size={14} className="text-success" /> {t('booking.trust.item3')}</li>
                  </ul>
                </article>
              </div>
            </section>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
};

export default BookingSystem;
