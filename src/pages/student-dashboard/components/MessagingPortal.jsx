import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { contactInfo, getContactLinks } from '../../../utils/contactInfo';

const MessagingPortal = ({
  user,
  nextBooking,
  messages = [],
  onMarkRead,
  onSendMessage,
  isUpdatingMessage = false,
  isSendingMessage = false,
  messagesError = '',
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [composeError, setComposeError] = useState('');
  const [composeSuccess, setComposeSuccess] = useState('');
  const chatBodyRef = useRef(null);
  const pendingReadRef = useRef(new Set());

  const userDisplay = useMemo(() => {
    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    return fullName || user?.username || '-';
  }, [user]);

  const orderedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
  }, [messages]);

  const unreadFromEsterCount = useMemo(() => {
    return orderedMessages.filter((item) => !item.is_read && item.sender?.id !== user?.id).length;
  }, [orderedMessages, user?.id]);

  useEffect(() => {
    const unreadFromEster = orderedMessages.filter((item) => (
      !item.is_read && item.sender?.id !== user?.id
    ));

    unreadFromEster.forEach((item) => {
      if (pendingReadRef.current.has(item.id)) return;
      pendingReadRef.current.add(item.id);
      Promise.resolve(onMarkRead?.(item.id)).finally(() => {
        pendingReadRef.current.delete(item.id);
      });
    });
  }, [orderedMessages, onMarkRead, user?.id]);

  useEffect(() => {
    const node = chatBodyRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [orderedMessages.length]);

  const buildMailto = () => {
    const safeSubject = encodeURIComponent(t('studentMessages.defaultSubject'));
    const safeBody = encodeURIComponent(`${message}\n\n---\n${t('studentMessages.sentBy')}: ${userDisplay}`);
    return `mailto:${contactInfo.email}?subject=${safeSubject}&body=${safeBody}`;
  };

  const onSubmitMessage = async () => {
    const trimmedBody = message.trim();

    if (!trimmedBody) return;

    setComposeError('');
    setComposeSuccess('');

    try {
      await onSendMessage?.({ body: trimmedBody });
      setMessage('');
      setComposeSuccess('Mensaje enviado correctamente.');
    } catch (error) {
      setComposeError(error?.message || 'No se pudo enviar el mensaje.');
    }
  };

  const onComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmitMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-soft border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headlines font-bold text-foreground">Chat con Ester</h2>
          <p className="text-sm text-muted-foreground">Responde en tiempo real sin asunto.</p>
        </div>
        <span className="text-sm text-muted-foreground">No leidos: {unreadFromEsterCount}</span>
      </div>

      {unreadFromEsterCount > 0 && (
        <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
          Aviso: tienes {unreadFromEsterCount} mensaje(s) de Ester sin leer.
        </div>
      )}

      {(messagesError || composeError || composeSuccess) && (
        <div className="space-y-1">
          {messagesError && <p className="text-sm text-error">{messagesError}</p>}
          {composeError && <p className="text-sm text-error">{composeError}</p>}
          {composeSuccess && <p className="text-sm text-success">{composeSuccess}</p>}
        </div>
      )}

      <div ref={chatBodyRef} className="h-[420px] overflow-y-auto rounded-lg border border-border bg-muted/20 p-4 space-y-3">
        {!orderedMessages.length && <p className="text-sm text-muted-foreground">Todavia no hay mensajes. Escribe el primero.</p>}
        {orderedMessages.map((item) => {
          const isMine = item.sender?.id === user?.id;
          return (
            <div
              key={item.id}
              className={`max-w-[85%] rounded-2xl border px-3 py-2 text-sm ${isMine ? 'ml-auto border-primary/30 bg-primary/10' : 'mr-auto border-border bg-white'}`}
            >
              <p className="whitespace-pre-wrap text-foreground">{item.body}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {item.sender?.username || '-'} · {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={onComposerKeyDown}
          placeholder={t('studentMessages.messagePlaceholder')}
          rows={4}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Button iconName="Send" iconPosition="left" disabled={!message.trim() || isSendingMessage} onClick={onSubmitMessage}>
            {isSendingMessage ? 'Enviando...' : 'Enviar'}
          </Button>
          <Button asChild variant="outline" iconName="Mail" iconPosition="left">
            <a href={buildMailto()}>Enviar correo</a>
          </Button>
          <Button asChild variant="outline" iconName="Instagram" iconPosition="left">
            <a href={getContactLinks.instagram()} target="_blank" rel="noopener noreferrer">Instagram</a>
          </Button>
          <Button variant="outline" onClick={() => setMessage('')}>{t('studentMessages.clearMessage')}</Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        {!nextBooking && <p>{t('studentMessages.noUpcomingClass')}</p>}
        {nextBooking && <p>{t('studentMessages.nextClassHint')}: {nextBooking.lesson?.title || '-'} ({nextBooking.date} {nextBooking.time || ''})</p>}
        <p>Contacto directo: {contactInfo.email}</p>
      </div>
    </div>
  );
};

export default MessagingPortal;
