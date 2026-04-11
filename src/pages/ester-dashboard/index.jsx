import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import StudentLessonsPanel from '../student-dashboard/components/StudentLessonsPanel';
import StudentResourcesPanel from '../student-dashboard/components/StudentResourcesPanel';
import ProgressChart from '../student-dashboard/components/ProgressChart';
import PaymentHistory from '../student-dashboard/components/PaymentHistory';
import {
  exportLeadsCsv,
  getLeadDetail,
  getLeadMetrics,
  getLeads,
  loginAdminWithPassword,
  updateLead,
  updateLeadStage,
} from '../../services/leads';
import {
  createAdminAvailabilityRange,
  createAdminBooking,
  createAdminWeeklyAvailability,
  createAdminGoal,
  createAdminMaterial,
  createAdminMessage,
  createAdminProgress,
  createAdminSlotBlock,
  deleteAdminAvailabilityRange,
  deleteAdminSlotBlock,
  deleteAdminGoal,
  deleteAdminMaterial,
  deleteAdminMessage,
  deleteAdminProgress,
  getAdminAvailabilityRanges,
  getAdminBookings,
  getAdminGoals,
  getAdminLessons,
  getAdminMaterials,
  getAdminMessages,
  getAdminProgress,
  getAdminGoogleCalendarEvents,
  getAdminSlotBlocks,
  getAdminStudents,
  getAdminWeeklyAvailability,
  updateAdminAvailabilityRange,
  updateAdminGoal,
  updateAdminMaterial,
  updateAdminMessage,
  updateAdminBooking,
  updateAdminProgress,
  updateAdminStudent,
  updateAdminWeeklyAvailability,
} from '../../services/adminPortal';

const AUTH_STORAGE_KEY = 'ester_dashboard_auth';
const STUDENT_TAB_STORAGE_PREFIX = 'ester_student_editor_tab_';
const GOOGLE_CALENDAR_ID = (import.meta.env.VITE_GOOGLE_CALENDAR_ID || '').trim();
const GOOGLE_CALENDAR_TIMEZONE = (import.meta.env.VITE_GOOGLE_CALENDAR_TIMEZONE || 'Europe/Madrid').trim();
const GOOGLE_CALENDAR_LOCALE = (import.meta.env.VITE_GOOGLE_CALENDAR_LOCALE || 'es').trim();
const GOOGLE_CALENDAR_EMBED_URL_RAW = (import.meta.env.VITE_GOOGLE_CALENDAR_EMBED_URL || '').trim();
const GOOGLE_CALENDAR_PUBLIC_URL_RAW = (import.meta.env.VITE_GOOGLE_CALENDAR_PUBLIC_URL || '').trim();
const GOOGLE_CALENDAR_EMBED_URL = GOOGLE_CALENDAR_EMBED_URL_RAW
  || (
    GOOGLE_CALENDAR_ID
      ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(GOOGLE_CALENDAR_ID)}&ctz=${encodeURIComponent(GOOGLE_CALENDAR_TIMEZONE)}&hl=${encodeURIComponent(GOOGLE_CALENDAR_LOCALE)}`
      : ''
  );
const GOOGLE_CALENDAR_PUBLIC_URL = GOOGLE_CALENDAR_PUBLIC_URL_RAW
  || (
    GOOGLE_CALENDAR_ID
      ? `https://calendar.google.com/calendar/u/0?cid=${encodeURIComponent(GOOGLE_CALENDAR_ID)}`
      : ''
  );

const STAGE_OPTIONS = ['new', 'nurturing', 'qualified', 'booked', 'won', 'lost'];
const ADMIN_SECTIONS = ['leads', 'students', 'bookings', 'waitlist', 'agenda', 'calendar', 'messages'];
const BOOKING_STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'completed'];
const PROFILE_LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const WAITLIST_SOURCES = ['waitlist_intensive', 'waitlist_small_group'];
const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Lunes' },
  { value: 1, label: 'Martes' },
  { value: 2, label: 'Miércoles' },
  { value: 3, label: 'Jueves' },
  { value: 4, label: 'Viernes' },
  { value: 5, label: 'Sábado' },
  { value: 6, label: 'Domingo' },
];

const statusLabel = (status) => {
  if (status === 'pending') return 'Pendiente';
  if (status === 'confirmed') return 'Confirmada';
  if (status === 'cancelled') return 'Cancelada';
  if (status === 'completed') return 'Completada';
  return status || '-';
};

const languageLabel = (code) => {
  if (code === 'sk') return 'Eslovaco';
  if (code === 'cz') return 'Checo';
  if (code === 'es') return 'Espanol';
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

const stageLabel = (stage) => {
  if (stage === 'new') return 'Nuevo';
  if (stage === 'nurturing') return 'Nutricion';
  if (stage === 'qualified') return 'Calificado';
  if (stage === 'booked') return 'Reservado';
  if (stage === 'won') return 'Ganado';
  if (stage === 'lost') return 'Perdido';
  return cap(stage);
};

const sectionMeta = {
  leads: { label: 'Oportunidades', icon: 'BarChart3' },
  students: { label: 'Estudiantes', icon: 'Users' },
  bookings: { label: 'Reservas', icon: 'Calendar' },
  waitlist: { label: 'Lista de espera', icon: 'ListOrdered' },
  agenda: { label: 'Agenda', icon: 'CalendarDays' },
  calendar: { label: 'Calendario', icon: 'CalendarClock' },
  messages: { label: 'Mensajes', icon: 'MessageCircle' },
};
const EMPTY_SECTION_COUNTS = {
  leads: 0,
  students: 0,
  bookings: 0,
  waitlist: 0,
  agenda: 0,
  calendar: 0,
  messages: 0,
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

const toTimeValue = (value = '') => String(value).slice(0, 5);
const isQuarterHourTime = (value = '') => {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value));
  if (!match) return false;
  const minutes = Number(match[2]);
  return [0, 15, 30, 45].includes(minutes);
};
const addMinutesToTimeValue = (timeValue = '', minutesToAdd = 0) => {
  const match = /^(\d{2}):(\d{2})$/.exec(String(timeValue));
  if (!match) return '';
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const total = hours * 60 + minutes + minutesToAdd;
  if (total < 0 || total >= 24 * 60) return '';
  const targetHour = Math.floor(total / 60);
  const targetMinute = total % 60;
  return `${String(targetHour).padStart(2, '0')}:${String(targetMinute).padStart(2, '0')}`;
};
const timeToMinutes = (value = '') => {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value));
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};
const isTimeWithinRange = (timeValue, startValue, endValue) => {
  const timeMinutes = timeToMinutes(timeValue);
  const startMinutes = timeToMinutes(startValue);
  const endMinutes = timeToMinutes(endValue);
  if (timeMinutes === null || startMinutes === null || endMinutes === null) return false;
  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
};
const toNumericOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
};
const QUARTER_HOUR_OPTIONS = Array.from({ length: 24 * 4 }).map((_, index) => {
  const totalMinutes = index * 15;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});
const toIsoDateValue = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const getWeekStartMonday = (sourceDate = new Date()) => {
  const date = new Date(sourceDate);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
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
  const [isWaitlistLoading, setIsWaitlistLoading] = useState(false);
  const [isAgendaLoading, setIsAgendaLoading] = useState(false);
  const [isLessonsLoading, setIsLessonsLoading] = useState(false);
  const [isStudentUpdating, setIsStudentUpdating] = useState(false);
  const [isBookingUpdating, setIsBookingUpdating] = useState(false);
  const [isAgendaSaving, setIsAgendaSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [metrics, setMetrics] = useState(null);
  const [leads, setLeads] = useState([]);
  const [students, setStudents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [waitlistLeads, setWaitlistLeads] = useState([]);
  const [sectionCounts, setSectionCounts] = useState(EMPTY_SECTION_COUNTS);
  const [lessons, setLessons] = useState([]);
  const [availabilityRanges, setAvailabilityRanges] = useState([]);
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  const [slotBlocks, setSlotBlocks] = useState([]);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState([]);
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
  const [waitlistSearchTerm, setWaitlistSearchTerm] = useState('');
  const [waitlistStageFilter, setWaitlistStageFilter] = useState('all');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedLeadDetail, setSelectedLeadDetail] = useState(null);
  const [followUpDraft, setFollowUpDraft] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentEditorTab, setStudentEditorTab] = useState('dashboard');
  const [studentPreviewTab, setStudentPreviewTab] = useState('overview');
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
    speaking_score: '',
    listening_score: '',
    reading_score: '',
    writing_score: '',
    grammar_score: '',
    vocabulary_score: '',
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
  const [weeklyRangeDraft, setWeeklyRangeDraft] = useState({
    weekday: 0,
    start_time: '09:00',
    end_time: '12:00',
    buffer_minutes: 10,
    is_active: true,
  });
  const [punctualRangeDraft, setPunctualRangeDraft] = useState({
    date: '',
    start_time: '09:00',
    end_time: '10:00',
    status: 'unavailable',
    reason: '',
  });
  const [manualBookingDraft, setManualBookingDraft] = useState({
    student_id: '',
    lesson_id: '',
    date: '',
    time: '',
    duration_minutes: '60',
    status: 'confirmed',
    notes: '',
  });
  const [agendaWeekStart, setAgendaWeekStart] = useState(() => getWeekStartMonday(new Date()));
  const [selectedAgendaCell, setSelectedAgendaCell] = useState(null);
  const [selectedAgendaState, setSelectedAgendaState] = useState('unavailable');
  const [isAgendaDragging, setIsAgendaDragging] = useState(false);
  const [agendaDragAnchor, setAgendaDragAnchor] = useState(null);
  const [isAgendaStateModalOpen, setIsAgendaStateModalOpen] = useState(false);
  const [isManualBookingModalOpen, setIsManualBookingModalOpen] = useState(false);
  const [bookingModalError, setBookingModalError] = useState('');
  const [messageComposerDraft, setMessageComposerDraft] = useState('');
  const [messageComposerError, setMessageComposerError] = useState('');
  const [messageComposerSuccess, setMessageComposerSuccess] = useState('');
  const [isComposerSending, setIsComposerSending] = useState(false);
  const pendingReadMessagesRef = useRef(new Set());

  const refreshSectionCounts = useCallback(async (header, options = {}) => {
    if (!header) {
      setSectionCounts(EMPTY_SECTION_COUNTS);
      return;
    }

    const { silent = true } = options;
    try {
      const [leadsResult, studentsResult, bookingsResult, rangesResult, weeklyResult, waitlistResult, messagesResult] = await Promise.allSettled([
        getLeads(header, {}),
        getAdminStudents(header, {}),
        getAdminBookings(header, {}),
        getAdminAvailabilityRanges(header, { active: 'true' }),
        getAdminWeeklyAvailability(header, { active: 'true' }),
        Promise.all(WAITLIST_SOURCES.map((source) => getLeads(header, { source }))),
        getAdminMessages(header, {}),
      ]);

      const allLeads = leadsResult.status === 'fulfilled' ? leadsResult.value : leads;
      const allStudents = studentsResult.status === 'fulfilled' ? studentsResult.value : students;
      const allBookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value : bookings;
      const activeRanges = rangesResult.status === 'fulfilled' ? rangesResult.value : availabilityRanges.filter((item) => item.is_active);
      const activeWeeklySlots = weeklyResult.status === 'fulfilled' ? weeklyResult.value : weeklyAvailability;
      const waitlistGroups = waitlistResult.status === 'fulfilled' ? waitlistResult.value : [waitlistLeads];
      const allMessages = messagesResult.status === 'fulfilled' ? messagesResult.value : studentMessages;
      const unreadMessagesCount = allMessages.filter((item) => !item.is_read).length;
      setSectionCounts({
        leads: allLeads.length,
        students: allStudents.length,
        bookings: allBookings.length,
        waitlist: waitlistGroups.flat().length,
        agenda: activeRanges.length || activeWeeklySlots.filter((slot) => slot?.is_active).length,
        calendar: GOOGLE_CALENDAR_EMBED_URL ? 1 : 0,
        messages: unreadMessagesCount,
      });
    } catch (error) {
      if (!silent) {
        setErrorMessage(error?.message || 'No se pudieron actualizar los contadores de secciones.');
      }
      if ((error?.message || '').toLowerCase().includes('unauthorized')) {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthHeader('');
      }
    }
  }, [availabilityRanges, bookings, leads, studentMessages, students, waitlistLeads, weeklyAvailability]);

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

  const loadStudentsData = async (header, customFilters = null) => {
    setIsStudentsLoading(true);
    setErrorMessage('');

    try {
      const studentsData = await getAdminStudents(header, customFilters || {
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

  const loadWaitlistData = async (header) => {
    setIsWaitlistLoading(true);
    setErrorMessage('');
    try {
      const waitlistGroups = await Promise.all(WAITLIST_SOURCES.map((source) => (
        getLeads(header, { source, q: waitlistSearchTerm })
      )));
      const merged = waitlistGroups.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setWaitlistLeads(merged);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo cargar la lista de espera.');
    } finally {
      setIsWaitlistLoading(false);
    }
  };

  const loadAgendaData = async (header) => {
    setIsAgendaLoading(true);
    setErrorMessage('');
    try {
      const now = new Date();
      const startDate = toIsoDateValue(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7));
      const endDate = toIsoDateValue(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 90));
      const [rangesResult, weeklyResult, blocksResult, bookingsResult, lessonsResult, studentsResult, googleEventsResult] = await Promise.allSettled([
        getAdminAvailabilityRanges(header, {}),
        getAdminWeeklyAvailability(header, {}),
        getAdminSlotBlocks(header, { start_date: startDate, end_date: endDate }),
        getAdminBookings(header, {}),
        getAdminLessons(header),
        getAdminStudents(header, {}),
        getAdminGoogleCalendarEvents(header, { start_date: startDate, end_date: endDate }),
      ]);

      if (rangesResult.status === 'fulfilled') setAvailabilityRanges(rangesResult.value);
      if (weeklyResult.status === 'fulfilled') setWeeklyAvailability(weeklyResult.value);
      if (blocksResult.status === 'fulfilled') setSlotBlocks(blocksResult.value);
      if (bookingsResult.status === 'fulfilled') setBookings(bookingsResult.value);
      if (lessonsResult.status === 'fulfilled') setLessons(lessonsResult.value);
      if (studentsResult.status === 'fulfilled') setStudents(studentsResult.value);
      if (googleEventsResult.status === 'fulfilled') setGoogleCalendarEvents(googleEventsResult.value);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo cargar la agenda.');
    } finally {
      setIsAgendaLoading(false);
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
    setProgressDraft({
      lesson_id: '',
      completed: false,
      score: '',
      speaking_score: '',
      listening_score: '',
      reading_score: '',
      writing_score: '',
      grammar_score: '',
      vocabulary_score: '',
      notes: '',
    });
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
      speaking_score: progress.speaking_score ?? '',
      listening_score: progress.listening_score ?? '',
      reading_score: progress.reading_score ?? '',
      writing_score: progress.writing_score ?? '',
      grammar_score: progress.grammar_score ?? '',
      vocabulary_score: progress.vocabulary_score ?? '',
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

  const onCreateStudentMaterialFromPanel = async (payload) => {
    if (!authHeader || !selectedStudentId) return;
    const created = await createAdminMaterial({
      authHeader,
      payload: {
        ...payload,
        student_id: selectedStudentId,
      },
    });
    setStudentMaterials((prev) => [created, ...prev]);
    setActionToast('Material creado.');
    refreshSectionCounts(authHeader, { silent: true });
    return created;
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
        score: computedGeneralProgressScore === '' ? null : Number(computedGeneralProgressScore),
        speaking_score: progressDraft.speaking_score === '' ? null : Number(progressDraft.speaking_score),
        listening_score: progressDraft.listening_score === '' ? null : Number(progressDraft.listening_score),
        reading_score: progressDraft.reading_score === '' ? null : Number(progressDraft.reading_score),
        writing_score: progressDraft.writing_score === '' ? null : Number(progressDraft.writing_score),
        grammar_score: progressDraft.grammar_score === '' ? null : Number(progressDraft.grammar_score),
        vocabulary_score: progressDraft.vocabulary_score === '' ? null : Number(progressDraft.vocabulary_score),
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
    if (!authHeader) {
      setSectionCounts(EMPTY_SECTION_COUNTS);
      return undefined;
    }

    refreshSectionCounts(authHeader, { silent: true });
    return undefined;
  }, [authHeader, refreshSectionCounts]);

  useEffect(() => {
    if (authHeader && activeSection === 'students') {
      loadStudentsData(authHeader);
    }
  }, [authHeader, activeSection, studentSearchTerm, studentLevelFilter]);

  useEffect(() => {
    if (authHeader && activeSection === 'messages') {
      loadStudentsData(authHeader, {});
    }
  }, [authHeader, activeSection]);

  useEffect(() => {
    if (authHeader && activeSection === 'bookings') {
      loadBookingsData(authHeader);
    }
  }, [authHeader, activeSection, bookingSearchTerm, bookingStatusFilter]);

  useEffect(() => {
    if (authHeader && activeSection === 'waitlist') {
      loadWaitlistData(authHeader);
    }
  }, [authHeader, activeSection, waitlistSearchTerm]);

  useEffect(() => {
    if (authHeader && activeSection === 'agenda') {
      loadAgendaData(authHeader);
    }
  }, [authHeader, activeSection]);

  useEffect(() => {
    if (!authHeader || !['agenda', 'calendar'].includes(activeSection)) return undefined;
    const intervalId = window.setInterval(() => {
      loadAgendaData(authHeader);
    }, 60000);
    return () => window.clearInterval(intervalId);
  }, [authHeader, activeSection]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (!isAgendaDragging) return;
      setIsAgendaDragging(false);
      setAgendaDragAnchor(null);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isAgendaDragging]);

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
    if (authHeader && activeSection === 'messages' && selectedStudentId) {
      loadStudentMessages(authHeader, selectedStudentId);
      setMessageComposerError('');
      setMessageComposerSuccess('');
    }
  }, [authHeader, activeSection, selectedStudentId]);

  useEffect(() => {
    if (selectedStudentId) {
      const storedTab = sessionStorage.getItem(`${STUDENT_TAB_STORAGE_PREFIX}${selectedStudentId}`);
      const allowedTabs = new Set(['dashboard', 'profile', 'materials', 'progress']);
      setStudentEditorTab(allowedTabs.has(storedTab) ? storedTab : 'dashboard');
      setGoalStatusFilter('all');
      setMessageStatusFilter('all');
      setProgressStatusFilter('all');
      setMaterialVisibilityFilter('all');
      setPendingDeleteGoalId(null);
      setPendingDeleteMessageId(null);
      setPendingDeleteProgressId(null);
      setStudentPreviewTab('overview');
      setMessageComposerDraft('');
      setMessageComposerError('');
      setMessageComposerSuccess('');
    }
  }, [selectedStudentId]);

  useEffect(() => {
    if (!selectedStudentId) return;
    sessionStorage.setItem(`${STUDENT_TAB_STORAGE_PREFIX}${selectedStudentId}`, studentEditorTab);
  }, [selectedStudentId, studentEditorTab]);

  useEffect(() => {
    if (!selectedStudentId || !studentProgress.length) return;
    if (selectedProgressId) return;
    const latest = [...studentProgress]
      .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))[0];
    if (latest) {
      hydrateProgressDraft(latest);
    }
  }, [selectedProgressId, selectedStudentId, studentProgress]);

  const onLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const header = await loginAdminWithPassword({ identifier: username, password });
      sessionStorage.setItem(AUTH_STORAGE_KEY, header);
      setAuthHeader(header);
      setPassword('');
      setSuccessMessage('Sesión iniciada correctamente.');
    } catch (error) {
      setErrorMessage(error?.message || 'Credenciales inválidas. Revisa usuario y contraseña.');
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
    setGoogleCalendarEvents([]);
    setStudentMaterials([]);
    setStudentGoals([]);
    setStudentMessages([]);
    setStudentProgress([]);
    setSectionCounts(EMPTY_SECTION_COUNTS);
    setSelectedLeadId(null);
    setSelectedStudentId(null);
    setSelectedBookingId(null);
    resetMaterialDraft();
    resetGoalDraft();
    resetMessageDraft();
    resetProgressDraft();
    setMessageComposerDraft('');
    setMessageComposerError('');
    setMessageComposerSuccess('');
    setErrorMessage('');
    setSuccessMessage('Sesión cerrada.');
  };

  const onRefresh = () => {
    if (!authHeader) return;
    refreshSectionCounts(authHeader, { silent: false });
    if (activeSection === 'students') {
      loadStudentsData(authHeader);
      return;
    }
    if (activeSection === 'bookings') {
      loadBookingsData(authHeader);
      return;
    }
    if (activeSection === 'waitlist') {
      loadWaitlistData(authHeader);
      return;
    }
    if (activeSection === 'agenda') {
      loadAgendaData(authHeader);
      return;
    }
    if (activeSection === 'messages') {
      loadStudentsData(authHeader, {});
      if (selectedStudentId) {
        loadStudentMessages(authHeader, selectedStudentId);
      }
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
      await Promise.all([
        loadDashboardData(authHeader),
        refreshSectionCounts(authHeader, { silent: true }),
      ]);
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
      refreshSectionCounts(authHeader, { silent: true });
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
      refreshSectionCounts(authHeader, { silent: true });
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
      refreshSectionCounts(authHeader, { silent: true });
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo actualizar el estudiante.');
    } finally {
      setIsStudentUpdating(false);
    }
  };

  const onSaveStudentProfileQuick = async ({ language_level, bio }) => {
    if (!authHeader || !selectedStudentId) return;
    const updatedStudent = await updateAdminStudent({
      authHeader,
      studentId: selectedStudentId,
      patch: { language_level, bio },
    });
    setStudents((prevStudents) => prevStudents.map((student) => (
      student.id === selectedStudentId ? updatedStudent : student
    )));
    setStudentDraft((prev) => ({
      ...prev,
      language_level: updatedStudent.language_level || prev.language_level,
      bio: updatedStudent.bio || '',
    }));
    refreshSectionCounts(authHeader, { silent: true });
    return updatedStudent;
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
      refreshSectionCounts(authHeader, { silent: true });
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
  const computedGeneralProgressScore = useMemo(() => {
    const skillScores = [
      toNumericOrNull(progressDraft.speaking_score),
      toNumericOrNull(progressDraft.listening_score),
      toNumericOrNull(progressDraft.reading_score),
      toNumericOrNull(progressDraft.writing_score),
      toNumericOrNull(progressDraft.grammar_score),
      toNumericOrNull(progressDraft.vocabulary_score),
    ].filter((value) => value !== null);
    if (!skillScores.length) return '';
    const average = skillScores.reduce((sum, value) => sum + value, 0) / skillScores.length;
    return String(Math.round(average));
  }, [
    progressDraft.speaking_score,
    progressDraft.listening_score,
    progressDraft.reading_score,
    progressDraft.writing_score,
    progressDraft.grammar_score,
    progressDraft.vocabulary_score,
  ]);

  const selectedStudentBookings = useMemo(() => {
    if (!selectedStudentId) return [];
    return bookings.filter((booking) => Number(booking.student?.id) === Number(selectedStudentId));
  }, [bookings, selectedStudentId]);

  const selectedStudentUpcomingBookings = useMemo(() => {
    const now = new Date();
    return selectedStudentBookings
      .filter((item) => {
        const dt = new Date(`${item.date}T${item.time || '00:00:00'}`);
        return !Number.isNaN(dt.getTime()) && dt >= now;
      })
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00:00'}`) - new Date(`${b.date}T${b.time || '00:00:00'}`));
  }, [selectedStudentBookings]);

  const selectedStudentPastBookings = useMemo(() => {
    const now = new Date();
    return selectedStudentBookings
      .filter((item) => {
        const dt = new Date(`${item.date}T${item.time || '00:00:00'}`);
        return !Number.isNaN(dt.getTime()) && dt < now;
      })
      .sort((a, b) => new Date(`${b.date}T${b.time || '00:00:00'}`) - new Date(`${a.date}T${a.time || '00:00:00'}`));
  }, [selectedStudentBookings]);

  const selectedStudentNextBooking = useMemo(() => {
    return selectedStudentUpcomingBookings[0] || null;
  }, [selectedStudentUpcomingBookings]);

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

  const orderedConversationMessages = useMemo(() => {
    return [...studentMessages].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
  }, [studentMessages]);

  const unreadFromSelectedStudent = useMemo(() => {
    if (!selectedStudentId) return 0;
    return orderedConversationMessages.filter((message) => (
      !message.is_read && Number(message.sender?.id) === Number(selectedStudentId)
    )).length;
  }, [orderedConversationMessages, selectedStudentId]);

  const onMarkConversationMessageRead = useCallback(async (messageId) => {
    if (!authHeader || !messageId) return;
    try {
      const updated = await updateAdminMessage({
        authHeader,
        messageId,
        payload: { is_read: true },
      });
      setStudentMessages((prev) => prev.map((item) => (
        item.id === messageId ? { ...item, ...updated, is_read: true } : item
      )));
      refreshSectionCounts(authHeader, { silent: true });
    } catch (error) {
      // Keep this silent to avoid noisy alerts while browsing a thread.
    }
  }, [authHeader, refreshSectionCounts]);

  useEffect(() => {
    if (!authHeader || activeSection !== 'messages' || !selectedStudentId) return;
    orderedConversationMessages.forEach((message) => {
      const isFromSelectedStudent = Number(message.sender?.id) === Number(selectedStudentId);
      if (!isFromSelectedStudent || message.is_read) return;
      if (pendingReadMessagesRef.current.has(message.id)) return;
      pendingReadMessagesRef.current.add(message.id);
      Promise.resolve(onMarkConversationMessageRead(message.id)).finally(() => {
        pendingReadMessagesRef.current.delete(message.id);
      });
    });
  }, [activeSection, authHeader, onMarkConversationMessageRead, orderedConversationMessages, selectedStudentId]);

  const onSendConversationMessage = async () => {
    if (!authHeader || !selectedStudentId) return;
    const body = messageComposerDraft.trim();
    if (!body) return;

    setMessageComposerError('');
    setMessageComposerSuccess('');
    setIsComposerSending(true);
    try {
      const created = await createAdminMessage({
        authHeader,
        payload: {
          student_id: selectedStudentId,
          subject: 'Chat',
          body,
        },
      });
      setStudentMessages((prev) => [...prev, created]);
      setMessageComposerDraft('');
      setMessageComposerSuccess('Mensaje enviado correctamente.');
      refreshSectionCounts(authHeader, { silent: true });
    } catch (error) {
      setMessageComposerError(error?.message || 'No se pudo enviar el mensaje.');
    } finally {
      setIsComposerSending(false);
    }
  };

  const filteredWaitlistLeads = useMemo(() => {
    return waitlistLeads.filter((lead) => (
      waitlistStageFilter === 'all' || lead.stage === waitlistStageFilter
    ));
  }, [waitlistLeads, waitlistStageFilter]);

  const weeklySlotsByDay = useMemo(() => {
    return WEEKDAY_OPTIONS.map((weekday) => ({
      ...weekday,
      slots: weeklyAvailability
        .filter((slot) => Number(slot.weekday) === Number(weekday.value))
        .sort((a, b) => String(a.time).localeCompare(String(b.time))),
    }));
  }, [weeklyAvailability]);
  const agendaWeekDays = useMemo(() => {
    return WEEKDAY_OPTIONS.map((weekday, index) => {
      const date = new Date(agendaWeekStart);
      date.setDate(agendaWeekStart.getDate() + index);
      return {
        ...weekday,
        date,
        isoDate: toIsoDateValue(date),
      };
    });
  }, [agendaWeekStart]);
  const agendaWeekRangeLabel = useMemo(() => {
    if (!agendaWeekDays.length) return '';
    const start = agendaWeekDays[0]?.date;
    const end = agendaWeekDays[agendaWeekDays.length - 1]?.date;
    if (!start || !end) return '';
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }, [agendaWeekDays]);
  const agendaHourRows = useMemo(() => {
    const rows = [];
    for (let hour = 7; hour <= 21; hour += 1) {
      for (const minute of [0, 15, 30, 45]) {
        rows.push({
          key: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
          hour,
          minute,
        });
      }
    }
    return rows;
  }, []);
  const agendaWeeklyGrid = useMemo(() => {
    const bookingsByDay = bookings.reduce((acc, booking) => {
      const key = booking?.date || '';
      if (!key) return acc;
      acc[key] = acc[key] || [];
      acc[key].push(booking);
      return acc;
    }, {});

    return agendaWeekDays.map((day) => {
      const dayBookings = (bookingsByDay[day.isoDate] || []).slice().sort((a, b) => (
        String(a.time || '').localeCompare(String(b.time || ''))
      ));
      const dayGoogleEvents = googleCalendarEvents
        .filter((event) => event.start_date_local === day.isoDate && !event.is_habluj_block)
        .sort((a, b) => String(a.start_time_local || '').localeCompare(String(b.start_time_local || '')));
      const dayBlocks = slotBlocks
        .filter((block) => block.date === day.isoDate)
        .sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
      const dayRanges = availabilityRanges
        .filter((range) => Number(range.weekday) === Number(day.value) && range.is_active)
        .sort((a, b) => String(a.start_time || '').localeCompare(String(b.start_time || '')));
      const weeklySlots = weeklyAvailability
        .filter((slot) => Number(slot.weekday) === Number(day.value) && slot.is_active)
        .sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));

      const byHour = {};
      dayGoogleEvents.forEach((event) => {
        const startKey = toTimeValue(event.start_time_local || '');
        const endKey = toTimeValue(event.end_time_local || '');
        if (!startKey || !endKey) return;
        const rangeTimes = [];
        for (let current = startKey; current && current !== endKey; current = addMinutesToTimeValue(current, 15)) {
          rangeTimes.push(current);
          if (rangeTimes.length > 96) break;
        }
        if (!rangeTimes.length) return;
        rangeTimes.forEach((slotKey, slotIndex) => {
          byHour[slotKey] = byHour[slotKey] || { booking: null, hasAvailability: false, isBookingStart: false, externalEvent: null, isExternalStart: false };
          if (!byHour[slotKey].booking) {
            byHour[slotKey].externalEvent = event;
            byHour[slotKey].isExternalStart = slotIndex === 0;
          }
        });
      });
      dayBookings.forEach((booking) => {
        const startKey = toTimeValue(booking.time || '');
        if (!startKey) return;
        let durationMinutes = Number(booking?.lesson?.duration) || 60;
        if (booking?.start_time_utc && booking?.end_time_utc) {
          const startUtc = new Date(booking.start_time_utc);
          const endUtc = new Date(booking.end_time_utc);
          if (!Number.isNaN(startUtc.getTime()) && !Number.isNaN(endUtc.getTime()) && endUtc > startUtc) {
            durationMinutes = Math.round((endUtc.getTime() - startUtc.getTime()) / 60000);
          }
        }
        const slotsCount = Math.max(1, Math.ceil(durationMinutes / 15));
        for (let slotIndex = 0; slotIndex < slotsCount; slotIndex += 1) {
          const slotKey = addMinutesToTimeValue(startKey, slotIndex * 15);
          if (!slotKey) continue;
          byHour[slotKey] = byHour[slotKey] || { booking: null, hasAvailability: false, isBookingStart: false, externalEvent: null, isExternalStart: false };
          byHour[slotKey].booking = booking;
          byHour[slotKey].isBookingStart = slotIndex === 0;
        }
      });
      weeklySlots.forEach((slot) => {
        const key = toTimeValue(slot.time || '');
        if (!key) return;
        byHour[key] = byHour[key] || { booking: null, hasAvailability: false, isBookingStart: false, externalEvent: null, isExternalStart: false };
        byHour[key].hasAvailability = true;
      });
      agendaHourRows.forEach((row) => {
        const key = row.key;
        const hasRangeAvailability = dayRanges.some((range) => (
          isTimeWithinRange(key, toTimeValue(range.start_time), toTimeValue(range.end_time))
        ));
        if (hasRangeAvailability) {
          byHour[key] = byHour[key] || { booking: null, hasAvailability: false, isBookingStart: false, externalEvent: null, isExternalStart: false };
          byHour[key].hasAvailability = true;
        }
      });
      dayBlocks.forEach((block) => {
        const key = toTimeValue(block.time || '');
        if (!key) return;
        byHour[key] = byHour[key] || { booking: null, hasAvailability: false, isBookingStart: false, externalEvent: null, isExternalStart: false };
        byHour[key].hasAvailability = block.is_active === false ? true : false;
      });

      return { day, byHour, dayBookings, dayGoogleEvents, weeklySlots, dayRanges, dayBlocks };
    });
  }, [agendaHourRows, agendaWeekDays, availabilityRanges, bookings, googleCalendarEvents, slotBlocks, weeklyAvailability]);
  const agendaGridByDay = useMemo(() => {
    return agendaWeeklyGrid.reduce((acc, column) => {
      acc[column.day.isoDate] = column;
      return acc;
    }, {});
  }, [agendaWeeklyGrid]);

  const upcomingAgendaBookings = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return bookings
      .filter((booking) => booking.date >= today && booking.status !== 'cancelled')
      .sort((a, b) => {
        const aKey = `${a.date}T${a.time || '00:00:00'}`;
        const bKey = `${b.date}T${b.time || '00:00:00'}`;
        return new Date(aKey) - new Date(bKey);
      })
      .slice(0, 12);
  }, [bookings]);
  const agendaWeekStats = useMemo(() => {
    const totalCells = agendaHourRows.length * agendaWeekDays.length;
    let available = 0;
    let reserved = 0;
    agendaWeeklyGrid.forEach((column) => {
      Object.values(column.byHour).forEach((cell) => {
        if (cell?.booking || cell?.externalEvent) {
          reserved += 1;
          return;
        }
        if (cell?.hasAvailability) {
          available += 1;
        }
      });
    });
    const unavailable = Math.max(totalCells - reserved - available, 0);
    return { totalCells, available, reserved, unavailable };
  }, [agendaHourRows.length, agendaWeekDays.length, agendaWeeklyGrid]);
  const onAgendaJumpToday = () => {
    setAgendaWeekStart(getWeekStartMonday(new Date()));
  };
  const onAgendaPrevWeek = () => {
    const target = new Date(agendaWeekStart);
    target.setDate(target.getDate() - 7);
    setAgendaWeekStart(getWeekStartMonday(target));
  };
  const onAgendaNextWeek = () => {
    const target = new Date(agendaWeekStart);
    target.setDate(target.getDate() + 7);
    setAgendaWeekStart(getWeekStartMonday(target));
  };
  const buildQuarterHourRange = useCallback((startValue, endValueExclusive) => {
    const rangeTimes = [];
    for (let current = startValue; current && current !== endValueExclusive; current = addMinutesToTimeValue(current, 15)) {
      rangeTimes.push(current);
      if (rangeTimes.length > 96) break;
    }
    return rangeTimes;
  }, []);
  const buildAgendaSelection = useCallback((day, anchorTime, targetTime) => {
    const anchorMinutes = timeToMinutes(anchorTime);
    const targetMinutes = timeToMinutes(targetTime);
    if (anchorMinutes === null || targetMinutes === null) return null;

    const startTime = anchorMinutes <= targetMinutes ? anchorTime : targetTime;
    const endCellTime = anchorMinutes <= targetMinutes ? targetTime : anchorTime;
    const endTimeExclusive = addMinutesToTimeValue(endCellTime, 15);
    if (!endTimeExclusive) return null;

    const slotTimes = buildQuarterHourRange(startTime, endTimeExclusive);
    const column = agendaGridByDay[day.isoDate];
    const slotCells = slotTimes.map((timeValue) => (
      column?.byHour?.[timeValue] || { booking: null, hasAvailability: false, isBookingStart: false, externalEvent: null, isExternalStart: false }
    ));
    const bookingsInRange = slotCells
      .map((cell) => cell?.booking)
      .filter(Boolean);
    const externalEventsInRange = slotCells
      .map((cell) => cell?.externalEvent)
      .filter(Boolean);
    const hasBooking = bookingsInRange.length > 0;
    const hasExternalEvent = externalEventsInRange.length > 0;
    const hasUnavailable = slotCells.some((cell) => !cell?.booking && !cell?.hasAvailability);
    const initialState = (hasBooking || hasExternalEvent) ? 'reserved' : (hasUnavailable ? 'unavailable' : 'available');

    return {
      day,
      timeValue: startTime,
      startTime,
      endTime: endTimeExclusive,
      slotTimes,
      hasBooking,
      hasExternalEvent,
      booking: bookingsInRange[0] || null,
      externalEvent: externalEventsInRange[0] || null,
      initialState,
    };
  }, [agendaGridByDay, buildQuarterHourRange]);
  const onAgendaStartSelection = (day, timeValue) => {
    const selection = buildAgendaSelection(day, timeValue, timeValue);
    if (!selection) return;
    setAgendaDragAnchor({ dayIso: day.isoDate, timeValue });
    setIsAgendaDragging(true);
    setSelectedAgendaCell(selection);
    setSelectedAgendaState(selection.initialState);
    setPunctualRangeDraft((prev) => ({
      ...prev,
      date: day.isoDate,
      start_time: selection.startTime,
      end_time: selection.endTime,
    }));
    setIsAgendaStateModalOpen(false);
  };
  const onAgendaExtendSelection = (day, timeValue) => {
    if (!isAgendaDragging || !agendaDragAnchor) return;
    if (agendaDragAnchor.dayIso !== day.isoDate) return;
    const selection = buildAgendaSelection(day, agendaDragAnchor.timeValue, timeValue);
    if (!selection) return;
    setSelectedAgendaCell(selection);
    setSelectedAgendaState(selection.initialState);
    setPunctualRangeDraft((prev) => ({
      ...prev,
      date: day.isoDate,
      start_time: selection.startTime,
      end_time: selection.endTime,
    }));
  };
  const onAgendaFinishSelection = (day, timeValue) => {
    if (!isAgendaDragging || !agendaDragAnchor) return;
    if (agendaDragAnchor.dayIso !== day.isoDate) {
      setIsAgendaDragging(false);
      setAgendaDragAnchor(null);
      return;
    }
    const selection = buildAgendaSelection(day, agendaDragAnchor.timeValue, timeValue);
    setIsAgendaDragging(false);
    setAgendaDragAnchor(null);
    if (!selection) return;
    setSelectedAgendaCell(selection);
    setSelectedAgendaState(selection.initialState);
    setPunctualRangeDraft((prev) => ({
      ...prev,
      date: day.isoDate,
      start_time: selection.startTime,
      end_time: selection.endTime,
    }));
    setIsAgendaStateModalOpen(true);
  };
  const onOpenManualBookingModal = ({ date, time, durationMinutes }) => {
    setManualBookingDraft((prev) => ({
      ...prev,
      date: date || prev.date,
      time: time || prev.time,
      duration_minutes: durationMinutes ? String(durationMinutes) : (prev.duration_minutes || '60'),
      student_id: prev.student_id || (students[0]?.id ? String(students[0].id) : ''),
      lesson_id: prev.lesson_id || (lessons[0]?.id ? String(lessons[0].id) : ''),
    }));
    setBookingModalError('');
    setIsManualBookingModalOpen(true);
  };
  const onApplyAgendaState = async () => {
    if (!selectedAgendaCell || !authHeader) return;
    const {
      day,
      timeValue,
      startTime = timeValue,
      endTime = addMinutesToTimeValue(timeValue, 15),
      slotTimes = [timeValue],
      hasBooking,
      hasExternalEvent,
    } = selectedAgendaCell;

    if (hasExternalEvent) {
      setErrorMessage('Esta franja viene de Google Calendar. Modifícala directamente en Google y pulsa "Actualizar" en la agenda.');
      return;
    }

    if (selectedAgendaState === 'reserved') {
      onOpenManualBookingModal({
        date: day.isoDate,
        time: startTime,
        durationMinutes: Math.max(15, slotTimes.length * 15),
      });
      setIsAgendaStateModalOpen(false);
      return;
    }

    if (hasBooking) {
      setErrorMessage('Esa franja ya está reservada. Cambia la reserva desde el editor.');
      return;
    }

    const shouldBeAvailable = selectedAgendaState === 'available';
    const slotBlocksInRange = slotBlocks.filter((block) => (
      block.date === day.isoDate && slotTimes.includes(toTimeValue(block.time))
    ));
    setIsAgendaSaving(true);
    setErrorMessage('');
    try {
      if (shouldBeAvailable) {
        const byTime = new Map(slotBlocksInRange.map((block) => [toTimeValue(block.time), block]));
        const updates = [];
        const creates = [];
        slotTimes.forEach((slotTime) => {
          const existing = byTime.get(slotTime);
          if (existing?.id) {
            if (existing.is_active !== false) {
              updates.push(updateAdminSlotBlock({
                authHeader,
                blockId: existing.id,
                payload: { is_active: false, reason: existing.reason || 'Disponible puntual' },
              }));
            }
          } else {
            creates.push(createAdminSlotBlock({
              authHeader,
              payload: {
                date: day.isoDate,
                time: `${slotTime}:00`,
                reason: 'Disponible puntual',
                is_active: false,
              },
            }));
          }
        });
        const [updatedRows, createdRows] = await Promise.all([
          updates.length ? Promise.all(updates) : Promise.resolve([]),
          creates.length ? Promise.all(creates) : Promise.resolve([]),
        ]);
        if (updatedRows.length || createdRows.length) {
          const updatedById = new Map(updatedRows.filter((item) => item?.id).map((item) => [item.id, item]));
          const created = createdRows.filter((item) => item?.id);
          setSlotBlocks((prev) => {
            const next = prev.map((item) => (updatedById.has(item.id) ? updatedById.get(item.id) : item));
            return [...next, ...created.filter((item) => !next.some((existing) => existing.id === item.id))];
          });
        } else {
          setActionToast('La franja ya estaba disponible para ese día.');
        }
      } else {
        const byTime = new Map(slotBlocksInRange.map((block) => [toTimeValue(block.time), block]));
        const updates = [];
        const creates = [];
        slotTimes.forEach((slotTime) => {
          const existing = byTime.get(slotTime);
          if (existing?.id) {
            if (existing.is_active !== true) {
              updates.push(updateAdminSlotBlock({
                authHeader,
                blockId: existing.id,
                payload: { is_active: true, reason: existing.reason || 'No disponible puntual' },
              }));
            }
          } else {
            creates.push(createAdminSlotBlock({
              authHeader,
              payload: {
                date: day.isoDate,
                time: `${slotTime}:00`,
                reason: 'No disponible puntual',
                is_active: true,
              },
            }));
          }
        });
        const [updatedRows, createdRows] = await Promise.all([
          updates.length ? Promise.all(updates) : Promise.resolve([]),
          creates.length ? Promise.all(creates) : Promise.resolve([]),
        ]);
        if (updatedRows.length || createdRows.length) {
          const updatedById = new Map(updatedRows.filter((item) => item?.id).map((item) => [item.id, item]));
          const created = createdRows.filter((item) => item?.id);
          setSlotBlocks((prev) => {
            const next = prev.map((item) => (updatedById.has(item.id) ? updatedById.get(item.id) : item));
            return [...next, ...created.filter((item) => !next.some((existing) => existing.id === item.id))]
              .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
          });
        } else {
          setActionToast('La franja ya estaba no disponible para ese día.');
        }
      }

      loadAgendaData(authHeader);
      refreshSectionCounts(authHeader, { silent: true });
      setActionToast('Estado de franja actualizado.');
      setPunctualRangeDraft((prev) => ({
        ...prev,
        date: day.isoDate,
        start_time: startTime,
        end_time: endTime || prev.end_time,
      }));
      setIsAgendaStateModalOpen(false);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo actualizar la disponibilidad.');
    } finally {
      setIsAgendaSaving(false);
    }
  };

  const onCreateWeeklyRange = async () => {
    if (!authHeader) return;
    if (!isQuarterHourTime(weeklyRangeDraft.start_time) || !isQuarterHourTime(weeklyRangeDraft.end_time)) {
      setErrorMessage('Las horas deben terminar en 00, 15, 30 o 45.');
      return;
    }
    const startMinutes = timeToMinutes(weeklyRangeDraft.start_time);
    const endMinutes = timeToMinutes(weeklyRangeDraft.end_time);
    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
      setErrorMessage('La hora de fin debe ser mayor a la de inicio.');
      return;
    }
    setIsAgendaSaving(true);
    setErrorMessage('');
    try {
      const created = await createAdminAvailabilityRange({
        authHeader,
        payload: {
          weekday: Number(weeklyRangeDraft.weekday),
          start_time: `${weeklyRangeDraft.start_time}:00`,
          end_time: `${weeklyRangeDraft.end_time}:00`,
          buffer_minutes: Number(weeklyRangeDraft.buffer_minutes || 10),
          is_active: weeklyRangeDraft.is_active !== false,
        },
      });
      if (created?.id) {
        setAvailabilityRanges((prev) => [...prev, created].sort((a, b) => (
          Number(a.weekday) - Number(b.weekday) || String(a.start_time).localeCompare(String(b.start_time))
        )));
      }
      await loadAgendaData(authHeader);
      refreshSectionCounts(authHeader, { silent: true });
      setActionToast('Franja semanal guardada.');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo guardar la franja semanal.');
    } finally {
      setIsAgendaSaving(false);
    }
  };

  const onToggleWeeklyRange = async (range) => {
    if (!authHeader || !range?.id) return;
    setIsAgendaSaving(true);
    setErrorMessage('');
    try {
      const updated = await updateAdminAvailabilityRange({
        authHeader,
        rangeId: range.id,
        payload: { is_active: !range.is_active },
      });
      if (updated?.id) {
        setAvailabilityRanges((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      }
      await loadAgendaData(authHeader);
      refreshSectionCounts(authHeader, { silent: true });
      setActionToast('Franja semanal actualizada.');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo actualizar la franja semanal.');
    } finally {
      setIsAgendaSaving(false);
    }
  };

  const onDeleteWeeklyRange = async (rangeId) => {
    if (!authHeader || !rangeId) return;
    setIsAgendaSaving(true);
    setErrorMessage('');
    try {
      await deleteAdminAvailabilityRange({ authHeader, rangeId });
      setAvailabilityRanges((prev) => prev.filter((item) => item.id !== rangeId));
      await loadAgendaData(authHeader);
      refreshSectionCounts(authHeader, { silent: true });
      setActionToast('Franja semanal eliminada.');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo eliminar la franja semanal.');
    } finally {
      setIsAgendaSaving(false);
    }
  };

  const onApplyPunctualRange = async () => {
    if (!authHeader) return;
    const { date, start_time: startTime, end_time: endTime, status, reason } = punctualRangeDraft;
    if (!date || !isQuarterHourTime(startTime) || !isQuarterHourTime(endTime)) {
      setErrorMessage('Completa fecha y horas en formato de 15 minutos.');
      return;
    }
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
      setErrorMessage('La hora de fin debe ser mayor a la de inicio.');
      return;
    }

    const rangeTimes = [];
    for (let current = startTime; current && current !== endTime; current = addMinutesToTimeValue(current, 15)) {
      rangeTimes.push(current);
      if (rangeTimes.length > 96) break;
    }
    if (!rangeTimes.length) return;

    setIsAgendaSaving(true);
    setErrorMessage('');
    try {
      if (status === 'unavailable') {
        const byTime = new Map(
          slotBlocks
            .filter((block) => block.date === date)
            .map((block) => [toTimeValue(block.time), block])
        );
        const updates = [];
        const creations = [];
        rangeTimes.forEach((timeValue) => {
          const existing = byTime.get(timeValue);
          if (existing?.id) {
            if (existing.is_active !== true) {
              updates.push(updateAdminSlotBlock({
                authHeader,
                blockId: existing.id,
                payload: { is_active: true, reason: reason || existing.reason || 'No disponible puntual' },
              }));
            }
          } else {
            creations.push(createAdminSlotBlock({
              authHeader,
              payload: {
                date,
                time: `${timeValue}:00`,
                reason: reason || 'No disponible puntual',
                is_active: true,
              },
            }));
          }
        });
        const [updatedRows, createdRows] = await Promise.all([
          updates.length ? Promise.all(updates) : Promise.resolve([]),
          creations.length ? Promise.all(creations) : Promise.resolve([]),
        ]);
        if (updatedRows.length || createdRows.length) {
          const updatedById = new Map(updatedRows.filter((item) => item?.id).map((item) => [item.id, item]));
          const created = createdRows.filter((item) => item?.id);
          setSlotBlocks((prev) => {
            const next = prev.map((item) => (updatedById.has(item.id) ? updatedById.get(item.id) : item));
            return [...next, ...created.filter((item) => !next.some((existing) => existing.id === item.id))];
          });
        }
      } else {
        const byTime = new Map(
          slotBlocks
            .filter((block) => block.date === date)
            .map((block) => [toTimeValue(block.time), block])
        );
        const updates = [];
        const creations = [];
        rangeTimes.forEach((timeValue) => {
          const existing = byTime.get(timeValue);
          if (existing?.id) {
            if (existing.is_active !== false) {
              updates.push(updateAdminSlotBlock({
                authHeader,
                blockId: existing.id,
                payload: { is_active: false, reason: reason || existing.reason || 'Disponible puntual' },
              }));
            }
          } else {
            creations.push(createAdminSlotBlock({
              authHeader,
              payload: {
                date,
                time: `${timeValue}:00`,
                reason: reason || 'Disponible puntual',
                is_active: false,
              },
            }));
          }
        });
        const [updatedRows, createdRows] = await Promise.all([
          updates.length ? Promise.all(updates) : Promise.resolve([]),
          creations.length ? Promise.all(creations) : Promise.resolve([]),
        ]);
        if (updatedRows.length || createdRows.length) {
          const updatedById = new Map(updatedRows.filter((item) => item?.id).map((item) => [item.id, item]));
          const created = createdRows.filter((item) => item?.id);
          setSlotBlocks((prev) => {
            const next = prev.map((item) => (updatedById.has(item.id) ? updatedById.get(item.id) : item));
            return [...next, ...created.filter((item) => !next.some((existing) => existing.id === item.id))];
          });
        }
      }
      await loadAgendaData(authHeader);
      setActionToast('Franja puntual aplicada.');
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo aplicar la franja puntual.');
    } finally {
      setIsAgendaSaving(false);
    }
  };

  const onCreateManualBooking = async () => {
    if (!authHeader) return;
    const parsedStudentId = Number.parseInt(String(manualBookingDraft.student_id || ''), 10);
    const parsedLessonId = Number.parseInt(String(manualBookingDraft.lesson_id || ''), 10);

    if (!manualBookingDraft.student_id || !Number.isFinite(parsedStudentId) || parsedStudentId <= 0) {
      setBookingModalError('Selecciona un alumno para la reserva.');
      return;
    }
    if (!manualBookingDraft.lesson_id || !Number.isFinite(parsedLessonId) || parsedLessonId <= 0) {
      setBookingModalError('Selecciona una clase para la reserva.');
      return;
    }
    if (!manualBookingDraft.date) {
      setBookingModalError('Selecciona una fecha para la reserva.');
      return;
    }
    if (!manualBookingDraft.time) {
      setBookingModalError('Selecciona una hora para la reserva.');
      return;
    }
    if (!isQuarterHourTime(manualBookingDraft.time)) {
      setErrorMessage('La hora de reserva debe terminar en 00, 15, 30 o 45.');
      setBookingModalError('La hora debe terminar en 00, 15, 30 o 45.');
      return;
    }
    const parsedDuration = Number.parseInt(String(manualBookingDraft.duration_minutes || ''), 10);
    if (!Number.isFinite(parsedDuration) || parsedDuration < 15 || parsedDuration > 240 || parsedDuration % 15 !== 0) {
      setBookingModalError('La duración debe estar entre 15 y 240 minutos, en tramos de 15.');
      return;
    }
    setBookingModalError('');
    const payload = {
      student_id: parsedStudentId,
      lesson_id: parsedLessonId,
      date: manualBookingDraft.date,
      time: `${manualBookingDraft.time}:00`,
      duration_minutes: parsedDuration,
      status: manualBookingDraft.status,
      notes: manualBookingDraft.notes,
    };
    setIsAgendaSaving(true);
    setErrorMessage('');
    try {
      await createAdminBooking({ authHeader, payload });
      setManualBookingDraft({
        student_id: '',
        lesson_id: '',
        date: '',
        time: '',
        duration_minutes: '60',
        status: 'confirmed',
        notes: '',
      });
      setIsManualBookingModalOpen(false);
      await loadAgendaData(authHeader);
      refreshSectionCounts(authHeader, { silent: true });
      setActionToast('Reserva manual creada.');
    } catch (error) {
      const message = error?.message || 'No se pudo crear la reserva manual.';
      setErrorMessage(message);
      setBookingModalError(message);
    } finally {
      setIsAgendaSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
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
                  aria-label={sectionMeta[section].label}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2 ${activeSection === section ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-foreground hover:bg-muted/60'}`}
                  onClick={() => {
                    if (authHeader) {
                      refreshSectionCounts(authHeader, { silent: true });
                    }
                    setActiveSection(section);
                  }}
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
                      <span className="text-muted-foreground">{stageLabel(stage)}</span>
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
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Seguimiento</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Duplicado</th>
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
                                <option key={`${lead.id}-${stage}`} value={stage}>{stageLabel(stage)}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">{formatDate(lead.created_at)}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{formatDate(lead.follow_up_at)}</td>
                          <td className="px-4 py-3 text-sm">
                            {lead.duplicate_of ? (
                              <span className="inline-flex items-center rounded-full bg-warning/15 px-2 py-1 text-xs font-semibold text-warning">
                                {lead.duplicate_confidence || 'posible'}
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
                            No hay oportunidades para los filtros seleccionados.
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
                      <p><span className="text-muted-foreground">Estado:</span> <span className="font-medium text-foreground">{stageLabel(selectedLeadDetail?.stage || selectedLead.stage)}</span></p>
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
              <div className="xl:order-2 xl:col-span-4 bg-white border border-border rounded-xl shadow-soft overflow-hidden">
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
                      {students.map((student) => {
                        const isSelectedStudent = selectedStudentId === student.id;
                        return (
                        <tr
                          key={student.id}
                          className={`border-t border-border align-top cursor-pointer transition-colors ${
                            isSelectedStudent ? 'bg-primary/25 border-y-2 border-primary shadow-[inset_0_0_0_1px_rgba(196,98,45,0.35)]' : 'hover:bg-muted/30'
                          }`}
                          onClick={() => hydrateStudentDraft(student)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              hydrateStudentDraft(student);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Seleccionar estudiante ${student.username || student.email || student.id}`}
                        >
                          <td className="px-4 py-3 text-sm text-foreground">
                            <div className="flex items-center gap-2">
                              {isSelectedStudent && (
                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                              )}
                              <span className={isSelectedStudent ? 'font-semibold' : ''}>{student.username || '-'}</span>
                            </div>
                          </td>
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
                            <Button
                              variant={isSelectedStudent ? 'default' : 'outline'}
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                hydrateStudentDraft(student);
                              }}
                            >
                              {isSelectedStudent ? 'Seleccionado ✓' : 'Seleccionar'}
                            </Button>
                          </td>
                        </tr>
                        );
                      })}

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

              <aside className="xl:order-1 xl:col-span-8 bg-white border border-border rounded-xl p-5 shadow-soft space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Editor de estudiante</h3>

                {!selectedStudent && (
                  <p className="text-sm text-muted-foreground">Selecciona un estudiante para editar su perfil.</p>
                )}

                {selectedStudent && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-md border border-border p-2">
                        <p className="text-xs text-muted-foreground">Clases próximas</p>
                        <p className="text-base font-semibold text-foreground">{selectedStudentUpcomingBookings.length}</p>
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
                        { id: 'dashboard', label: 'Vista alumno', icon: 'LayoutDashboard' },
                        { id: 'profile', label: 'Perfil', icon: 'User' },
                        { id: 'materials', label: 'Materiales', icon: 'FileText' },
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

                    {studentEditorTab === 'dashboard' && (
                      <div className="space-y-4">
                        <div className="border-b border-border">
                          <nav className="-mb-px flex flex-wrap gap-4">
                            {[
                              { id: 'overview', label: 'Resumen', icon: 'LayoutDashboard' },
                              { id: 'lessons', label: 'Clases', icon: 'BookOpen' },
                              { id: 'progress', label: 'Progreso', icon: 'TrendingUp' },
                              { id: 'resources', label: 'Recursos', icon: 'FileText' },
                              { id: 'payments', label: 'Pagos', icon: 'CreditCard' },
                            ].map((tab) => (
                              <button
                                key={`student-preview-${tab.id}`}
                                type="button"
                                onClick={() => setStudentPreviewTab(tab.id)}
                                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                                  studentPreviewTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                                }`}
                              >
                                <Icon name={tab.icon} size={14} />
                                <span>{tab.label}</span>
                              </button>
                            ))}
                          </nav>
                        </div>

                        {studentPreviewTab === 'overview' && (
                          <div className="space-y-4">
                            <div className="bg-gradient-cultural rounded-lg p-5 text-white">
                              <h4 className="text-xl font-headlines font-semibold">
                                Vista de alumno: {`${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`.trim() || selectedStudent.username || '-'}
                              </h4>
                              <p className="text-white/90 text-sm mt-1">
                                Esta sección replica el dashboard de alumno (sin mensajes) con datos en tiempo real.
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="bg-white rounded-lg border border-border p-4">
                                <p className="text-sm text-muted-foreground">Total clases</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{selectedStudentBookings.length}</p>
                              </div>
                              <div className="bg-white rounded-lg border border-border p-4">
                                <p className="text-sm text-muted-foreground">Horas completadas</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{selectedStudentPastBookings.length}</p>
                              </div>
                              <div className="bg-white rounded-lg border border-border p-4">
                                <p className="text-sm text-muted-foreground">Nivel</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{selectedStudent.language_level || '-'}</p>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg border border-border p-4">
                              <h5 className="text-sm font-semibold text-foreground mb-2">Próxima clase</h5>
                              {selectedStudentNextBooking ? (
                                <p className="text-sm text-foreground">
                                  {selectedStudentNextBooking.lesson?.title || 'Clase'} · {selectedStudentNextBooking.date} {toTimeValue(selectedStudentNextBooking.time)}
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground">Sin clases próximas.</p>
                              )}
                            </div>
                          </div>
                        )}

                        {studentPreviewTab === 'lessons' && (
                          <StudentLessonsPanel
                            upcomingBookings={selectedStudentUpcomingBookings}
                            pastBookings={selectedStudentPastBookings}
                            isLoading={isBookingsLoading}
                            error={errorMessage}
                            onCancelBooking={(bookingId) => onUpdateBookingStatus(bookingId, 'cancelled')}
                            actionLoadingBookingId={null}
                            language="es"
                          />
                        )}

                        {studentPreviewTab === 'progress' && (
                          <div className="space-y-4">
                            <ProgressChart language="es" progressRecords={studentProgress} error="" />
                            <p className="text-sm text-muted-foreground">
                              Esta es la visión del alumno: solo lectura.
                            </p>
                          </div>
                        )}

                        {studentPreviewTab === 'resources' && (
                          <StudentResourcesPanel
                            materials={studentMaterials}
                            isLoading={isStudentMaterialsLoading}
                            error={errorMessage}
                            language="es"
                            bookings={selectedStudentBookings}
                            onCreateMaterial={onCreateStudentMaterialFromPanel}
                            isCreatingMaterial={isMaterialCreating}
                            createError=""
                          />
                        )}

                        {studentPreviewTab === 'payments' && (
                          <PaymentHistory language="es" bookings={selectedStudentBookings} />
                        )}
                      </div>
                    )}

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

                    {studentEditorTab === 'progress' && (
                      <div className="space-y-4">
                        <ProgressChart language="es" progressRecords={studentProgress} error="" />
                        <div className="bg-white rounded-lg border border-border p-4 space-y-3">
                          <h5 className="text-sm font-semibold text-foreground">Actualizar progreso (Ester)</h5>
                          <div className="grid md:grid-cols-3 gap-3">
                            <Input type="number" label="Speaking" value={progressDraft.speaking_score} onChange={(event) => setProgressDraft((prev) => ({ ...prev, speaking_score: event.target.value }))} />
                            <Input type="number" label="Listening" value={progressDraft.listening_score} onChange={(event) => setProgressDraft((prev) => ({ ...prev, listening_score: event.target.value }))} />
                            <Input type="number" label="Reading" value={progressDraft.reading_score} onChange={(event) => setProgressDraft((prev) => ({ ...prev, reading_score: event.target.value }))} />
                            <Input type="number" label="Writing" value={progressDraft.writing_score} onChange={(event) => setProgressDraft((prev) => ({ ...prev, writing_score: event.target.value }))} />
                            <Input type="number" label="Grammar" value={progressDraft.grammar_score} onChange={(event) => setProgressDraft((prev) => ({ ...prev, grammar_score: event.target.value }))} />
                            <Input type="number" label="Vocabulary" value={progressDraft.vocabulary_score} onChange={(event) => setProgressDraft((prev) => ({ ...prev, vocabulary_score: event.target.value }))} />
                          </div>
                          <Input type="number" label="Score general (media automática)" value={computedGeneralProgressScore} disabled />
                          <p className="text-xs text-muted-foreground">
                            Se calcula automáticamente como la media de Speaking, Listening, Reading, Writing, Grammar y Vocabulary.
                          </p>
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
                            Progreso completado
                          </label>
                          <div className="flex items-center gap-2">
                            <Button onClick={onSaveProgress} disabled={isProgressSaving}>
                              {isProgressSaving ? 'Guardando...' : 'Guardar progreso'}
                            </Button>
                            <Button variant="outline" onClick={resetProgressDraft} disabled={isProgressSaving}>
                              Limpiar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </aside>
            </div>
          </section>
        )}

        {authHeader && activeSection === 'messages' && (
          <section className="space-y-4">
            <div className="grid xl:grid-cols-12 gap-4">
              <div className="xl:col-span-8 bg-white border border-border rounded-xl shadow-soft p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-headlines font-semibold text-foreground">Chat con estudiante</h3>
                    <p className="text-sm text-muted-foreground">Vista de conversación en tiempo real.</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    No leídos del alumno: {unreadFromSelectedStudent}
                  </span>
                </div>

                {!selectedStudent && (
                  <div className="rounded-md border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                    Selecciona un alumno en la columna derecha para abrir su conversación.
                  </div>
                )}

                {selectedStudent && (
                  <>
                    <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-foreground">
                      <p className="font-medium">{`${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`.trim() || selectedStudent.username || '-'}</p>
                      <p className="text-xs text-muted-foreground">{selectedStudent.email || '-'}</p>
                    </div>

                    <div className="h-[440px] overflow-y-auto rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                      {isStudentMessagesLoading && (
                        <p className="text-sm text-muted-foreground">Cargando mensajes...</p>
                      )}
                      {!isStudentMessagesLoading && orderedConversationMessages.length === 0 && (
                        <p className="text-sm text-muted-foreground">Todavía no hay mensajes en esta conversación.</p>
                      )}
                      {orderedConversationMessages.map((message) => {
                        const isFromStudent = Number(message.sender?.id) === Number(selectedStudentId);
                        return (
                          <div
                            key={`thread-message-${message.id}`}
                            className={`max-w-[85%] rounded-2xl border px-3 py-2 text-sm ${
                              isFromStudent ? 'mr-auto border-border bg-white' : 'ml-auto border-primary/30 bg-primary/10'
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-foreground">{message.body}</p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {message.sender?.username || 'Sistema'} · {formatDate(message.created_at)}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {(messageComposerError || messageComposerSuccess) && (
                      <div className="space-y-1">
                        {messageComposerError && <p className="text-sm text-error">{messageComposerError}</p>}
                        {messageComposerSuccess && <p className="text-sm text-success">{messageComposerSuccess}</p>}
                      </div>
                    )}

                    <div className="space-y-2">
                      <textarea
                        value={messageComposerDraft}
                        onChange={(event) => setMessageComposerDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            onSendConversationMessage();
                          }
                        }}
                        placeholder="Escribe un mensaje..."
                        rows={4}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          iconName="Send"
                          onClick={onSendConversationMessage}
                          disabled={!messageComposerDraft.trim() || isComposerSending}
                        >
                          {isComposerSending ? 'Enviando...' : 'Enviar'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setMessageComposerDraft('');
                            setMessageComposerError('');
                            setMessageComposerSuccess('');
                          }}
                          disabled={isComposerSending}
                        >
                          Limpiar
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <aside className="xl:col-span-4 bg-white border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">Alumnos</p>
                </div>
                <div className="max-h-[700px] overflow-y-auto divide-y divide-border">
                  {isStudentsLoading && (
                    <p className="px-4 py-6 text-sm text-muted-foreground">Cargando alumnos...</p>
                  )}
                  {!isStudentsLoading && students.length === 0 && (
                    <p className="px-4 py-6 text-sm text-muted-foreground">No hay alumnos disponibles.</p>
                  )}
                  {students.map((student) => {
                    const isSelected = Number(student.id) === Number(selectedStudentId);
                    return (
                      <button
                        key={`thread-student-${student.id}`}
                        type="button"
                        onClick={() => hydrateStudentDraft(student)}
                        className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/30 ${
                          isSelected ? 'bg-primary/10' : 'bg-white'
                        }`}
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {`${student.first_name || ''} ${student.last_name || ''}`.trim() || student.username || '-'}
                        </p>
                        <p className="text-xs text-muted-foreground">{student.email || '-'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reservas: {student.booking_count ?? 0} · Próximas: {student.upcoming_bookings ?? 0}
                        </p>
                      </button>
                    );
                  })}
                </div>
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
                            Restablecer
                      </Button>
                    </div>
                  </>
                )}
              </aside>
            </div>
          </section>
        )}

        {authHeader && activeSection === 'waitlist' && (
          <section className="space-y-4">
            <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
                <Input
                  label="Buscar en lista de espera"
                  value={waitlistSearchTerm}
                  onChange={(event) => setWaitlistSearchTerm(event.target.value)}
                  placeholder="Nombre, email o teléfono"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Estado</label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={waitlistStageFilter}
                    onChange={(event) => setWaitlistStageFilter(event.target.value)}
                  >
                    <option value="all">Todos</option>
                    {STAGE_OPTIONS.map((stage) => (
                      <option key={`waitlist-stage-${stage}`} value={stage}>{stageLabel(stage)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-xl shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead className="bg-muted/40 text-left">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Persona</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contacto</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Creado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWaitlistLeads.map((lead) => (
                      <tr key={`waitlist-${lead.id}`} className="border-t border-border align-top">
                        <td className="px-4 py-3 text-sm text-foreground">{lead.full_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          <p>{lead.email || '-'}</p>
                          <p className="text-xs text-muted-foreground">{lead.phone || '-'}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {lead.source === 'waitlist_small_group' ? 'Grupo reducido' : 'Intensivo'}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={lead.stage || 'new'}
                            onChange={(event) => onChangeStage(lead.id, event.target.value)}
                            disabled={isStageUpdating === String(lead.id)}
                          >
                            {STAGE_OPTIONS.map((stage) => (
                              <option key={`waitlist-row-${lead.id}-${stage}`} value={stage}>{stageLabel(stage)}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{formatDate(lead.created_at)}</td>
                      </tr>
                    ))}

                    {!isWaitlistLoading && filteredWaitlistLeads.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                          No hay personas en lista de espera para los filtros actuales.
                        </td>
                      </tr>
                    )}

                    {isWaitlistLoading && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                          Cargando lista de espera...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {authHeader && activeSection === 'agenda' && (
          <section className="space-y-4">
            <div className="bg-white border border-border rounded-xl shadow-soft overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-slate-50 to-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-foreground">Agenda semanal</p>
                  <p className="text-xs text-muted-foreground">Vista calendario editable: Disponible, No disponible o Reserva.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={onAgendaPrevWeek}>
                    <span className="inline-flex items-center gap-1"><Icon name="ChevronLeft" size={14} /> Semana anterior</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={onAgendaJumpToday}>
                    <span className="inline-flex items-center gap-1"><Icon name="Calendar" size={14} /> Hoy</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={onAgendaNextWeek}>
                    <span className="inline-flex items-center gap-1">Semana siguiente <Icon name="ChevronRight" size={14} /></span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!authHeader) return;
                      loadAgendaData(authHeader);
                    }}
                  >
                    <span className="inline-flex items-center gap-1"><Icon name="RefreshCw" size={14} /> Sincronizar Google</span>
                  </Button>
                </div>
              </div>
              <div className="px-5 py-3 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{agendaWeekRangeLabel}</p>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-1 font-semibold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Disponible
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    No disponible
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2 py-1 font-semibold text-red-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Reserva
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-blue-50 px-2 py-1 font-semibold text-blue-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Google Calendar
                  </span>
                </div>
              </div>
              <div className="overflow-auto max-h-[72vh]">
                <table className="w-full min-w-[1080px] border-collapse">
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-slate-50/95 backdrop-blur">
                      <th className="sticky left-0 z-30 w-24 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border bg-slate-50/95">Hora</th>
                      {agendaWeekDays.map((day) => (
                        <th key={`agenda-head-${day.isoDate}`} className="px-3 py-2 text-left border-b border-border min-w-[142px]">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{day.label}</p>
                          <p className="text-sm font-semibold text-foreground">{day.date.getDate()}/{day.date.getMonth() + 1}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agendaHourRows.map((row, rowIndex) => (
                      <tr key={`agenda-hour-${row.key}`} className="align-top">
                        <td className="sticky left-0 z-10 px-3 py-2 text-xs text-muted-foreground border-b border-border bg-slate-50">{row.key}</td>
                        {agendaWeeklyGrid.map((column) => {
                          const cell = column.byHour[row.key] || { booking: null, hasAvailability: false, isBookingStart: false, externalEvent: null, isExternalStart: false };
                          const hasBooking = !!cell.booking;
                          const hasExternalEvent = !!cell.externalEvent;
                          const hasAvailability = !!cell.hasAvailability;
                          const previousRow = rowIndex > 0 ? agendaHourRows[rowIndex - 1] : null;
                          const nextRow = rowIndex < agendaHourRows.length - 1 ? agendaHourRows[rowIndex + 1] : null;
                          const previousCell = previousRow ? column.byHour[previousRow.key] : null;
                          const nextCell = nextRow ? column.byHour[nextRow.key] : null;
                          const continuesFromPrev = !!(
                            hasBooking
                            && previousCell?.booking
                            && previousCell.booking.id === cell.booking.id
                          );
                          const continuesToNext = !!(
                            hasBooking
                            && nextCell?.booking
                            && nextCell.booking.id === cell.booking.id
                          );
                          const isSelected = selectedAgendaCell
                            && selectedAgendaCell.day?.isoDate === column.day.isoDate
                            && (
                              selectedAgendaCell.slotTimes?.includes(row.key)
                              || selectedAgendaCell.timeValue === row.key
                            );
                          const toneClass = hasBooking
                            ? `border-l-4 border-red-500 bg-red-50 text-red-700 ${continuesFromPrev ? 'border-t-0 rounded-t-none -mt-px' : 'rounded-t-md'} ${continuesToNext ? 'rounded-b-none' : 'rounded-b-md'}`
                            : hasExternalEvent
                              ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700 rounded-md'
                            : hasAvailability
                              ? 'border-l-4 border-success bg-success/5'
                              : 'border-l-4 border-slate-200 bg-white';
                          return (
                            <td
                              key={`agenda-cell-${column.day.isoDate}-${row.key}`}
                              className={`border-b ${hasBooking && continuesToNext ? 'border-b-transparent p-0' : 'border-border p-1'}`}
                            >
                              <button
                                type="button"
                                className={`w-full min-h-[58px] rounded-md border border-transparent px-2.5 py-2 text-left transition-all hover:shadow-sm hover:bg-muted/30 ${toneClass} ${isSelected ? 'ring-2 ring-primary/50 border-primary/40' : ''}`}
                                onMouseDown={() => onAgendaStartSelection(column.day, row.key)}
                                onMouseEnter={() => onAgendaExtendSelection(column.day, row.key)}
                                onMouseUp={() => onAgendaFinishSelection(column.day, row.key)}
                                disabled={isAgendaSaving}
                              >
                                {hasBooking && (
                                  <>
                                    {cell.isBookingStart ? (
                                      <>
                                        <p className="text-[10px] uppercase tracking-wide text-red-600 font-semibold">Reserva</p>
                                        <p className="text-xs font-semibold text-red-700 truncate">{cell.booking.student?.username || 'Alumno'}</p>
                                        <p className="text-[11px] text-red-600/80 truncate">
                                          {row.key} - {addMinutesToTimeValue(row.key, 60) || ''}
                                        </p>
                                      </>
                                    ) : (
                                      <p className="text-[11px] font-semibold text-red-600">Reserva (misma franja)</p>
                                    )}
                                  </>
                                )}
                                {!hasBooking && hasExternalEvent && (
                                  <>
                                    {cell.isExternalStart ? (
                                      <>
                                        <p className="text-[10px] uppercase tracking-wide text-blue-700 font-semibold">Google Calendar</p>
                                        <p className="text-xs font-semibold text-blue-800 truncate">{cell.externalEvent.summary || 'Evento externo'}</p>
                                      </>
                                    ) : (
                                      <p className="text-[11px] font-semibold text-blue-700">Evento (misma franja)</p>
                                    )}
                                  </>
                                )}
                                {!hasBooking && !hasExternalEvent && hasAvailability && (
                                  <>
                                    <p className="text-[10px] uppercase tracking-wide text-success font-semibold">Disponible</p>
                                    <p className="text-[11px] text-muted-foreground">Click para cambiar estado</p>
                                  </>
                                )}
                                {!hasBooking && !hasExternalEvent && !hasAvailability && (
                                  <>
                                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">No disponible</p>
                                    <p className="text-[11px] text-muted-foreground">Click para cambiar estado</p>
                                  </>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-4 border-t border-border bg-muted/10">
                <div className="grid md:grid-cols-[1fr_auto_auto] gap-3 items-end">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Franja seleccionada</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedAgendaCell
                        ? `${selectedAgendaCell.day.label} ${selectedAgendaCell.day.isoDate} ${selectedAgendaCell.startTime || selectedAgendaCell.timeValue} - ${selectedAgendaCell.endTime || addMinutesToTimeValue(selectedAgendaCell.timeValue, 15)}`
                        : 'Selecciona o arrastra una franja de la agenda'}
                    </p>
                    {selectedAgendaCell?.hasExternalEvent && (
                      <p className="mt-1 text-xs text-blue-700">
                        Evento externo detectado. Esta franja se edita directamente en Google Calendar.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Estado</label>
                    <select
                      className="flex h-11 w-full min-w-56 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedAgendaState}
                      onChange={(event) => setSelectedAgendaState(event.target.value)}
                      disabled={!selectedAgendaCell || selectedAgendaCell?.hasExternalEvent}
                    >
                      <option value="reserved">Reserva</option>
                      <option value="available">Disponible</option>
                      <option value="unavailable">No disponible</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {selectedAgendaCell?.hasExternalEvent && selectedAgendaCell?.externalEvent?.html_link && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedAgendaCell.externalEvent.html_link, '_blank', 'noopener,noreferrer')}
                      >
                        Abrir evento en Google
                      </Button>
                    )}
                    {selectedAgendaCell?.hasExternalEvent && GOOGLE_CALENDAR_PUBLIC_URL && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(GOOGLE_CALENDAR_PUBLIC_URL, '_blank', 'noopener,noreferrer')}
                      >
                        Abrir calendario editable
                      </Button>
                    )}
                    <Button onClick={onApplyAgendaState} disabled={!selectedAgendaCell || isAgendaSaving || selectedAgendaCell?.hasExternalEvent}>
                      Aplicar estado
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">Disponibles (semana visible)</p>
                <p className="text-3xl font-bold text-foreground mt-2">{agendaWeekStats.available}</p>
              </div>
              <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">No disponibles (semana visible)</p>
                <p className="text-3xl font-bold text-foreground mt-2">{agendaWeekStats.unavailable}</p>
              </div>
              <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">Reservas (semana visible)</p>
                <p className="text-3xl font-bold text-foreground mt-2">{agendaWeekStats.reserved}</p>
              </div>
            </div>

            <div className="grid xl:grid-cols-12 gap-4">
              <div className="xl:col-span-5 space-y-4">
                <div className="bg-white border border-border rounded-xl p-5 shadow-soft space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Horario semanal por franjas</h3>
                  <p className="text-xs text-muted-foreground">Configura rangos (inicio-fin) que se repiten cada semana.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Día</label>
                      <select
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={weeklyRangeDraft.weekday}
                        onChange={(event) => setWeeklyRangeDraft((prev) => ({ ...prev, weekday: Number(event.target.value) }))}
                      >
                        {WEEKDAY_OPTIONS.map((day) => (
                          <option key={`weekly-day-${day.value}`} value={day.value}>{day.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Inicio</label>
                      <select
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={weeklyRangeDraft.start_time}
                        onChange={(event) => setWeeklyRangeDraft((prev) => ({ ...prev, start_time: event.target.value }))}
                      >
                        {QUARTER_HOUR_OPTIONS.map((timeOption) => (
                          <option key={`weekly-start-${timeOption}`} value={timeOption}>{timeOption}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Fin</label>
                      <select
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={weeklyRangeDraft.end_time}
                        onChange={(event) => setWeeklyRangeDraft((prev) => ({ ...prev, end_time: event.target.value }))}
                      >
                        {QUARTER_HOUR_OPTIONS.map((timeOption) => (
                          <option key={`weekly-end-${timeOption}`} value={timeOption}>{timeOption}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Buffer (min)</label>
                      <select
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={weeklyRangeDraft.buffer_minutes}
                        onChange={(event) => setWeeklyRangeDraft((prev) => ({ ...prev, buffer_minutes: Number(event.target.value) }))}
                      >
                        {[0, 5, 10, 15].map((bufferOption) => (
                          <option key={`weekly-buffer-${bufferOption}`} value={bufferOption}>{bufferOption}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button onClick={onCreateWeeklyRange} disabled={isAgendaSaving || !weeklyRangeDraft.start_time || !weeklyRangeDraft.end_time}>
                    Guardar franja semanal
                  </Button>

                  <div className="max-h-80 overflow-y-auto space-y-3 border border-border rounded-md p-3">
                    {weeklySlotsByDay.map((day) => (
                      <div key={`weekly-group-${day.value}`}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{day.label}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {availabilityRanges.filter((range) => Number(range.weekday) === Number(day.value)).length === 0 && (
                            <span className="text-xs text-muted-foreground">Sin franjas</span>
                          )}
                          {availabilityRanges
                            .filter((range) => Number(range.weekday) === Number(day.value))
                            .map((range) => (
                              <div key={`weekly-range-${range.id}`} className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold border ${range.is_active ? 'border-success/30 bg-success/10 text-success' : 'border-muted bg-muted text-muted-foreground'}`}>
                                <button
                                  type="button"
                                  onClick={() => onToggleWeeklyRange(range)}
                                  disabled={isAgendaSaving}
                                  className="hover:underline"
                                >
                                  {toTimeValue(range.start_time)} - {toTimeValue(range.end_time)} ({range.buffer_minutes || 0}m)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteWeeklyRange(range.id)}
                                  disabled={isAgendaSaving}
                                  className="text-error hover:underline"
                                >
                                  x
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-border rounded-xl p-5 shadow-soft space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Franja puntual por fecha</h3>
                  <p className="text-xs text-muted-foreground">Aplica disponibilidad/no disponibilidad solo para un día concreto.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Fecha"
                      type="date"
                      value={punctualRangeDraft.date}
                      onChange={(event) => setPunctualRangeDraft((prev) => ({ ...prev, date: event.target.value }))}
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Estado</label>
                      <select
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={punctualRangeDraft.status}
                        onChange={(event) => setPunctualRangeDraft((prev) => ({ ...prev, status: event.target.value }))}
                      >
                        <option value="unavailable">No disponible</option>
                        <option value="available">Disponible</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Inicio</label>
                      <select
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={punctualRangeDraft.start_time}
                        onChange={(event) => setPunctualRangeDraft((prev) => ({ ...prev, start_time: event.target.value }))}
                      >
                        {QUARTER_HOUR_OPTIONS.map((timeOption) => (
                          <option key={`punctual-start-${timeOption}`} value={timeOption}>{timeOption}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Fin</label>
                      <select
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={punctualRangeDraft.end_time}
                        onChange={(event) => setPunctualRangeDraft((prev) => ({ ...prev, end_time: event.target.value }))}
                      >
                        {QUARTER_HOUR_OPTIONS.map((timeOption) => (
                          <option key={`punctual-end-${timeOption}`} value={timeOption}>{timeOption}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium text-foreground">Motivo (opcional)</label>
                      <input
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={punctualRangeDraft.reason}
                        onChange={(event) => setPunctualRangeDraft((prev) => ({ ...prev, reason: event.target.value }))}
                        placeholder="Vacaciones, evento, ajuste..."
                      />
                    </div>
                  </div>
                  <Button onClick={onApplyPunctualRange} disabled={isAgendaSaving || !punctualRangeDraft.date}>
                    Aplicar franja puntual
                  </Button>
                </div>

              </div>

              <div className="xl:col-span-7 space-y-4">
                <div className="bg-white border border-border rounded-xl p-5 shadow-soft space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Reserva manual</h3>
                  <p className="text-xs text-muted-foreground">Tip: al pulsar una hora en la agenda, fecha y hora se rellenan automáticamente.</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Alumno</label>
                      <select
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={manualBookingDraft.student_id}
                        onChange={(event) => setManualBookingDraft((prev) => ({ ...prev, student_id: event.target.value }))}
                      >
                        <option value="">Seleccionar alumno</option>
                        {students.map((student) => (
                          <option key={`manual-student-${student.id}`} value={student.id}>
                            {student.first_name || student.username} {student.last_name || ''} ({student.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Clase</label>
                      <select
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={manualBookingDraft.lesson_id}
                        onChange={(event) => {
                          const lessonId = event.target.value;
                          const lesson = lessons.find((item) => String(item.id) === String(lessonId));
                          setManualBookingDraft((prev) => ({
                            ...prev,
                            lesson_id: lessonId,
                            duration_minutes: lesson?.duration ? String(lesson.duration) : prev.duration_minutes,
                          }));
                        }}
                      >
                        <option value="">Seleccionar clase</option>
                        {lessons.map((lesson) => (
                          <option key={`manual-lesson-${lesson.id}`} value={lesson.id}>{lesson.title}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Fecha"
                      type="date"
                      value={manualBookingDraft.date}
                      onChange={(event) => setManualBookingDraft((prev) => ({ ...prev, date: event.target.value }))}
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Hora</label>
                      <select
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={manualBookingDraft.time}
                        onChange={(event) => setManualBookingDraft((prev) => ({ ...prev, time: event.target.value }))}
                      >
                        <option value="">Seleccionar hora</option>
                        {QUARTER_HOUR_OPTIONS.map((timeOption) => (
                          <option key={`manual-time-${timeOption}`} value={timeOption}>{timeOption}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Duración</label>
                      <select
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={manualBookingDraft.duration_minutes}
                        onChange={(event) => setManualBookingDraft((prev) => ({ ...prev, duration_minutes: event.target.value }))}
                      >
                        {Array.from({ length: 16 }).map((_, idx) => {
                          const minutes = (idx + 1) * 15;
                          return (
                            <option key={`manual-duration-${minutes}`} value={String(minutes)}>
                              {minutes} min
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Estado</label>
                      <select
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={manualBookingDraft.status}
                        onChange={(event) => setManualBookingDraft((prev) => ({ ...prev, status: event.target.value }))}
                      >
                        {BOOKING_STATUS_OPTIONS.map((statusOption) => (
                          <option key={`manual-status-${statusOption}`} value={statusOption}>{statusLabel(statusOption)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Notas</label>
                      <textarea
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        rows={3}
                        value={manualBookingDraft.notes}
                        onChange={(event) => setManualBookingDraft((prev) => ({ ...prev, notes: event.target.value }))}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={onCreateManualBooking}
                    disabled={isAgendaSaving || !manualBookingDraft.student_id || !manualBookingDraft.lesson_id || !manualBookingDraft.date || !manualBookingDraft.time}
                  >
                    Crear reserva manual
                  </Button>
                </div>

                <div className="bg-white border border-border rounded-xl shadow-soft overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Próximas reservas (vista agenda)</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                      <thead className="bg-muted/40 text-left">
                        <tr>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alumno</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Clase</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fecha</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hora</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingAgendaBookings.map((booking) => (
                          <tr key={`agenda-booking-${booking.id}`} className="border-t border-border">
                            <td className="px-4 py-3 text-sm text-foreground">{booking.student?.username || '-'}</td>
                            <td className="px-4 py-3 text-sm text-foreground">{booking.lesson?.title || '-'}</td>
                            <td className="px-4 py-3 text-sm text-foreground">{booking.date}</td>
                            <td className="px-4 py-3 text-sm text-foreground">{toTimeValue(booking.time)}</td>
                            <td className="px-4 py-3 text-sm text-foreground">{statusLabel(booking.status)}</td>
                          </tr>
                        ))}
                        {!isAgendaLoading && upcomingAgendaBookings.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                              No hay reservas próximas.
                            </td>
                          </tr>
                        )}
                        {isAgendaLoading && (
                          <tr>
                            <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                              Cargando agenda...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {authHeader && activeSection === 'calendar' && (
          <section className="space-y-4">
            <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Calendario de Google (comparativa)</h2>
                  <p className="text-sm text-muted-foreground">
                    Esta vista te permite comparar el calendario de Google con la agenda interna del sistema.
                  </p>
                </div>
                {GOOGLE_CALENDAR_PUBLIC_URL && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(GOOGLE_CALENDAR_PUBLIC_URL, '_blank', 'noopener,noreferrer')}
                  >
                    Abrir calendario editable
                  </Button>
                )}
              </div>
            </div>

            {!GOOGLE_CALENDAR_EMBED_URL && (
              <div className="bg-white border border-border rounded-xl p-6 shadow-soft">
                <p className="text-sm text-foreground font-semibold">Falta configurar la URL embebida del calendario de Google.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Añade `VITE_GOOGLE_CALENDAR_EMBED_URL` en el `.env` del frontend para mostrarlo aquí.
                </p>
              </div>
            )}

            {GOOGLE_CALENDAR_EMBED_URL && (
              <div className="grid xl:grid-cols-12 gap-4">
                <div className="xl:col-span-8 bg-white border border-border rounded-xl shadow-soft overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">Vista del calendario de Google</p>
                  </div>
                  <iframe
                    title="Calendario de Google de Ester"
                    src={GOOGLE_CALENDAR_EMBED_URL}
                    className="w-full min-h-[760px] bg-white"
                    loading="lazy"
                  />
                </div>

                <aside className="xl:col-span-4 space-y-4">
                  <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
                    <h3 className="text-sm font-semibold text-foreground">Referencia rápida agenda interna</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Próximas reservas registradas en el sistema.
                    </p>
                    <div className="mt-3 space-y-2">
                      {upcomingAgendaBookings.slice(0, 8).map((booking) => (
                        <div key={`calendar-side-${booking.id}`} className="rounded-md border border-border px-3 py-2">
                          <p className="text-sm font-semibold text-foreground">{booking.student?.username || 'Alumno'}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.date} · {toTimeValue(booking.time)} · {booking.lesson?.title || 'Clase'}
                          </p>
                        </div>
                      ))}
                      {!upcomingAgendaBookings.length && (
                        <p className="text-sm text-muted-foreground">No hay reservas próximas en agenda interna.</p>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </section>
        )}
      </main>

      {isManualBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl border border-border shadow-cultural p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-headlines font-semibold text-foreground">Crear reserva desde agenda</h3>
                <p className="text-sm text-muted-foreground">
                  Completa los datos y confirma. Fecha y hora vienen precargadas desde la celda seleccionada.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBookingModalError('');
                  setIsManualBookingModalOpen(false);
                }}
                disabled={isAgendaSaving}
              >
                Cerrar
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Alumno</label>
                <select
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={manualBookingDraft.student_id}
                  onChange={(event) => setManualBookingDraft((prev) => ({ ...prev, student_id: event.target.value }))}
                >
                  <option value="">Seleccionar alumno</option>
                  {students.map((student) => (
                    <option key={`modal-manual-student-${student.id}`} value={student.id}>
                      {student.first_name || student.username} {student.last_name || ''} ({student.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Clase</label>
                <select
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={manualBookingDraft.lesson_id}
                  onChange={(event) => {
                    const lessonId = event.target.value;
                    const lesson = lessons.find((item) => String(item.id) === String(lessonId));
                    setManualBookingDraft((prev) => ({
                      ...prev,
                      lesson_id: lessonId,
                      duration_minutes: lesson?.duration ? String(lesson.duration) : prev.duration_minutes,
                    }));
                  }}
                >
                  <option value="">Seleccionar clase</option>
                  {lessons.map((lesson) => (
                    <option key={`modal-manual-lesson-${lesson.id}`} value={lesson.id}>{lesson.title}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Fecha"
                type="date"
                value={manualBookingDraft.date}
                onChange={(event) => setManualBookingDraft((prev) => ({ ...prev, date: event.target.value }))}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Hora</label>
                <select
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={manualBookingDraft.time}
                  onChange={(event) => setManualBookingDraft((prev) => ({ ...prev, time: event.target.value }))}
                >
                  <option value="">Seleccionar hora</option>
                  {QUARTER_HOUR_OPTIONS.map((timeOption) => (
                    <option key={`modal-manual-time-${timeOption}`} value={timeOption}>{timeOption}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Duración</label>
                <select
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={manualBookingDraft.duration_minutes}
                  onChange={(event) => setManualBookingDraft((prev) => ({ ...prev, duration_minutes: event.target.value }))}
                >
                  {Array.from({ length: 16 }).map((_, idx) => {
                    const minutes = (idx + 1) * 15;
                    return (
                      <option key={`modal-manual-duration-${minutes}`} value={String(minutes)}>
                        {minutes} min
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Estado</label>
                <select
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={manualBookingDraft.status}
                  onChange={(event) => setManualBookingDraft((prev) => ({ ...prev, status: event.target.value }))}
                >
                  {BOOKING_STATUS_OPTIONS.map((statusOption) => (
                    <option key={`modal-manual-status-${statusOption}`} value={statusOption}>{statusLabel(statusOption)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Notas</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                  value={manualBookingDraft.notes}
                  onChange={(event) => setManualBookingDraft((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </div>
            </div>

            {bookingModalError && (
              <div className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                {bookingModalError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setBookingModalError('');
                  setIsManualBookingModalOpen(false);
                }}
                disabled={isAgendaSaving}
              >
                Cancelar
              </Button>
              <Button
                onClick={onCreateManualBooking}
                disabled={isAgendaSaving || !manualBookingDraft.student_id || !manualBookingDraft.lesson_id || !manualBookingDraft.date || !manualBookingDraft.time}
              >
                {isAgendaSaving ? 'Guardando...' : 'Confirmar reserva'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isAgendaStateModalOpen && selectedAgendaCell && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl border border-border shadow-cultural p-5 space-y-4">
            <div>
              <h3 className="text-lg font-headlines font-semibold text-foreground">Estado de franja</h3>
              <p className="text-sm text-muted-foreground">
                {selectedAgendaCell.day.label} {selectedAgendaCell.day.isoDate} {selectedAgendaCell.startTime || selectedAgendaCell.timeValue} - {selectedAgendaCell.endTime || addMinutesToTimeValue(selectedAgendaCell.timeValue, 15)}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Selecciona estado</label>
              <select
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedAgendaState}
                onChange={(event) => setSelectedAgendaState(event.target.value)}
                disabled={selectedAgendaCell?.hasExternalEvent}
              >
                <option value="reserved">Reserva</option>
                <option value="available">Disponible</option>
                <option value="unavailable">No disponible</option>
              </select>
              {selectedAgendaCell?.hasExternalEvent && (
                <p className="text-xs text-blue-700">
                  Evento externo de Google Calendar. Edita esta franja en Google para que se sincronice automáticamente.
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 flex-wrap">
              {selectedAgendaCell?.hasExternalEvent && selectedAgendaCell?.externalEvent?.html_link && (
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedAgendaCell.externalEvent.html_link, '_blank', 'noopener,noreferrer')}
                >
                  Abrir evento en Google
                </Button>
              )}
              {selectedAgendaCell?.hasExternalEvent && GOOGLE_CALENDAR_PUBLIC_URL && (
                <Button
                  variant="outline"
                  onClick={() => window.open(GOOGLE_CALENDAR_PUBLIC_URL, '_blank', 'noopener,noreferrer')}
                >
                  Abrir calendario editable
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsAgendaStateModalOpen(false)} disabled={isAgendaSaving}>
                Cancelar
              </Button>
              <Button onClick={onApplyAgendaState} disabled={isAgendaSaving || selectedAgendaCell?.hasExternalEvent}>
                {isAgendaSaving ? 'Guardando...' : 'Aplicar'}
              </Button>
            </div>
          </div>
        </div>
      )}

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
