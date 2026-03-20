import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';

const SETMORE_BOOKING_URL = import.meta.env.VITE_SETMORE_BOOKING_URL || 'https://habluj.setmore.com/';

const localeByLanguage = {
  sk: 'sk-SK',
  cz: 'cs-CZ',
  es: 'es-ES',
};

const formatDateTime = (date, time, language) => {
  const dt = new Date(`${date}T${time || '00:00:00'}`);
  if (Number.isNaN(dt.getTime())) return `${date} ${time || ''}`.trim();
  return dt.toLocaleString(localeByLanguage[language] || localeByLanguage.sk, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusLabel = (status, t) => {
  if (status === 'confirmed') return t('studentLessons.status.confirmed');
  if (status === 'pending') return t('studentLessons.status.pending');
  if (status === 'cancelled') return t('studentLessons.status.cancelled');
  if (status === 'completed') return t('studentLessons.status.completed');
  return status || '-';
};

const statusClass = (status) => {
  if (status === 'confirmed') return 'bg-success/10 text-success';
  if (status === 'pending') return 'bg-warning/10 text-warning';
  if (status === 'cancelled') return 'bg-error/10 text-error';
  if (status === 'completed') return 'bg-primary/10 text-primary';
  return 'bg-muted text-muted-foreground';
};

const StudentLessonsPanel = ({
  upcomingBookings,
  pastBookings,
  isLoading,
  error,
  onCancelBooking,
  actionLoadingBookingId,
  language = 'sk',
}) => {
  const { t } = useTranslation();
  const openSetmore = () => window.open(SETMORE_BOOKING_URL, '_blank', 'noopener,noreferrer');

  const handleCancel = (bookingId) => {
    const confirmed = window.confirm(t('studentLessons.cancelConfirm'));
    if (!confirmed) return;
    onCancelBooking(bookingId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-soft border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-headlines font-bold text-foreground">{t('studentLessons.upcomingLessons')}</h2>
          <Button variant="outline" size="sm" iconName="Calendar" onClick={openSetmore}>
            {t('studentLessons.bookReschedule')}
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Icon name="RefreshCw" size={16} className="animate-spin" />
            <span>{t('studentLessons.loadingLessons')}</span>
          </div>
        )}

        {error && !isLoading && (
          <p className="text-sm text-error bg-error/10 border border-error/20 rounded-md px-3 py-2">{error}</p>
        )}

        {!isLoading && !upcomingBookings.length && !error && (
          <p className="text-sm text-muted-foreground">{t('studentLessons.noUpcomingLessons')}</p>
        )}

        <div className="space-y-3">
          {upcomingBookings.map((booking) => (
            <div key={booking.id} className="border border-border rounded-lg p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{booking.lesson?.title || t('studentLessons.defaultLessonTitle')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{formatDateTime(booking.date, booking.time, language)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{booking.lesson?.description || t('studentLessons.defaultLessonDescription')}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass(booking.status)}`}>
                  {statusLabel(booking.status, t)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="default" size="sm" iconName="Video" onClick={openSetmore}>
                  {t('studentLessons.join')}
                </Button>
                <Button variant="outline" size="sm" iconName="ExternalLink" onClick={openSetmore}>
                  {t('studentLessons.rescheduleSetmore')}
                </Button>
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="XCircle"
                    onClick={() => handleCancel(booking.id)}
                    disabled={actionLoadingBookingId === booking.id}
                  >
                    {actionLoadingBookingId === booking.id ? t('studentLessons.cancelLoading') : t('studentLessons.cancel')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-soft border p-6">
        <h3 className="text-lg font-headlines font-semibold text-foreground mb-4">{t('studentLessons.historyTitle')}</h3>
        {!pastBookings.length && <p className="text-sm text-muted-foreground">{t('studentLessons.noCompletedLessons')}</p>}
        <div className="space-y-3">
          {pastBookings.map((booking) => (
            <div key={booking.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{booking.lesson?.title || t('studentLessons.defaultLessonTitle')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{formatDateTime(booking.date, booking.time, language)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass(booking.status)}`}>
                  {statusLabel(booking.status, t)}
                </span>
              </div>
              {booking.notes && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{booking.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentLessonsPanel;
