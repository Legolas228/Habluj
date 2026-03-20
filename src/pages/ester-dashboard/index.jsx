import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import {
  createBasicAuthHeader,
  exportLeadsCsv,
  getLeadDetail,
  getLeadMetrics,
  getLeads,
  updateLead,
  updateLeadStage,
  verifyAdminCredentials,
} from '../../services/leads';
import {
  createAdminGoal,
  createAdminMaterial,
  createAdminMessage,
  createAdminProgress,
  deleteAdminGoal,
  deleteAdminMaterial,
  deleteAdminMessage,
  deleteAdminProgress,
  getAdminBookings,
  getAdminGoals,
  getAdminLessons,
  getAdminMaterials,
  getAdminMessages,
  getAdminProgress,
  getAdminStudents,
  updateAdminGoal,
  updateAdminMaterial,
  updateAdminMessage,
  updateAdminBooking,
  updateAdminProgress,
  updateAdminStudent,
} from '../../services/adminPortal';

const AUTH_STORAGE_KEY = 'ester_dashboard_auth';
const STUDENT_TAB_STORAGE_PREFIX = 'ester_student_editor_tab_';

const STAGE_OPTIONS = ['new', 'nurturing', 'qualified', 'booked', 'won', 'lost'];
const ADMIN_SECTIONS = ['leads', 'students', 'bookings'];
const BOOKING_STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'completed'];
const PROFILE_LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const statusLabel = (status) => {
  if (status === 'pending') return 'Pendiente';
  if (status === 'confirmed') return 'Confirmada';
  if (status === 'cancelled') return 'Cancelada';
  if (status === 'completed') return 'Completada';
  return status || '-';
};

const languageLabel = (code) => {
  if (code === 'sk') return 'Slovak';
  if (code === 'cz') return 'Czech';
  if (code === 'es') return 'Spanish';
  return code || '-';
};

const formatDate = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const metricListToMap = (items = []) => {
  return items.reduce((acc, item) => {
    if (item?.stage) acc[item.stage] = item.count;
    if (item?.source) acc[item.source] = item.count;
    if (item?.preferred_language) acc[item.preferred_language] = item.count;
    return acc;
  }, {});
};

const cap = (value = '') => {
  if (!value) return '-';
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
};

const sectionMeta = {
  leads: { label: 'Oportunidades', icon: 'BarChart3' },
  students: { label: 'Estudiantes', icon: 'Users' },
  bookings: { label: 'Reservas', icon: 'Calendar' },
};

const toDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offsetMs);
  return localDate.toISOString().slice(0, 16);
};

const toCsvValue = (value) => {
  const str = value === null || value === undefined ? '' : String(value);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
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

const isPastDate = (dateString) => {
  if (!dateString) return false;
  const targetDate = new Date(dateString);
  if (Number.isNaN(targetDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  return targetDate < today;
};

const buildLeadsCsvBlob = (items = []) => {
  const headers = [
    'id',
    'full_name',
    'email',
    'phone',
    'preferred_language',
    'source',
    'stage',
    'follow_up_at',
    'duplicate_of',
    'duplicate_confidence',
    'created_at',
    'updated_at',
  ];

  const lines = [headers.map(toCsvValue).join(',')];
  items.forEach((lead) => {
    lines.push([
      lead.id,
      lead.full_name,
      lead.email,
      lead.phone,
      lead.preferred_language,
      lead.source,
      lead.stage,
      lead.follow_up_at,
      lead.duplicate_of,
      lead.duplicate_confidence,
      lead.created_at,
      lead.updated_at,
    ].map(toCsvValue).join(','));
  });

  return new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
};

const EsterDashboard = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authHeader, setAuthHeader] = useState('');
  const [activeSection, setActiveSection] = useState('leads');

  const [isLoading, setIsLoading] = useState(false);
  const [isStageUpdating, setIsStageUpdating] = useState('');
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  const [isLessonsLoading, setIsLessonsLoading] = useState(false);
  const [isStudentUpdating, setIsStudentUpdating] = useState(false);
  const [isBookingUpdating, setIsBookingUpdating] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [metrics, setMetrics] = useState(null);
  const [leads, setLeads] = useState([]);
  const [students, setStudents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [studentMaterials, setStudentMaterials] = useState([]);
  const [studentGoals, setStudentGoals] = useState([]);
  const [studentMessages, setStudentMessages] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);
  const [isStudentMaterialsLoading, setIsStudentMaterialsLoading] = useState(false);
  const [isStudentGoalsLoading, setIsStudentGoalsLoading] = useState(false);
  const [isStudentMessagesLoading, setIsStudentMessagesLoading] = useState(false);
  const [isStudentProgressLoading, setIsStudentProgressLoading] = useState(false);
  const [isMaterialCreating, setIsMaterialCreating] = useState(false);
  const [isGoalSaving, setIsGoalSaving] = useState(false);
  const [isMessageSaving, setIsMessageSaving] = useState(false);
  const [isProgressSaving, setIsProgressSaving] = useState(false);
  const [isMaterialDeleting, setIsMaterialDeleting] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [materialVisibilityFilter, setMaterialVisibilityFilter] = useState('all');
  const [pendingDeleteMaterial, setPendingDeleteMaterial] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [pendingDeleteGoalId, setPendingDeleteGoalId] = useState(null);
  const [goalStatusFilter, setGoalStatusFilter] = useState('all');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [pendingDeleteMessageId, setPendingDeleteMessageId] = useState(null);
  const [messageStatusFilter, setMessageStatusFilter] = useState('all');
  const [selectedProgressId, setSelectedProgressId] = useState(null);
  const [pendingDeleteProgressId, setPendingDeleteProgressId] = useState(null);
  const [progressStatusFilter, setProgressStatusFilter] = useState('all');
  const [actionToast, setActionToast] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [followUpFilter, setFollowUpFilter] = useState('all');
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentLevelFilter, setStudentLevelFilter] = useState('all');
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedLeadDetail, setSelectedLeadDetail] = useState(null);
  const [followUpDraft, setFollowUpDraft] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentEditorTab, setStudentEditorTab] = useState('profile');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [materialDraft, setMaterialDraft] = useState({
    title: '',
    description: '',
    resource_type: 'other',
    external_url: '',
    uploaded_file: null,
    booking_id: '',
    is_active: true,
  });
  const [goalDraft, setGoalDraft] = useState({
    title: '',
    description: '',
    due_date: '',
    is_completed: false,
  });
  const [messageDraft, setMessageDraft] = useState({
    subject: '',
    body: '',
    is_read: false,
  });
  const [progressDraft, setProgressDraft] = useState({
    lesson_id: '',
    completed: false,
    score: '',
    notes: '',
  });
  const [studentDraft, setStudentDraft] = useState({
    first_name: '',
    last_name: '',
    email: '',
    language_level: 'A1',
    bio: '',
    is_active: true,
  });
  const [bookingDraft, setBookingDraft] = useState({
    lesson_id: '',
    date: '',
    time: '',
    status: 'pending',
    notes: '',
  });

  useEffect(() => {
    const storedAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      setAuthHeader(storedAuth);
    }
  }, []);

  useEffect(() => {
    if (!actionToast) return undefined;
    const timeoutId = window.setTimeout(() => {
      setActionToast('');
    }, 2600);
    return () => window.clearTimeout(timeoutId);
  }, [actionToast]);

  const loadDashboardData = async (header) => {
    setIsLoading(true);
    setErrorMessage('');

    const filters = {
      stage: stageFilter,
      source: sourceFilter,
      language: languageFilter,
      follow_up: followUpFilter,
      duplicates: duplicatesOnly ? 'true' : '',
    };

    try {
      const [metricsData, leadsData] = await Promise.all([
        getLeadMetrics(header, filters),
        getLeads(header, filters),
      ]);

      setMetrics(metricsData);
      setLeads(leadsData);
      if (!selectedLeadId && leadsData.length > 0) {
        setSelectedLeadId(leadsData[0].id);
      }
      setSuccessMessage('Datos actualizados correctamente.');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo cargar el dashboard.');
      setSuccessMessage('');
      if ((error?.message || '').toLowerCase().includes('unauthorized')) {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthHeader('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentsData = async (header) => {
    setIsStudentsLoading(true);
    setErrorMessage('');

    try {
      const studentsData = await getAdminStudents(header, {
        q: studentSearchTerm,
        level: studentLevelFilter,
      });
      setStudents(studentsData);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudieron cargar estudiantes.');
      if ((error?.message || '').toLowerCase().includes('unauthorized')) {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthHeader('');
      }
    } finally {
      setIsStudentsLoading(false);
    }
  };

  const loadBookingsData = async (header) => {
    setIsBookingsLoading(true);
    setErrorMessage('');

    try {
      const bookingsData = await getAdminBookings(header, {
        q: bookingSearchTerm,
        status: bookingStatusFilter,
      });
      setBookings(bookingsData);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudieron cargar las reservas.');
      if ((error?.message || '').toLowerCase().includes('unauthorized')) {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthHeader('');
      }
    } finally {
      setIsBookingsLoading(false);
    }
  };

  const loadLessonsData = async (header) => {
    setIsLessonsLoading(true);
    setErrorMessage('');

    try {
      const lessonsData = await getAdminLessons(header);
      setLessons(lessonsData);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudieron cargar las clases.');
      if ((error?.message || '').toLowerCase().includes('unauthorized')) {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthHeader('');
      }
    } finally {
      setIsLessonsLoading(false);
    }
  };

  const loadStudentMaterials = async (header, studentId) => {
    if (!studentId) {
      setStudentMaterials([]);
      return;
    }

    setIsStudentMaterialsLoading(true);
    try {
      const materialsData = await getAdminMaterials(header, { student: studentId });
      setStudentMaterials(materialsData);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudieron cargar los materiales del estudiante.');
    } finally {
      setIsStudentMaterialsLoading(false);
    }
  };

  const loadStudentGoals = async (header, studentId) => {
    if (!studentId) {
      setStudentGoals([]);
      return;
    }

    setIsStudentGoalsLoading(true);
    try {
      const goalsData = await getAdminGoals(header, { student: studentId });
      setStudentGoals(goalsData);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudieron cargar las metas del estudiante.');
    } finally {
      setIsStudentGoalsLoading(false);
    }
  };

  const loadStudentMessages = async (header, studentId) => {
    if (!studentId) {
      setStudentMessages([]);
      return;
    }

    setIsStudentMessagesLoading(true);
    try {
      const messagesData = await getAdminMessages(header, { student: studentId });
      setStudentMessages(messagesData);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudieron cargar los mensajes del estudiante.');
    } finally {
      setIsStudentMessagesLoading(false);
    }
  };

  const loadStudentProgressData = async (header, studentId) => {
    if (!studentId) {
      setStudentProgress([]);
      return;
    }

    setIsStudentProgressLoading(true);
    try {
      const progressData = await getAdminProgress(header, { student: studentId });
      setStudentProgress(progressData);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo cargar el progreso del estudiante.');
    } finally {
      setIsStudentProgressLoading(false);
    }
  };

  const resetMaterialDraft = () => {
    setSelectedMaterialId(null);
    setMaterialDraft({
      title: '',
      description: '',
      resource_type: 'other',
      external_url: '',
      uploaded_file: null,
      booking_id: '',
      is_active: true,
    });
  };

  const resetGoalDraft = () => {
    setSelectedGoalId(null);
    setGoalDraft({ title: '', description: '', due_date: '', is_completed: false });
  };

  const resetMessageDraft = () => {
    setSelectedMessageId(null);
    setMessageDraft({ subject: '', body: '', is_read: false });
  };

  const resetProgressDraft = () => {
    setSelectedProgressId(null);
    setProgressDraft({ lesson_id: '', completed: false, score: '', notes: '' });
  };

  const hydrateMaterialDraft = (material) => {
    if (!material) return;
    setSelectedMaterialId(material.id);
    setMaterialDraft({
      title: material.title || '',
      description: material.description || '',
      resource_type: material.resource_type || 'other',
      external_url: material.external_url || '',
      uploaded_file: null,
      booking_id: material.booking?.id ? String(material.booking.id) : '',
      is_active: material.is_active !== false,
    });
  };

  const hydrateGoalDraft = (goal) => {
    if (!goal) return;
    setSelectedGoalId(goal.id);
    setGoalDraft({
      title: goal.title || '',
      description: goal.description || '',
      due_date: goal.due_date || '',
      is_completed: !!goal.is_completed,
    });
  };

  const hydrateMessageDraft = (message) => {
    if (!message) return;
    setSelectedMessageId(message.id);
    setMessageDraft({
      subject: message.subject || '',
      body: message.body || '',
      is_read: !!message.is_read,
    });
  };

  const hydrateProgressDraft = (progress) => {
    if (!progress) return;
    setSelectedProgressId(progress.id);
    setProgressDraft({
      lesson_id: progress.lesson?.id ? String(progress.lesson.id) : '',
      completed: !!progress.completed,
      score: progress.score ?? '',
      notes: progress.notes || '',
    });
  };

  const onUpdateStudentMaterial = async () => {
    if (!authHeader || !selectedMaterialId) return;

    setIsMaterialCreating(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updated = await updateAdminMaterial({
        authHeader,
        materialId: selectedMaterialId,
        payload: {
          title: materialDraft.title,
          description: materialDraft.description,
          resource_type: materialDraft.resource_type,
          external_url: materialDraft.external_url,
          uploaded_file: materialDraft.uploaded_file,
          booking_id: materialDraft.booking_id ? Number(materialDraft.booking_id) : null,
          is_active: materialDraft.is_active !== false,
        },
      });

      setStudentMaterials((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSuccessMessage('Material actualizado correctamente.');
      setActionToast('Material actualizado.');
      hydrateMaterialDraft(updated);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo actualizar el material.');
    } finally {
      setIsMaterialCreating(false);
    }
  };

  const onCreateStudentMaterial = async () => {
    if (!authHeader || !selectedStudentId) return;

    setIsMaterialCreating(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const created = await createAdminMaterial({
        authHeader,
        payload: {
          student_id: selectedStudentId,
          title: materialDraft.title,
          description: materialDraft.description,
          resource_type: materialDraft.resource_type,
          external_url: materialDraft.external_url,
          uploaded_file: materialDraft.uploaded_file,
          booking_id: materialDraft.booking_id ? Number(materialDraft.booking_id) : null,
          is_active: materialDraft.is_active !== false,
        },
      });

      setStudentMaterials((prev) => [created, ...prev]);
      setSuccessMessage('Material creado correctamente.');
      setActionToast('Material creado.');
      resetMaterialDraft();
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo crear el material.');
    } finally {
      setIsMaterialCreating(false);
    }
  };

  const onMaterialFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setMaterialDraft((prev) => ({ ...prev, uploaded_file: null }));
      return;
    }

    const suggestedTitle = normalizeFileName(file.name) || file.name;
    const suggestedDescription = `Archivo adjunto: ${suggestedTitle}`;

    setMaterialDraft((prev) => ({
      ...prev,
      uploaded_file: file,
      resource_type: inferResourceTypeFromFile(file),
      title: prev.title.trim() ? prev.title : suggestedTitle,
      description: prev.description.trim().length >= 10 ? prev.description : suggestedDescription,
    }));
  };

  const onDeleteStudentMaterial = async (material) => {
    if (!authHeader || !material?.id) return;
    if (!material?.can_delete) {
      setErrorMessage('Solo puede eliminar este material quien lo creo.');
      return;
    }

    setIsMaterialDeleting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await deleteAdminMaterial({ authHeader, materialId: material.id });
      setStudentMaterials((prev) => prev.filter((item) => item.id !== material.id));
      if (selectedMaterialId === material.id) {
        resetMaterialDraft();
      }
      setSuccessMessage('Material eliminado correctamente.');
      setActionToast('Material eliminado.');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo eliminar el material.');
    } finally {
      setIsMaterialDeleting(false);
    }
  };

  const onToggleMaterialVisibility = async (material) => {
    if (!material) return;
    await updateAdminMaterial({
      authHeader,
      materialId: material.id,
      payload: { is_active: !material.is_active },
    });
    setStudentMaterials((prev) => prev.map((item) => (
      item.id === material.id ? { ...item, is_active: !material.is_active } : item
    )));
    if (selectedMaterialId === material.id) {
      setMaterialDraft((prev) => ({ ...prev, is_active: !material.is_active }));
    }
    setActionToast('Visibilidad actualizada.');
  };

  const onSaveGoal = async () => {
    if (!authHeader || !selectedStudentId) return;
    setIsGoalSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        student_id: selectedStudentId,
        title: goalDraft.title,
        description: goalDraft.description,
        due_date: goalDraft.due_date || null,
        is_completed: goalDraft.is_completed,
      };

      if (selectedGoalId) {
        const updated = await updateAdminGoal({ authHeader, goalId: selectedGoalId, payload });
        setStudentGoals((prev) => prev.map((goal) => (goal.id === updated.id ? updated : goal)));
        hydrateGoalDraft(updated);
      } else {
        const created = await createAdminGoal({ authHeader, payload });
        setStudentGoals((prev) => [created, ...prev]);
        resetGoalDraft();
      }

      setSuccessMessage('Meta guardada correctamente.');
      setActionToast(selectedGoalId ? 'Meta actualizada.' : 'Meta creada.');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo guardar la meta.');
    } finally {
      setIsGoalSaving(false);
    }
  };

  const onDeleteGoal = async (goalId) => {
    if (!authHeader || !goalId) return;
    setIsGoalSaving(true);
    try {
      await deleteAdminGoal({ authHeader, goalId });
      setStudentGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      if (selectedGoalId === goalId) resetGoalDraft();
      setSuccessMessage('Meta eliminada.');
      setActionToast('Meta eliminada.');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo eliminar la meta.');
    } finally {
      setIsGoalSaving(false);
    }
  };

  const onSaveMessage = async () => {
    if (!authHeader || !selectedStudentId) return;
    setIsMessageSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        student_id: selectedStudentId,
        subject: messageDraft.subject,
        body: messageDraft.body,
        is_read: messageDraft.is_read,
      };

      if (selectedMessageId) {
        const updated = await updateAdminMessage({ authHeader, messageId: selectedMessageId, payload });
        setStudentMessages((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        hydrateMessageDraft(updated);
      } else {
        const created = await createAdminMessage({ authHeader, payload });
        setStudentMessages((prev) => [created, ...prev]);
        resetMessageDraft();
      }

      setSuccessMessage('Mensaje guardado correctamente.');
      setActionToast(selectedMessageId ? 'Mensaje actualizado.' : 'Mensaje enviado.');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo guardar el mensaje.');
    } finally {
      setIsMessageSaving(false);
    }
  };

  const onDeleteMessage = async (messageId) => {
    if (!authHeader || !messageId) return;
    setIsMessageSaving(true);
    try {
      await deleteAdminMessage({ authHeader, messageId });
      setStudentMessages((prev) => prev.filter((item) => item.id !== messageId));
      if (selectedMessageId === messageId) resetMessageDraft();
      setSuccessMessage('Mensaje eliminado.');
      setActionToast('Mensaje eliminado.');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo eliminar el mensaje.');
    } finally {
      setIsMessageSaving(false);
    }
  };

  const onSaveProgress = async () => {
    if (!authHeader || !selectedStudentId) return;
    setIsProgressSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        student_id: selectedStudentId,
        lesson_id: progressDraft.lesson_id ? Number(progressDraft.lesson_id) : null,
        completed: progressDraft.completed,
        score: progressDraft.score === '' ? null : Number(progressDraft.score),
        notes: progressDraft.notes,
      };

      if (selectedProgressId) {
        const updated = await updateAdminProgress({ authHeader, progressId: selectedProgressId, payload });
        setStudentProgress((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        hydrateProgressDraft(updated);
      } else {
        const created = await createAdminProgress({ authHeader, payload });
        setStudentProgress((prev) => [created, ...prev]);
        resetProgressDraft();
      }

      setSuccessMessage('Progreso guardado correctamente.');
      setActionToast(selectedProgressId ? 'Progreso actualizado.' : 'Progreso creado.');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo guardar el progreso.');
    } finally {
      setIsProgressSaving(false);
    }
  };

  const onDeleteProgress = async (progressId) => {
    if (!authHeader || !progressId) return;
    setIsProgressSaving(true);
    try {
      await deleteAdminProgress({ authHeader, progressId });
      setStudentProgress((prev) => prev.filter((item) => item.id !== progressId));
      if (selectedProgressId === progressId) resetProgressDraft();
      setSuccessMessage('Registro de progreso eliminado.');
      setActionToast('Progreso eliminado.');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo eliminar el progreso.');
    } finally {
      setIsProgressSaving(false);
    }
  };

  useEffect(() => {
    if (authHeader) {
      loadDashboardData(authHeader);
    }
  }, [authHeader, stageFilter, sourceFilter, languageFilter, followUpFilter, duplicatesOnly]);

  useEffect(() => {
    if (authHeader && activeSection === 'students') {
      loadStudentsData(authHeader);
    }
  }, [authHeader, activeSection, studentSearchTerm, studentLevelFilter]);

  useEffect(() => {
    if (authHeader && activeSection === 'bookings') {
      loadBookingsData(authHeader);
    }
  }, [authHeader, activeSection, bookingSearchTerm, bookingStatusFilter]);

  useEffect(() => {
    if (authHeader && activeSection === 'students' && bookings.length === 0) {
      loadBookingsData(authHeader);
    }
  }, [authHeader, activeSection, bookings.length]);

  useEffect(() => {
    if (authHeader && activeSection === 'bookings' && lessons.length === 0) {
      loadLessonsData(authHeader);
    }
  }, [authHeader, activeSection, lessons.length]);

  useEffect(() => {
    if (authHeader && activeSection === 'students' && selectedStudentId) {
      loadStudentMaterials(authHeader, selectedStudentId);
      loadStudentGoals(authHeader, selectedStudentId);
      loadStudentMessages(authHeader, selectedStudentId);
      loadStudentProgressData(authHeader, selectedStudentId);
    }
  }, [authHeader, activeSection, selectedStudentId]);

  useEffect(() => {
    if (selectedStudentId) {
      const storedTab = sessionStorage.getItem(`${STUDENT_TAB_STORAGE_PREFIX}${selectedStudentId}`);
      setStudentEditorTab(storedTab || 'profile');
      setGoalStatusFilter('all');
      setMessageStatusFilter('all');
      setProgressStatusFilter('all');
      setMaterialVisibilityFilter('all');
      setPendingDeleteGoalId(null);
      setPendingDeleteMessageId(null);
      setPendingDeleteProgressId(null);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    if (!selectedStudentId) return;
    sessionStorage.setItem(`${STUDENT_TAB_STORAGE_PREFIX}${selectedStudentId}`, studentEditorTab);
  }, [selectedStudentId, studentEditorTab]);

  const onLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const header = createBasicAuthHeader(username, password);
      await verifyAdminCredentials(header);
      sessionStorage.setItem(AUTH_STORAGE_KEY, header);
      setAuthHeader(header);
      setPassword('');
      setSuccessMessage('Sesión iniciada correctamente.');
    } catch (error) {
      const message = String(error?.message || '');
      if (message.toLowerCase().includes('invalid username') || message.toLowerCase().includes('unauthorized')) {
        setErrorMessage('Credenciales inválidas. Revisa usuario y contraseña.');
        return;
      }
      setErrorMessage(error?.message || 'No se pudo iniciar sesión.');
    }
  };

  const onLogout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthHeader('');
    setActiveSection('leads');
    setMetrics(null);
    setLeads([]);
    setStudents([]);
    setBookings([]);
    setLessons([]);
    setStudentMaterials([]);
    setStudentGoals([]);
    setStudentMessages([]);
    setStudentProgress([]);
    setSelectedLeadId(null);
    setSelectedStudentId(null);
    setSelectedBookingId(null);
    resetMaterialDraft();
    resetGoalDraft();
    resetMessageDraft();
    resetProgressDraft();
    setErrorMessage('');
    setSuccessMessage('Sesión cerrada.');
  };

  const onRefresh = () => {
    if (!authHeader) return;
    if (activeSection === 'students') {
      loadStudentsData(authHeader);
      return;
    }
    if (activeSection === 'bookings') {
      loadBookingsData(authHeader);
      return;
    }
    if (activeSection === 'leads') {
      loadDashboardData(authHeader);
    }
  };

  const onChangeStage = async (leadId, stage) => {
    if (!authHeader) return;

    setIsStageUpdating(String(leadId));
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedLead = await updateLeadStage({
        leadId,
        stage,
        authHeader,
      });

      setLeads((prevLeads) =>
        prevLeads.map((lead) => (lead.id === leadId ? updatedLead : lead))
      );
      setSuccessMessage('Estado del lead actualizado.');
      loadDashboardData(authHeader);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo actualizar el estado.');
    } finally {
      setIsStageUpdating('');
    }
  };

  const onUpdateBookingStatus = async (bookingId, status) => {
    if (!authHeader) return;

    setIsStageUpdating(`booking-${bookingId}`);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedBooking = await updateAdminBooking({
        authHeader,
        bookingId,
        patch: { status },
      });

      setBookings((prevBookings) => prevBookings.map((booking) => (
        booking.id === bookingId ? updatedBooking : booking
      )));
      setSuccessMessage('Estado de la reserva actualizado.');
      if (selectedBookingId === bookingId) {
        setBookingDraft((prev) => ({ ...prev, status: updatedBooking.status || prev.status }));
      }
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo actualizar la reserva.');
    } finally {
      setIsStageUpdating('');
    }
  };

  const hydrateBookingDraft = (booking) => {
    if (!booking) return;
    setSelectedBookingId(booking.id);
    setBookingDraft({
      lesson_id: booking.lesson?.id ? String(booking.lesson.id) : '',
      date: booking.date || '',
      time: booking.time ? String(booking.time).slice(0, 5) : '',
      status: booking.status || 'pending',
      notes: booking.notes || '',
    });
  };

  const onSaveBooking = async () => {
    if (!authHeader || !selectedBookingId) return;

    setIsBookingUpdating(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedBooking = await updateAdminBooking({
        authHeader,
        bookingId: selectedBookingId,
        patch: {
          lesson_id: bookingDraft.lesson_id ? Number(bookingDraft.lesson_id) : undefined,
          date: bookingDraft.date,
          time: bookingDraft.time,
          status: bookingDraft.status,
          notes: bookingDraft.notes,
        },
      });

      setBookings((prevBookings) => prevBookings.map((booking) => (
        booking.id === selectedBookingId ? updatedBooking : booking
      )));
      setSuccessMessage('Reserva actualizada correctamente.');
      hydrateBookingDraft(updatedBooking);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo actualizar la reserva.');
    } finally {
      setIsBookingUpdating(false);
    }
  };

  const hydrateStudentDraft = (student) => {
    if (!student) return;
    setSelectedStudentId(student.id);
    setStudentDraft({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      email: student.email || '',
      language_level: student.language_level || 'A1',
      bio: student.bio || '',
      is_active: student.is_active !== false,
    });
    resetMaterialDraft();
    resetGoalDraft();
    resetMessageDraft();
    resetProgressDraft();
  };

  const onSaveStudent = async () => {
    if (!authHeader || !selectedStudentId) return;

    setIsStudentUpdating(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedStudent = await updateAdminStudent({
        authHeader,
        studentId: selectedStudentId,
        patch: studentDraft,
      });

      setStudents((prevStudents) => prevStudents.map((student) => (
        student.id === selectedStudentId ? updatedStudent : student
      )));
      setSuccessMessage('Estudiante actualizado correctamente.');
      hydrateStudentDraft(updatedStudent);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo actualizar el estudiante.');
    } finally {
      setIsStudentUpdating(false);
    }
  };

  useEffect(() => {
    const loadSelectedLeadDetail = async () => {
      if (!authHeader || !selectedLeadId) {
        setSelectedLeadDetail(null);
        return;
      }

      setIsDetailLoading(true);
      try {
        const detail = await getLeadDetail({ leadId: selectedLeadId, authHeader });
        setSelectedLeadDetail(detail);
        setFollowUpDraft(toDateTimeLocal(detail.follow_up_at));
      } catch (error) {
        setSelectedLeadDetail(null);
        setErrorMessage(error?.message || 'No se pudo cargar el detalle del lead.');
      } finally {
        setIsDetailLoading(false);
      }
    };

    loadSelectedLeadDetail();
  }, [authHeader, selectedLeadId]);

  const onSaveFollowUp = async () => {
    if (!authHeader || !selectedLeadId) return;
    setIsStageUpdating(`followup-${selectedLeadId}`);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = { follow_up_at: followUpDraft ? new Date(followUpDraft).toISOString() : null };
      await updateLead({ leadId: selectedLeadId, patch: payload, authHeader });
      setSuccessMessage('Seguimiento actualizado.');
      await loadDashboardData(authHeader);
      const detail = await getLeadDetail({ leadId: selectedLeadId, authHeader });
      setSelectedLeadDetail(detail);
      setFollowUpDraft(toDateTimeLocal(detail.follow_up_at));
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo guardar el seguimiento.');
    } finally {
      setIsStageUpdating('');
    }
  };

  const onExportCsv = async () => {
    if (!authHeader) return;
    setIsExporting(true);
    setErrorMessage('');

    try {
      const filters = {
        stage: stageFilter,
        source: sourceFilter,
        language: languageFilter,
        follow_up: followUpFilter,
        duplicates: duplicatesOnly ? 'true' : '',
      };
      let blob;
      let filename;
      try {
        const response = await exportLeadsCsv(authHeader, filters);
        blob = response.blob;
        filename = response.filename;
      } catch (error) {
        const message = String(error?.message || '');
        if (!message.toLowerCase().includes('not found')) {
          throw error;
        }
        blob = buildLeadsCsvBlob(filteredLeads);
        filename = 'leads_export_local.csv';
      }

      if (!blob || blob.size === 0) {
        throw new Error('El CSV se generó vacío.');
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename || 'leads_export.csv';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // Some browsers cancel downloads if the blob URL is revoked synchronously.
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setSuccessMessage('CSV exportado correctamente.');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo exportar CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  const sourceOptions = useMemo(() => {
    const unique = new Set(leads.map((lead) => lead.source).filter(Boolean));
    return Array.from(unique).sort();
  }, [leads]);

  const languageOptions = useMemo(() => {
    const unique = new Set(leads.map((lead) => lead.preferred_language).filter(Boolean));
    return Array.from(unique).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
      const matchesLanguage = languageFilter === 'all' || lead.preferred_language === languageFilter;

      if (!term) {
        return matchesStage && matchesSource && matchesLanguage;
      }

      const name = (lead.full_name || '').toLowerCase();
      const email = (lead.email || '').toLowerCase();
      const notes = (lead.notes || '').toLowerCase();
      const source = (lead.source || '').toLowerCase();

      const matchesSearch =
        name.includes(term) ||
        email.includes(term) ||
        notes.includes(term) ||
        source.includes(term);

      return matchesStage && matchesSource && matchesLanguage && matchesSearch;
    });
  }, [leads, searchTerm, stageFilter, sourceFilter, languageFilter]);

  useEffect(() => {
    if (!filteredLeads.length) {
      setSelectedLeadId(null);
      return;
    }

    const exists = filteredLeads.some((lead) => lead.id === selectedLeadId);
    if (!exists) {
      setSelectedLeadId(filteredLeads[0].id);
    }
  }, [filteredLeads, selectedLeadId]);

  const selectedLead = useMemo(() => {
    return filteredLeads.find((lead) => lead.id === selectedLeadId) || null;
  }, [filteredLeads, selectedLeadId]);

  const stageMap = useMemo(() => metricListToMap(metrics?.by_stage || []), [metrics]);
  const sourceMap = useMemo(() => metricListToMap(metrics?.by_source || []), [metrics]);
  const languageMap = useMemo(() => metricListToMap(metrics?.by_language || []), [metrics]);

  const recentLeads = useMemo(() => {
    return [...leads].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  }, [leads]);

  useEffect(() => {
    if (!students.length) {
      setSelectedStudentId(null);
      return;
    }

    const currentStudent = students.find((student) => student.id === selectedStudentId);
    if (currentStudent) {
      return;
    }

    hydrateStudentDraft(students[0]);
  }, [students, selectedStudentId]);

  const selectedStudent = useMemo(() => {
    return students.find((student) => student.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  useEffect(() => {
    if (!bookings.length) {
      setSelectedBookingId(null);
      return;
    }

    const currentBooking = bookings.find((booking) => booking.id === selectedBookingId);
    if (currentBooking) {
      return;
    }

    hydrateBookingDraft(bookings[0]);
  }, [bookings, selectedBookingId]);

  const selectedBooking = useMemo(() => {
    return bookings.find((booking) => booking.id === selectedBookingId) || null;
  }, [bookings, selectedBookingId]);

  const selectedMaterial = useMemo(() => {
    return studentMaterials.find((material) => material.id === selectedMaterialId) || null;
  }, [studentMaterials, selectedMaterialId]);

  const filteredStudentMaterials = useMemo(() => {
    const term = materialSearchTerm.trim().toLowerCase();
    return studentMaterials.filter((material) => {
      const matchesVisibility = materialVisibilityFilter === 'all'
        || (materialVisibilityFilter === 'visible' && material.is_active)
        || (materialVisibilityFilter === 'hidden' && !material.is_active);
      if (!matchesVisibility) return false;
      if (!term) return true;
      const title = (material.title || '').toLowerCase();
      const description = (material.description || '').toLowerCase();
      const url = (material.external_url || '').toLowerCase();
      return title.includes(term) || description.includes(term) || url.includes(term);
    });
  }, [studentMaterials, materialSearchTerm, materialVisibilityFilter]);

  const filteredStudentGoals = useMemo(() => {
    return studentGoals.filter((goal) => {
      if (goalStatusFilter === 'all') return true;
      if (goalStatusFilter === 'completed') return goal.is_completed;
      if (goalStatusFilter === 'pending') return !goal.is_completed;
      if (goalStatusFilter === 'overdue') return !goal.is_completed && isPastDate(goal.due_date);
      return true;
    });
  }, [studentGoals, goalStatusFilter]);

  const filteredStudentMessages = useMemo(() => {
    return studentMessages.filter((message) => {
      if (messageStatusFilter === 'all') return true;
      if (messageStatusFilter === 'read') return message.is_read;
      if (messageStatusFilter === 'unread') return !message.is_read;
      return true;
    });
  }, [studentMessages, messageStatusFilter]);

  const filteredStudentProgress = useMemo(() => {
    return studentProgress.filter((item) => {
      if (progressStatusFilter === 'all') return true;
      if (progressStatusFilter === 'completed') return item.completed;
      if (progressStatusFilter === 'pending') return !item.completed;
      return true;
    });
  }, [studentProgress, progressStatusFilter]);

  const sectionCounts = useMemo(() => {
    return {
      leads: leads.length,
      students: students.length,
      bookings: bookings.length,
    };
  }, [leads.length, students.length, bookings.length]);

  const studentMaterialStats = useMemo(() => {
    const total = studentMaterials.length;
    const visible = studentMaterials.filter((item) => item.is_active).length;
    const ownedByCurrentUser = studentMaterials.filter((item) => item.can_delete).length;
    return { total, visible, ownedByCurrentUser };
  }, [studentMaterials]);

  const studentEngagementStats = useMemo(() => {
    const pendingGoals = studentGoals.filter((goal) => !goal.is_completed).length;
    const unreadMessages = studentMessages.filter((message) => !message.is_read).length;
    const completedProgress = studentProgress.filter((item) => item.completed).length;
    return { pendingGoals, unreadMessages, completedProgress };
  }, [studentGoals, studentMessages, studentProgress]);

  return (
    <div className="min-h-screen bg-muted/20">
      <main className="mx-auto max-w-[1600px] px-4 lg:px-8 py-8 space-y-6">
        <section className="bg-white border border-border rounded-xl shadow-soft p-5 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Admin interno</p>
            <h1 className="text-3xl font-headlines font-bold text-foreground">Panel CRM de Ester</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Gestión comercial centralizada de leads, estados y rendimiento por canal.
            </p>
          </div>
          {authHeader && (
            <div className="flex items-center gap-2">
              <Button variant="outline" iconName="Download" onClick={onExportCsv} disabled={isExporting || isLoading}>
                {isExporting ? 'Exportando...' : 'Export CSV'}
              </Button>
              <Button variant="outline" iconName="RefreshCw" onClick={onRefresh} disabled={isLoading}>
                Actualizar
              </Button>
              <Button variant="destructive" iconName="LogOut" onClick={onLogout}>
                Cerrar sesión
              </Button>
            </div>
          )}
        </section>

        {authHeader && (
          <section className="bg-white border border-border rounded-xl shadow-soft p-3">
            <div className="flex flex-wrap items-center gap-2">
              {ADMIN_SECTIONS.map((section) => (
                <button
                  key={section}
                  type="button"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2 ${activeSection === section ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-foreground hover:bg-muted/60'}`}
                  onClick={() => setActiveSection(section)}
                >
                  <Icon name={sectionMeta[section].icon} size={14} />
                  <span>{sectionMeta[section].label}</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeSection === section ? 'bg-primary-foreground/20' : 'bg-white/70'}`}>
                    {sectionCounts[section]}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {!authHeader && (
          <section className="max-w-3xl mx-auto bg-white border border-border rounded-xl shadow-soft p-6 md:p-8 grid md:grid-cols-2 gap-6 items-start">
            <div>
              <h2 className="text-xl font-headlines font-semibold text-foreground mb-2">Acceso privado de Ester</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Este panel es interno y no muestra la navegación pública de la web para evitar distracciones.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2"><Icon name="CheckCircle2" size={16} className="text-success mt-0.5" />Métricas de conversión por etapa.</li>
                <li className="flex items-start gap-2"><Icon name="CheckCircle2" size={16} className="text-success mt-0.5" />Filtros por origen, idioma y búsqueda libre.</li>
                <li className="flex items-start gap-2"><Icon name="CheckCircle2" size={16} className="text-success mt-0.5" />Actualización de estado de oportunidades en tiempo real.</li>
              </ul>
            </div>
            <form className="space-y-4" onSubmit={onLogin}>
              <Input label="Usuario o email" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="ester o habluj.sk@gmail.com" required />
              <Input type="password" label="Contraseña" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="********" required />
              <Button type="submit" fullWidth iconName="ShieldCheck">Entrar al panel</Button>
            </form>
          </section>
        )}

        {errorMessage && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm" role="alert">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-success text-sm">
            {successMessage}
          </div>
        )}

        {actionToast && (
          <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-success/20 bg-success px-4 py-3 text-sm font-medium text-white shadow-xl">
            {actionToast}
          </div>
        )}

        {authHeader && activeSection === 'leads' && (
          <>
            <section className="grid md:grid-cols-2 xl:grid-cols-6 gap-4">
              <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">Oportunidades totales</p>
                <p className="text-3xl font-bold text-foreground mt-2">{metrics?.total_leads ?? 0}</p>
              </div>
              <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">Conversión a reserva</p>
                <p className="text-3xl font-bold text-foreground mt-2">{metrics?.conversion_to_booked_pct ?? 0}%</p>
              </div>
              <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">Conversión a ganados</p>
                <p className="text-3xl font-bold text-foreground mt-2">{metrics?.conversion_to_won_pct ?? 0}%</p>
              </div>
              <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">Oportunidades visibles (filtros)</p>
                <p className="text-3xl font-bold text-foreground mt-2">{filteredLeads.length}</p>
              </div>
              <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">Seguimiento hoy</p>
                <p className="text-3xl font-bold text-foreground mt-2">{metrics?.follow_up_due_today ?? 0}</p>
              </div>
              <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">Duplicados detectados</p>
                <p className="text-3xl font-bold text-foreground mt-2">{metrics?.duplicates_count ?? 0}</p>
              </div>
            </section>

            <section className="grid xl:grid-cols-3 gap-4">
              <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                <p className="text-sm font-semibold text-foreground mb-3">Pipeline por estado</p>
                <div className="space-y-2 text-sm">
                  {STAGE_OPTIONS.map((stage) => (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{cap(stage)}</span>
                      <span className="font-semibold text-foreground">{stageMap[stage] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                <p className="text-sm font-semibold text-foreground mb-3">Canales de entrada</p>
                <div className="space-y-2 text-sm">
                  {Object.keys(sourceMap).length === 0 && <p className="text-muted-foreground">Sin datos.</p>}
                  {Object.entries(sourceMap).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{source}</span>
                      <span className="font-semibold text-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                <p className="text-sm font-semibold text-foreground mb-3">Idiomas preferidos</p>
                <div className="space-y-2 text-sm">
                  {Object.keys(languageMap).length === 0 && <p className="text-muted-foreground">Sin datos.</p>}
                  {Object.entries(languageMap).map(([language, count]) => (
                    <div key={language} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{languageLabel(language)}</span>
                      <span className="font-semibold text-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white border border-border rounded-xl p-5 shadow-soft space-y-4">
              <div className="flex items-center gap-2 text-foreground">
                <Icon name="Filter" size={18} />
                <h2 className="text-lg font-semibold">Filtros</h2>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-6 gap-3">
                <Input
                  label="Buscar"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Nombre, email, notas u origen"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Estado</label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={stageFilter}
                    onChange={(event) => setStageFilter(event.target.value)}
                  >
                    <option value="all">Todos</option>
                    {STAGE_OPTIONS.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Origen</label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={sourceFilter}
                    onChange={(event) => setSourceFilter(event.target.value)}
                  >
                    <option value="all">Todos</option>
                    {sourceOptions.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Idioma</label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={languageFilter}
                    onChange={(event) => setLanguageFilter(event.target.value)}
                  >
                    <option value="all">Todos</option>
                    {languageOptions.map((language) => (
                      <option key={language} value={language}>{languageLabel(language)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Seguimiento</label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={followUpFilter}
                    onChange={(event) => setFollowUpFilter(event.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="today">Hoy</option>
                    <option value="overdue">Atrasado</option>
                    <option value="scheduled">Programado</option>
                    <option value="none">Sin seguimiento</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Duplicados</label>
                  <button
                    type="button"
                    className={`h-11 w-full rounded-md border px-3 text-sm text-left ${duplicatesOnly ? 'border-primary bg-primary/10 text-foreground' : 'border-input bg-background text-muted-foreground'}`}
                    onClick={() => setDuplicatesOnly((prev) => !prev)}
                  >
                    {duplicatesOnly ? 'Solo duplicados' : 'Todos'}
                  </button>
                </div>
              </div>
            </section>

            <section className="grid xl:grid-cols-12 gap-4">
              <div className="xl:col-span-8 bg-white border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1080px]">
                    <thead className="bg-muted/40 text-left">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Oportunidad</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Origen</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Idioma</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fecha</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Follow-up</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dup</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className={`border-t border-border align-top cursor-pointer ${selectedLeadId === lead.id ? 'bg-primary/5' : 'hover:bg-muted/20'}`}
                          onClick={() => setSelectedLeadId(lead.id)}
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-foreground">{lead.full_name || '-'}</p>
                            <p className="text-sm text-muted-foreground">{lead.email || '-'}</p>
                            <p className="text-xs text-muted-foreground mt-1">{lead.phone || '-'}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">{lead.source || '-'}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{languageLabel(lead.preferred_language)}</td>
                          <td className="px-4 py-3">
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={lead.stage || 'new'}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) => onChangeStage(lead.id, event.target.value)}
                              disabled={isStageUpdating === String(lead.id)}
                            >
                              {STAGE_OPTIONS.map((stage) => (
                                <option key={`${lead.id}-${stage}`} value={stage}>{cap(stage)}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">{formatDate(lead.created_at)}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{formatDate(lead.follow_up_at)}</td>
                          <td className="px-4 py-3 text-sm">
                            {lead.duplicate_of ? (
                              <span className="inline-flex items-center rounded-full bg-warning/15 px-2 py-1 text-xs font-semibold text-warning">
                                {lead.duplicate_confidence || 'possible'}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground max-w-[300px]">
                            <div className="line-clamp-3 whitespace-pre-wrap">{lead.notes || '-'}</div>
                          </td>
                        </tr>
                      ))}

                      {!filteredLeads.length && (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                            No hay leads para los filtros seleccionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="xl:col-span-4 space-y-4">
                <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Detalle de la oportunidad</h3>
                  {!selectedLead && <p className="text-sm text-muted-foreground">Selecciona una oportunidad para ver detalles.</p>}
                  {selectedLead && (
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Nombre:</span> <span className="font-medium text-foreground">{selectedLeadDetail?.full_name || selectedLead.full_name || '-'}</span></p>
                      <p><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground">{selectedLeadDetail?.email || selectedLead.email || '-'}</span></p>
                      <p><span className="text-muted-foreground">Teléfono:</span> <span className="font-medium text-foreground">{selectedLeadDetail?.phone || selectedLead.phone || '-'}</span></p>
                      <p><span className="text-muted-foreground">Idioma:</span> <span className="font-medium text-foreground">{languageLabel(selectedLeadDetail?.preferred_language || selectedLead.preferred_language)}</span></p>
                      <p><span className="text-muted-foreground">Origen:</span> <span className="font-medium text-foreground">{selectedLeadDetail?.source || selectedLead.source || '-'}</span></p>
                      <p><span className="text-muted-foreground">Estado:</span> <span className="font-medium text-foreground">{cap(selectedLeadDetail?.stage || selectedLead.stage)}</span></p>
                      <p><span className="text-muted-foreground">Creado:</span> <span className="font-medium text-foreground">{formatDate(selectedLeadDetail?.created_at || selectedLead.created_at)}</span></p>
                      <p><span className="text-muted-foreground">Duplicado de:</span> <span className="font-medium text-foreground">{selectedLeadDetail?.duplicate_of_email || '-'}</span></p>

                      <div className="pt-2 border-t border-border">
                        <Input
                          type="datetime-local"
                          label="Próximo seguimiento"
                          value={followUpDraft}
                          onChange={(event) => setFollowUpDraft(event.target.value)}
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={onSaveFollowUp}
                            disabled={isStageUpdating === `followup-${selectedLeadId}`}
                          >
                            Guardar follow-up
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFollowUpDraft('')}
                          >
                            Limpiar
                          </Button>
                        </div>
                      </div>

                      <div className="pt-1">
                        <p className="text-muted-foreground">Notas:</p>
                        <div className="mt-1 text-foreground whitespace-pre-wrap bg-muted/30 rounded-md p-2 max-h-40 overflow-y-auto">
                          {selectedLeadDetail?.notes || selectedLead.notes || '-'}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <p className="text-muted-foreground mb-2">Historial de actividad:</p>
                        {isDetailLoading && <p className="text-xs text-muted-foreground">Cargando actividad...</p>}
                        {!isDetailLoading && !selectedLeadDetail?.activities?.length && (
                          <p className="text-xs text-muted-foreground">Aún sin actividad registrada.</p>
                        )}
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {(selectedLeadDetail?.activities || []).map((activity) => (
                            <div key={`act-${activity.id}`} className="rounded-md border border-border p-2">
                              <p className="text-xs font-semibold text-foreground">{cap((activity.action || '').split('_').join(' '))}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</p>
                              {activity.details && <p className="text-xs text-foreground mt-1">{activity.details}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Últimas oportunidades</h3>
                  <div className="space-y-2">
                    {recentLeads.length === 0 && <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>}
                    {recentLeads.map((lead) => (
                      <button
                        key={`recent-${lead.id}`}
                        type="button"
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="w-full text-left p-2 rounded-md hover:bg-muted/30 transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground">{lead.full_name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(lead.created_at)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </section>
          </>
        )}

        {authHeader && activeSection === 'students' && (
          <section className="space-y-4">
            <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
                <Input
                  label="Buscar estudiante"
                  value={studentSearchTerm}
                  onChange={(event) => setStudentSearchTerm(event.target.value)}
                  placeholder="Usuario, nombre o email"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nivel</label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={studentLevelFilter}
                    onChange={(event) => setStudentLevelFilter(event.target.value)}
                  >
                    <option value="all">Todos</option>
                    {PROFILE_LEVEL_OPTIONS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid xl:grid-cols-12 gap-4">
              <div className="xl:col-span-8 bg-white border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px]">
                    <thead className="bg-muted/40 text-left">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Usuario</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nombre</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nivel</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reservas</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Próximas</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Accion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className={`border-t border-border align-top ${selectedStudentId === student.id ? 'bg-primary/5' : ''}`}>
                          <td className="px-4 py-3 text-sm text-foreground">{student.username || '-'}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{`${student.first_name || ''} ${student.last_name || ''}`.trim() || '-'}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{student.email || '-'}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{student.language_level || '-'}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{student.booking_count ?? 0}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{student.upcoming_bookings ?? 0}</td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${student.is_active ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>
                              {student.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <Button variant="outline" size="sm" onClick={() => hydrateStudentDraft(student)}>
                              Editar
                            </Button>
                          </td>
                        </tr>
                      ))}

                      {!isStudentsLoading && students.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                            No hay estudiantes para esos filtros.
                          </td>
                        </tr>
                      )}

                      {isStudentsLoading && (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                            Cargando estudiantes...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="xl:col-span-4 bg-white border border-border rounded-xl p-5 shadow-soft space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Editor de estudiante</h3>

                {!selectedStudent && (
                  <p className="text-sm text-muted-foreground">Selecciona un estudiante para editar su perfil.</p>
                )}

                {selectedStudent && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-md border border-border p-2">
                        <p className="text-xs text-muted-foreground">Metas pendientes</p>
                        <p className="text-base font-semibold text-foreground">{studentEngagementStats.pendingGoals}</p>
                      </div>
                      <div className="rounded-md border border-border p-2">
                        <p className="text-xs text-muted-foreground">Mensajes sin leer</p>
                        <p className="text-base font-semibold text-foreground">{studentEngagementStats.unreadMessages}</p>
                      </div>
                      <div className="rounded-md border border-border p-2">
                        <p className="text-xs text-muted-foreground">Progreso completado</p>
                        <p className="text-base font-semibold text-foreground">{studentEngagementStats.completedProgress}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2 bg-muted/30">
                      {[
                        { id: 'profile', label: 'Perfil', icon: 'User' },
                        { id: 'materials', label: 'Materiales', icon: 'FileText' },
                        { id: 'goals', label: 'Metas', icon: 'Target' },
                        { id: 'messages', label: 'Mensajes', icon: 'MessageCircle' },
                        { id: 'progress', label: 'Progreso', icon: 'TrendingUp' },
                      ].map((tab) => (
                        <Button
                          key={tab.id}
                          type="button"
                          size="sm"
                          variant={studentEditorTab === tab.id ? 'default' : 'outline'}
                          iconName={tab.icon}
                          onClick={() => setStudentEditorTab(tab.id)}
                        >
                          {tab.label}
                        </Button>
                      ))}
                    </div>

                    {studentEditorTab === 'profile' && (
                      <div className="space-y-3">
                        <Input
                          label="Nombre"
                          value={studentDraft.first_name}
                          onChange={(event) => setStudentDraft((prev) => ({ ...prev, first_name: event.target.value }))}
                        />
                        <Input
                          label="Apellido"
                          value={studentDraft.last_name}
                          onChange={(event) => setStudentDraft((prev) => ({ ...prev, last_name: event.target.value }))}
                        />
                        <Input
                          label="Email"
                          value={studentDraft.email}
                          onChange={(event) => setStudentDraft((prev) => ({ ...prev, email: event.target.value }))}
                        />

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Nivel</label>
                          <select
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={studentDraft.language_level}
                            onChange={(event) => setStudentDraft((prev) => ({ ...prev, language_level: event.target.value }))}
                          >
                            {PROFILE_LEVEL_OPTIONS.map((level) => (
                              <option key={`edit-${level}`} value={level}>{level}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Bio</label>
                          <textarea
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            rows={4}
                            value={studentDraft.bio}
                            onChange={(event) => setStudentDraft((prev) => ({ ...prev, bio: event.target.value }))}
                          />
                        </div>

                        <label className="inline-flex items-center gap-2 text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={studentDraft.is_active}
                            onChange={(event) => setStudentDraft((prev) => ({ ...prev, is_active: event.target.checked }))}
                          />
                          Usuario activo
                        </label>

                        <div className="flex items-center gap-2 pt-2">
                          <Button onClick={onSaveStudent} disabled={isStudentUpdating}>
                            {isStudentUpdating ? 'Guardando...' : 'Guardar cambios'}
                          </Button>
                          <Button variant="outline" onClick={() => hydrateStudentDraft(selectedStudent)} disabled={isStudentUpdating}>
                            Reset
                          </Button>
                        </div>
                      </div>
                    )}

                    {studentEditorTab === 'materials' && (
                      <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">Materiales del estudiante</h4>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-md border border-border p-2">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-base font-semibold text-foreground">{studentMaterialStats.total}</p>
                        </div>
                        <div className="rounded-md border border-border p-2">
                          <p className="text-xs text-muted-foreground">Visibles</p>
                          <p className="text-base font-semibold text-foreground">{studentMaterialStats.visible}</p>
                        </div>
                        <div className="rounded-md border border-border p-2">
                          <p className="text-xs text-muted-foreground">Borrables por ti</p>
                          <p className="text-base font-semibold text-foreground">{studentMaterialStats.ownedByCurrentUser}</p>
                        </div>
                      </div>

                      <Input
                        label="Buscar material"
                        value={materialSearchTerm}
                        onChange={(event) => setMaterialSearchTerm(event.target.value)}
                        placeholder="Titulo, descripcion o URL"
                      />

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Visibilidad</label>
                        <select
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={materialVisibilityFilter}
                          onChange={(event) => setMaterialVisibilityFilter(event.target.value)}
                        >
                          <option value="all">Todos</option>
                          <option value="visible">Visibles</option>
                          <option value="hidden">Ocultos</option>
                        </select>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Mostrando {filteredStudentMaterials.length} de {studentMaterials.length} materiales
                      </p>

                      <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-md p-2">
                        {isStudentMaterialsLoading && <p className="text-xs text-muted-foreground">Cargando materiales...</p>}
                        {!isStudentMaterialsLoading && !filteredStudentMaterials.length && (
                          <p className="text-xs text-muted-foreground">Este estudiante aun no tiene materiales.</p>
                        )}
                        {filteredStudentMaterials.map((material) => (
                          <div key={`student-material-${material.id}`} className="text-xs border border-border rounded-md p-2">
                            <p className="font-semibold text-foreground">{material.title}</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold bg-muted text-foreground">
                                {material.resource_type || 'material'}
                              </span>
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${material.is_active ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
                                {material.is_active ? 'Visible' : 'Oculto'}
                              </span>
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${material.can_delete ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-warning'}`}>
                                {material.can_delete ? 'Editable' : 'Solo lectura'}
                              </span>
                            </div>
                            <p className="text-muted-foreground">Creado por: {material.created_by?.username || 'Usuario desconocido'}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Button type="button" size="sm" variant="outline" onClick={() => hydrateMaterialDraft(material)}>
                                Editar
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={async () => {
                                  try {
                                    await onToggleMaterialVisibility(material);
                                    setSuccessMessage('Visibilidad del material actualizada.');
                                  } catch (error) {
                                    setErrorMessage(error?.message || 'No se pudo actualizar visibilidad.');
                                  }
                                }}
                                disabled={isMaterialCreating}
                              >
                                {material.is_active ? 'Ocultar' : 'Mostrar'}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => setPendingDeleteMaterial(material)}
                                disabled={isMaterialDeleting || !material.can_delete}
                              >
                                {material.can_delete ? 'Eliminar' : 'Sin permiso'}
                              </Button>
                            </div>
                            {material.uploaded_file && (
                              <a
                                href={material.uploaded_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline block mt-2"
                              >
                                Abrir archivo
                              </a>
                            )}
                            {!material.uploaded_file && material.external_url && (
                              <a
                                href={material.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline block mt-2"
                              >
                                Abrir URL
                              </a>
                            )}
                          </div>
                        ))}
                      </div>

                      <Input
                        label="Titulo"
                        value={materialDraft.title}
                        onChange={(event) => setMaterialDraft((prev) => ({ ...prev, title: event.target.value }))}
                      />

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">URL</label>
                        <input
                          type="url"
                          className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={materialDraft.external_url}
                          onChange={(event) => setMaterialDraft((prev) => ({
                            ...prev,
                            external_url: event.target.value,
                            resource_type: prev.uploaded_file ? prev.resource_type : 'link',
                          }))}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Adjuntar archivo</label>
                        <input
                          type="file"
                          className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          onChange={onMaterialFileChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Reserva asociada (opcional)</label>
                        <select
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={materialDraft.booking_id}
                          onChange={(event) => setMaterialDraft((prev) => ({ ...prev, booking_id: event.target.value }))}
                        >
                          <option value="">Sin reserva</option>
                          {bookings
                            .filter((booking) => booking.student?.id === selectedStudentId)
                            .map((booking) => (
                              <option key={`material-booking-${booking.id}`} value={booking.id}>
                                {booking.lesson?.title || 'Clase'} ({booking.date} {booking.time || ''})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Descripcion</label>
                        <textarea
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          rows={3}
                          value={materialDraft.description}
                          onChange={(event) => setMaterialDraft((prev) => ({ ...prev, description: event.target.value }))}
                        />
                      </div>

                      <label className="inline-flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={materialDraft.is_active !== false}
                          onChange={(event) => setMaterialDraft((prev) => ({ ...prev, is_active: event.target.checked }))}
                        />
                        Visible para el alumno
                      </label>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={selectedMaterialId ? onUpdateStudentMaterial : onCreateStudentMaterial}
                          disabled={
                            isMaterialCreating
                            || materialDraft.title.trim().length < 3
                            || materialDraft.description.trim().length < 10
                            || (
                              !materialDraft.external_url.trim()
                              && !materialDraft.uploaded_file
                              && !(selectedMaterial && selectedMaterial.uploaded_file)
                              && !(selectedMaterial && selectedMaterial.external_url)
                            )
                          }
                        >
                          {isMaterialCreating
                            ? (selectedMaterialId ? 'Actualizando...' : 'Creando...')
                            : (selectedMaterialId ? 'Guardar material' : 'Anadir material')}
                        </Button>
                        <Button variant="outline" onClick={resetMaterialDraft} disabled={isMaterialCreating}>
                          Limpiar
                        </Button>
                      </div>
                      </div>
                    )}

                    {studentEditorTab === 'goals' && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground">Metas del estudiante</h4>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Filtro de metas</label>
                          <select
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={goalStatusFilter}
                            onChange={(event) => setGoalStatusFilter(event.target.value)}
                          >
                            <option value="all">Todas</option>
                            <option value="pending">Pendientes</option>
                            <option value="completed">Completadas</option>
                            <option value="overdue">Vencidas</option>
                          </select>
                          <p className="text-xs text-muted-foreground">
                            Mostrando {filteredStudentMaterials.length} de {studentMaterials.length} materiales
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Mostrando {filteredStudentGoals.length} de {studentGoals.length} metas
                          </p>
                        </div>
                        <Input
                          label="Titulo de la meta"
                          value={goalDraft.title}
                          onChange={(event) => setGoalDraft((prev) => ({ ...prev, title: event.target.value }))}
                        />
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Descripcion</label>
                          <textarea
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            rows={3}
                            value={goalDraft.description}
                            onChange={(event) => setGoalDraft((prev) => ({ ...prev, description: event.target.value }))}
                          />
                        </div>
                        <Input
                          label="Fecha limite"
                          type="date"
                          value={goalDraft.due_date}
                          onChange={(event) => setGoalDraft((prev) => ({ ...prev, due_date: event.target.value }))}
                        />
                        <label className="inline-flex items-center gap-2 text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={goalDraft.is_completed}
                            onChange={(event) => setGoalDraft((prev) => ({ ...prev, is_completed: event.target.checked }))}
                          />
                          Completada
                        </label>
                        <div className="flex items-center gap-2">
                          <Button onClick={onSaveGoal} disabled={isGoalSaving || goalDraft.title.trim().length < 3}>
                            {isGoalSaving ? 'Guardando...' : (selectedGoalId ? 'Guardar meta' : 'Crear meta')}
                          </Button>
                          <Button variant="outline" onClick={resetGoalDraft} disabled={isGoalSaving}>Limpiar</Button>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-2 border border-border rounded-md p-2">
                          {isStudentGoalsLoading && <p className="text-xs text-muted-foreground">Cargando metas...</p>}
                          {!isStudentGoalsLoading && !filteredStudentGoals.length && <p className="text-xs text-muted-foreground">Sin metas para este filtro.</p>}
                          {filteredStudentGoals.map((goal) => (
                            <div key={`goal-${goal.id}`} className="text-xs border border-border rounded-md p-2">
                              <p className="font-semibold text-foreground">{goal.title}</p>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${goal.is_completed ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                                  {goal.is_completed ? 'Completada' : 'Pendiente'}
                                </span>
                                {goal.due_date && (
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${isPastDate(goal.due_date) && !goal.is_completed ? 'bg-error/15 text-error' : 'bg-muted text-muted-foreground'}`}>
                                    {isPastDate(goal.due_date) && !goal.is_completed ? 'Vencida' : `Limite: ${goal.due_date}`}
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => hydrateGoalDraft(goal)}>Editar</Button>
                                <Button size="sm" variant="destructive" onClick={() => setPendingDeleteGoalId(goal.id)}>Eliminar</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {studentEditorTab === 'messages' && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground">Mensajes al estudiante</h4>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Filtro de mensajes</label>
                          <select
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={messageStatusFilter}
                            onChange={(event) => setMessageStatusFilter(event.target.value)}
                          >
                            <option value="all">Todos</option>
                            <option value="unread">No leidos</option>
                            <option value="read">Leidos</option>
                          </select>
                          <p className="text-xs text-muted-foreground">
                            Mostrando {filteredStudentMessages.length} de {studentMessages.length} mensajes
                          </p>
                        </div>
                        <Input
                          label="Asunto"
                          value={messageDraft.subject}
                          onChange={(event) => setMessageDraft((prev) => ({ ...prev, subject: event.target.value }))}
                        />
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Mensaje</label>
                          <textarea
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            rows={4}
                            value={messageDraft.body}
                            onChange={(event) => setMessageDraft((prev) => ({ ...prev, body: event.target.value }))}
                          />
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={messageDraft.is_read}
                            onChange={(event) => setMessageDraft((prev) => ({ ...prev, is_read: event.target.checked }))}
                          />
                          Marcar como leido
                        </label>
                        <div className="flex items-center gap-2">
                          <Button onClick={onSaveMessage} disabled={isMessageSaving || messageDraft.subject.trim().length < 3 || messageDraft.body.trim().length < 5}>
                            {isMessageSaving ? 'Guardando...' : (selectedMessageId ? 'Guardar mensaje' : 'Enviar mensaje')}
                          </Button>
                          <Button variant="outline" onClick={resetMessageDraft} disabled={isMessageSaving}>Limpiar</Button>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-2 border border-border rounded-md p-2">
                          {isStudentMessagesLoading && <p className="text-xs text-muted-foreground">Cargando mensajes...</p>}
                          {!isStudentMessagesLoading && !filteredStudentMessages.length && <p className="text-xs text-muted-foreground">Sin mensajes para este filtro.</p>}
                          {filteredStudentMessages.map((message) => (
                            <div key={`message-${message.id}`} className="text-xs border border-border rounded-md p-2">
                              <p className="font-semibold text-foreground">{message.subject}</p>
                              <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${message.is_read ? 'bg-muted text-muted-foreground' : 'bg-primary/15 text-primary'}`}>
                                {message.is_read ? 'Leido' : 'No leido'}
                              </span>
                              <div className="mt-2 flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => hydrateMessageDraft(message)}>Editar</Button>
                                <Button size="sm" variant="destructive" onClick={() => setPendingDeleteMessageId(message.id)}>Eliminar</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {studentEditorTab === 'progress' && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground">Progreso del estudiante</h4>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Filtro de progreso</label>
                          <select
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={progressStatusFilter}
                            onChange={(event) => setProgressStatusFilter(event.target.value)}
                          >
                            <option value="all">Todo</option>
                            <option value="pending">Pendiente</option>
                            <option value="completed">Completado</option>
                          </select>
                          <p className="text-xs text-muted-foreground">
                            Mostrando {filteredStudentProgress.length} de {studentProgress.length} registros
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Clase</label>
                          <select
                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={progressDraft.lesson_id}
                            onChange={(event) => setProgressDraft((prev) => ({ ...prev, lesson_id: event.target.value }))}
                          >
                            <option value="">Selecciona una clase</option>
                            {lessons.map((lesson) => (
                              <option key={`progress-lesson-${lesson.id}`} value={lesson.id}>{lesson.title || `Clase ${lesson.id}`}</option>
                            ))}
                          </select>
                        </div>
                        <Input
                          label="Puntuacion"
                          type="number"
                          value={progressDraft.score}
                          onChange={(event) => setProgressDraft((prev) => ({ ...prev, score: event.target.value }))}
                        />
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Notas</label>
                          <textarea
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            rows={3}
                            value={progressDraft.notes}
                            onChange={(event) => setProgressDraft((prev) => ({ ...prev, notes: event.target.value }))}
                          />
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={progressDraft.completed}
                            onChange={(event) => setProgressDraft((prev) => ({ ...prev, completed: event.target.checked }))}
                          />
                          Completada
                        </label>
                        <div className="flex items-center gap-2">
                          <Button onClick={onSaveProgress} disabled={isProgressSaving || !progressDraft.lesson_id}>
                            {isProgressSaving ? 'Guardando...' : (selectedProgressId ? 'Guardar progreso' : 'Crear progreso')}
                          </Button>
                          <Button variant="outline" onClick={resetProgressDraft} disabled={isProgressSaving}>Limpiar</Button>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-2 border border-border rounded-md p-2">
                          {isStudentProgressLoading && <p className="text-xs text-muted-foreground">Cargando progreso...</p>}
                          {!isStudentProgressLoading && !filteredStudentProgress.length && <p className="text-xs text-muted-foreground">Sin registros para este filtro.</p>}
                          {filteredStudentProgress.map((progress) => (
                            <div key={`progress-${progress.id}`} className="text-xs border border-border rounded-md p-2">
                              <p className="font-semibold text-foreground">{progress.lesson?.title || `Clase ${progress.lesson?.id || ''}`}</p>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${progress.completed ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                                  {progress.completed ? 'Completada' : 'Pendiente'}
                                </span>
                                <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold bg-muted text-muted-foreground">
                                  Score: {progress.score ?? '-'}
                                </span>
                              </div>
                              <div className="mt-2 flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => hydrateProgressDraft(progress)}>Editar</Button>
                                <Button size="sm" variant="destructive" onClick={() => setPendingDeleteProgressId(progress.id)}>Eliminar</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </aside>
            </div>
          </section>
        )}

        {authHeader && activeSection === 'bookings' && (
          <section className="space-y-4">
            <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
                <Input
                  label="Buscar reserva"
                  value={bookingSearchTerm}
                  onChange={(event) => setBookingSearchTerm(event.target.value)}
                  placeholder="Alumno, email o clase"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Estado</label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={bookingStatusFilter}
                    onChange={(event) => setBookingStatusFilter(event.target.value)}
                  >
                    <option value="all">Todos</option>
                    {BOOKING_STATUS_OPTIONS.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>{statusLabel(statusOption)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid xl:grid-cols-12 gap-4">
              <div className="xl:col-span-8 bg-white border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1040px]">
                    <thead className="bg-muted/40 text-left">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alumno</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Clase</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fecha</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hora</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className={`border-t border-border align-top ${selectedBookingId === booking.id ? 'bg-primary/5' : ''}`}>
                          <td className="px-4 py-3 text-sm text-foreground">{booking.student?.username || '-'}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{booking.student?.email || '-'}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{booking.lesson?.title || '-'}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{booking.date || '-'}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{booking.time || '-'}</td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-muted text-foreground">
                              {statusLabel(booking.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => hydrateBookingDraft(booking)}>
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUpdateBookingStatus(booking.id, booking.status === 'confirmed' ? 'cancelled' : 'confirmed')}
                                disabled={isStageUpdating === `booking-${booking.id}`}
                              >
                                {booking.status === 'confirmed' ? 'Cancelar' : 'Confirmar'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {!isBookingsLoading && bookings.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                            No hay reservas para esos filtros.
                          </td>
                        </tr>
                      )}

                      {isBookingsLoading && (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                            Cargando reservas...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="xl:col-span-4 bg-white border border-border rounded-xl p-5 shadow-soft space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Editor de reserva</h3>

                {!selectedBooking && (
                  <p className="text-sm text-muted-foreground">Selecciona una reserva para editar sus datos.</p>
                )}

                {selectedBooking && (
                  <>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Clase</label>
                        <select
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={bookingDraft.lesson_id}
                          onChange={(event) => setBookingDraft((prev) => ({ ...prev, lesson_id: event.target.value }))}
                          disabled={isLessonsLoading}
                        >
                          <option value="">Selecciona una clase</option>
                          {lessons.map((lesson) => (
                            <option key={`booking-lesson-${lesson.id}`} value={String(lesson.id)}>
                              {lesson.title} {lesson.level ? `(${lesson.level})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Input
                        type="date"
                        label="Fecha"
                        value={bookingDraft.date}
                        onChange={(event) => setBookingDraft((prev) => ({ ...prev, date: event.target.value }))}
                      />
                      <Input
                        type="time"
                        label="Hora"
                        value={bookingDraft.time}
                        onChange={(event) => setBookingDraft((prev) => ({ ...prev, time: event.target.value }))}
                      />

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Estado</label>
                        <select
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={bookingDraft.status}
                          onChange={(event) => setBookingDraft((prev) => ({ ...prev, status: event.target.value }))}
                        >
                          {BOOKING_STATUS_OPTIONS.map((statusOption) => (
                            <option key={`booking-edit-${statusOption}`} value={statusOption}>{statusLabel(statusOption)}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Notas</label>
                        <textarea
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          rows={5}
                          value={bookingDraft.notes}
                          onChange={(event) => setBookingDraft((prev) => ({ ...prev, notes: event.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button onClick={onSaveBooking} disabled={isBookingUpdating}>
                        {isBookingUpdating ? 'Guardando...' : 'Guardar cambios'}
                      </Button>
                      <Button variant="outline" onClick={() => hydrateBookingDraft(selectedBooking)} disabled={isBookingUpdating}>
                        Reset
                      </Button>
                    </div>
                  </>
                )}
              </aside>
            </div>
          </section>
        )}
      </main>

      {pendingDeleteMaterial && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl border border-border shadow-cultural p-5">
            <h3 className="text-lg font-headlines font-semibold text-foreground">Confirmar eliminacion</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Se eliminara permanentemente "{pendingDeleteMaterial.title}".
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setPendingDeleteMaterial(null)} disabled={isMaterialDeleting}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await onDeleteStudentMaterial(pendingDeleteMaterial);
                  setPendingDeleteMaterial(null);
                }}
                disabled={isMaterialDeleting}
              >
                {isMaterialDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {pendingDeleteGoalId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl border border-border shadow-cultural p-5">
            <h3 className="text-lg font-headlines font-semibold text-foreground">Confirmar eliminacion</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Esta meta se eliminara permanentemente.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setPendingDeleteGoalId(null)} disabled={isGoalSaving}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await onDeleteGoal(pendingDeleteGoalId);
                  setPendingDeleteGoalId(null);
                }}
                disabled={isGoalSaving}
              >
                {isGoalSaving ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {pendingDeleteMessageId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl border border-border shadow-cultural p-5">
            <h3 className="text-lg font-headlines font-semibold text-foreground">Confirmar eliminacion</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Este mensaje se eliminara permanentemente.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setPendingDeleteMessageId(null)} disabled={isMessageSaving}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await onDeleteMessage(pendingDeleteMessageId);
                  setPendingDeleteMessageId(null);
                }}
                disabled={isMessageSaving}
              >
                {isMessageSaving ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {pendingDeleteProgressId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl border border-border shadow-cultural p-5">
            <h3 className="text-lg font-headlines font-semibold text-foreground">Confirmar eliminacion</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Este registro de progreso se eliminara permanentemente.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setPendingDeleteProgressId(null)} disabled={isProgressSaving}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await onDeleteProgress(pendingDeleteProgressId);
                  setPendingDeleteProgressId(null);
                }}
                disabled={isProgressSaving}
              >
                {isProgressSaving ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EsterDashboard;
