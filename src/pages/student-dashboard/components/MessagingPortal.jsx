import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { contactInfo, getContactLinks } from '../../../utils/contactInfo';

const MessagingPortal = ({ user, nextBooking, messages = [], onMarkRead, isUpdatingMessage = false, messagesError = '' }) => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const userDisplay = useMemo(() => {
    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    return fullName || user?.username || 'Student';
  }, [user]);

  const buildMailto = () => {
    const safeSubject = encodeURIComponent(subject || t('studentMessages.defaultSubject'));
    const safeBody = encodeURIComponent(`${message}\n\n---\n${t('studentMessages.sentBy')}: ${userDisplay}`);
    return `mailto:${contactInfo.email}?subject=${safeSubject}&body=${safeBody}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-soft border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-headlines font-bold text-foreground">Mensajes de Ester</h2>
          <span className="text-sm text-muted-foreground">No leidos: {messages.filter((item) => !item.is_read).length}</span>
        </div>
        {messagesError && <p className="text-sm text-error mt-3">{messagesError}</p>}
        <div className="mt-4 space-y-3">
          {!messages.length && <p className="text-sm text-muted-foreground">Todavia no tienes mensajes directos.</p>}
          {messages.map((item) => (
            <div key={item.id} className={`rounded-lg border p-4 ${item.is_read ? 'border-border' : 'border-primary/30 bg-primary/5'}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-foreground">{item.subject}</h3>
                <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{item.body}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">De: {item.sender?.username || 'Ester'}</span>
                {!item.is_read && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdatingMessage}
                    onClick={() => onMarkRead?.(item.id)}
                  >
                    Marcar como leido
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-soft border p-6">
        <h2 className="text-2xl font-headlines font-bold text-foreground">{t('studentMessages.title')}</h2>
        <p className="text-muted-foreground">{t('studentMessages.subtitleFunctional')}</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={getContactLinks.email()}
            className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Icon name="Mail" size={18} className="text-primary" />
              <span className="font-medium text-foreground">{contactInfo.email}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{t('studentMessages.emailHint')}</p>
          </a>

          <a
            href={getContactLinks.instagram()}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Icon name="Instagram" size={18} className="text-primary" />
              <span className="font-medium text-foreground">@{contactInfo.instagram}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{t('studentMessages.instagramHint')}</p>
          </a>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-soft border p-6">
        <h3 className="text-lg font-headlines font-semibold text-foreground">{t('studentMessages.composeTitle')}</h3>
        <p className="text-sm text-muted-foreground mt-1">{t('studentMessages.composeSubtitle')}</p>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder={t('studentMessages.subjectPlaceholder')}
            className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t('studentMessages.messagePlaceholder')}
            rows={6}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />

          <div className="flex flex-wrap gap-2">
            <Button asChild iconName="Send" iconPosition="left" disabled={!message.trim()}>
              <a href={buildMailto()}>{t('studentMessages.openEmailClient')}</a>
            </Button>
            <Button variant="outline" onClick={() => setMessage('')}>
              {t('studentMessages.clearMessage')}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-muted/40 rounded-lg border border-border p-4">
        <h4 className="font-medium text-foreground">{t('studentMessages.nextStepTitle')}</h4>
        {!nextBooking && <p className="text-sm text-muted-foreground mt-2">{t('studentMessages.noUpcomingClass')}</p>}
        {nextBooking && (
          <p className="text-sm text-muted-foreground mt-2">
            {t('studentMessages.nextClassHint')}: {nextBooking.lesson?.title || '-'} ({nextBooking.date} {nextBooking.time || ''})
          </p>
        )}
      </div>
    </div>
  );
};

export default MessagingPortal;
