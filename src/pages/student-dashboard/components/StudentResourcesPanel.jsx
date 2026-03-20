import React, { useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';

const localeByLanguage = {
  sk: 'sk-SK',
  cz: 'cs-CZ',
  es: 'es-ES',
};

const typeLabel = (type) => {
  if (type === 'pdf') return 'PDF';
  if (type === 'link') return 'Link';
  if (type === 'video') return 'Video';
  if (type === 'audio') return 'Audio';
  return 'Material';
};

const typeIcon = (type) => {
  if (type === 'pdf') return 'FileText';
  if (type === 'link') return 'Link';
  if (type === 'video') return 'Video';
  if (type === 'audio') return 'Headphones';
  return 'Folder';
};

const formatDate = (value, language) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleDateString(localeByLanguage[language] || localeByLanguage.sk, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const normalizeFileName = (fileName = '') => {
  return fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
};

const inferResourceTypeFromFile = (file) => {
  const mime = (file?.type || '').toLowerCase();
  const name = (file?.name || '').toLowerCase();
  if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  return 'other';
};

const StudentResourcesPanel = ({
  materials,
  isLoading,
  error,
  language = 'sk',
  bookings = [],
  onCreateMaterial,
  isCreatingMaterial = false,
  createError = '',
}) => {
  const { t } = useTranslation();
  const addFormRef = useRef(null);
  const titleInputRef = useRef(null);
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    resource_type: 'other',
    external_url: '',
    uploaded_file: null,
    booking_id: '',
  });

  const resetDraft = () => {
    setDraft({
      title: '',
      description: '',
      resource_type: 'other',
      external_url: '',
      uploaded_file: null,
      booking_id: '',
    });
  };

  const resourceTypeLabel = (type) => {
    const builtIn = typeLabel(type);
    return builtIn === 'Material' ? t('studentResources.genericMaterial') : builtIn;
  };

  const openResource = (item) => {
    const url = item.uploaded_file || item.external_url;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const submitMaterial = async (event) => {
    event.preventDefault();
    if (!onCreateMaterial) return;
    await onCreateMaterial({
      title: draft.title,
      description: draft.description,
      resource_type: draft.resource_type,
      external_url: draft.external_url,
      uploaded_file: draft.uploaded_file,
      booking_id: draft.booking_id ? Number(draft.booking_id) : null,
    });
    resetDraft();
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setDraft((prev) => ({ ...prev, uploaded_file: null }));
      return;
    }

    const suggestedTitle = normalizeFileName(file.name) || file.name;
    const suggestedDescription = `Archivo adjunto: ${suggestedTitle}`;

    setDraft((prev) => ({
      ...prev,
      uploaded_file: file,
      resource_type: inferResourceTypeFromFile(file),
      title: prev.title.trim() ? prev.title : suggestedTitle,
      description: prev.description.trim().length >= 10 ? prev.description : suggestedDescription,
    }));
  };

  const canSubmitMaterial =
    draft.title.trim().length >= 3
    && draft.description.trim().length >= 10
    && (Boolean(draft.external_url.trim()) || Boolean(draft.uploaded_file));

  const jumpToAddForm = () => {
    addFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    titleInputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-soft border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-headlines font-bold text-foreground">{t('studentResources.title')}</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{materials.length} {t('studentResources.items')}</span>
            <Button type="button" variant="outline" size="sm" onClick={jumpToAddForm}>
              {t('studentResources.jumpToAdd')}
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Icon name="RefreshCw" size={16} className="animate-spin" />
            <span>{t('studentResources.loading')}</span>
          </div>
        )}

        {error && !isLoading && (
          <p className="text-sm text-error bg-error/10 border border-error/20 rounded-md px-3 py-2">{error}</p>
        )}

        {!isLoading && !materials.length && !error && (
          <p className="text-sm text-muted-foreground">{t('studentResources.empty')}</p>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {materials.map((item) => (
            <div key={item.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon name={typeIcon(item.resource_type)} size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {resourceTypeLabel(item.resource_type)} • {formatDate(item.created_at, language)}
                    </p>
                  </div>
                </div>
              </div>

              {item.description && <p className="text-sm text-muted-foreground mt-3">{item.description}</p>}

              {item.booking?.lesson?.title && (
                <p className="text-xs text-muted-foreground mt-2">{t('studentResources.lessonPrefix')}: {item.booking.lesson.title}</p>
              )}

              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="ExternalLink"
                  onClick={() => openResource(item)}
                  disabled={!item.uploaded_file && !item.external_url}
                >
                  {t('studentResources.openMaterial')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div ref={addFormRef} className="bg-white rounded-lg shadow-soft border p-6">
        <h3 className="text-lg font-headlines font-semibold text-foreground mb-4">{t('studentResources.addTitle')}</h3>
        <form className="space-y-3" onSubmit={submitMaterial}>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('studentResources.form.title')}</label>
              <input
                ref={titleInputRef}
                value={draft.title}
                onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('studentResources.form.description')}</label>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('studentResources.form.externalUrl')}</label>
            <input
              type="url"
              value={draft.external_url}
              onChange={(event) => setDraft((prev) => ({
                ...prev,
                external_url: event.target.value,
                resource_type: prev.uploaded_file ? prev.resource_type : 'link',
              }))}
              className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('studentResources.form.uploadFile')}</label>
            <input
              type="file"
              onChange={onFileChange}
              className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('studentResources.form.lessonOptional')}</label>
            <select
              value={draft.booking_id}
              onChange={(event) => setDraft((prev) => ({ ...prev, booking_id: event.target.value }))}
              className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">{t('studentResources.form.noLesson')}</option>
              {bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {(booking.lesson?.title || t('studentResources.genericMaterial'))} ({booking.date} {booking.time || ''})
                </option>
              ))}
            </select>
          </div>

          {createError && <p className="text-sm text-error">{createError}</p>}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isCreatingMaterial || !canSubmitMaterial} iconName="Plus" iconPosition="left">
              {isCreatingMaterial ? t('studentResources.form.saving') : t('studentResources.form.add')}
            </Button>
            <Button type="button" variant="outline" onClick={resetDraft} disabled={isCreatingMaterial}>
              {t('studentResources.form.clear')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentResourcesPanel;
