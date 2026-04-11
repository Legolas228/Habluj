import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../hooks/useTranslation';
import { convertCurrencyAmount, normalizeCurrencyForLanguage } from '../../../utils/currency';

const localeByLanguage = {
  sk: 'sk-SK',
  cz: 'cs-CZ',
  es: 'es-ES',
};

const PaymentHistory = ({ language = 'sk', bookings = [] }) => {
  const { t } = useTranslation();
  const locale = localeByLanguage[language] || localeByLanguage.sk;
  const displayCurrency = normalizeCurrencyForLanguage(language);

  const rows = useMemo(() => bookings.map((booking) => {
    const paymentAmount = Number(booking.payment?.amount);
    const lessonPrice = Number(booking.lesson?.price || 0);
    const baseAmount = Number.isFinite(paymentAmount)
      ? paymentAmount
      : Number.isFinite(lessonPrice)
        ? lessonPrice
        : 0;
    const baseCurrency = String(booking.payment?.currency || booking.currency || 'EUR').toUpperCase();
    return {
      id: booking.id,
      lessonTitle: booking.lesson?.title || '-',
      date: booking.date,
      time: booking.time,
      amount: baseAmount,
      currency: baseCurrency,
      status: booking.status,
      duration: booking.lesson?.duration,
    };
  }), [bookings]);

  const formatAmount = (amount, currency = 'EUR') => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: displayCurrency,
  }).format(convertCurrencyAmount(amount, currency, displayCurrency));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const statusText = (status) => {
    if (status === 'completed') return t('studentPayments.status.paid');
    if (status === 'confirmed') return t('studentPayments.status.pending');
    if (status === 'pending') return t('studentPayments.status.pending');
    if (status === 'cancelled') return t('studentPayments.status.refunded');
    return status || '-';
  };

  const statusClass = (status) => {
    if (status === 'completed') return 'bg-success/10 text-success';
    if (status === 'confirmed' || status === 'pending') return 'bg-warning/10 text-warning';
    if (status === 'cancelled') return 'bg-muted text-muted-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-soft border p-6">
        <h2 className="text-2xl font-headlines font-bold text-foreground">{t('studentPayments.title')}</h2>
        <p className="text-muted-foreground">{t('studentPayments.subtitle')}</p>
      </div>

      <div className="bg-white rounded-lg shadow-soft border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-headlines font-semibold text-foreground">{t('studentPayments.transactions')}</h3>
        </div>

        <div className="divide-y divide-border">
          {!rows.length && (
            <div className="p-6 text-sm text-muted-foreground">{t('studentPayments.noTransactions')}</div>
          )}

          {rows.map((row) => (
            <div key={row.id} className="p-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{row.lessonTitle}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(row.date)}{row.time ? ` • ${row.time}` : ''}
                  {row.duration ? ` • ${row.duration} min` : ''}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{formatAmount(row.amount, row.currency)}</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusClass(row.status)}`}>
                  {statusText(row.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/40 rounded-lg border border-border p-4">
        <div className="flex items-start gap-2">
          <Icon name="ShieldCheck" size={16} className="mt-0.5 text-primary" />
          <p className="text-sm text-muted-foreground">{t('studentPayments.esterBillingNote')}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
