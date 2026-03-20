import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import {
  cancelStudentBooking,
  createStudentMaterial,
  getStudentBookings,
  getStudentGoals,
  getStudentMaterials,
  getStudentMessages,
  getStudentProgress,
  getUserProfile,
  markStudentMessageRead,
  updateStudentGoal,
  updateUserProfile,
} from '../../services/studentAuth';
import StudentLessonsPanel from './components/StudentLessonsPanel';
import StudentResourcesPanel from './components/StudentResourcesPanel';
import { Suspense, lazy } from 'react';

// Lazy loading heavy components, specially those using recharts
const ProgressChart = lazy(() => import('./components/ProgressChart'));
const GoalTracker = lazy(() => import('./components/GoalTracker'));
const PaymentHistory = lazy(() => import('./components/PaymentHistory'));
const MessagingPortal = lazy(() => import('./components/MessagingPortal'));

const TabLoader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const localeByLanguage = {
  sk: 'sk-SK',
  cz: 'cs-CZ',
  es: 'es-ES',
};

const StudentDashboard = () => {
  const { user, token, logout } = useAuth();
  const { t, language } = useTranslation();
  const copy = {
    defaultStudentName: t('studentDashboard.defaultStudentName'),
    defaultSessionTitle: t('studentDashboard.defaultSessionTitle'),
    stats: {
      totalLessons: t('studentDashboard.stats.totalLessons'),
      totalLessonsTrend: t('studentDashboard.stats.totalLessonsTrend'),
      studyHours: t('studentDashboard.stats.studyHours'),
      studyHoursTrend: t('studentDashboard.stats.studyHoursTrend'),
      currentLevel: t('studentDashboard.stats.currentLevel'),
      currentLevelTrend: t('studentDashboard.stats.currentLevelTrend'),
      streak: t('studentDashboard.stats.streak'),
      streakTrend: t('studentDashboard.stats.streakTrend'),
      daysSuffix: t('studentDashboard.stats.daysSuffix'),
    },
    tabs: {
      overview: t('studentDashboard.tabs.overview'),
      lessons: t('studentDashboard.tabs.lessons'),
      progress: t('studentDashboard.tabs.progress'),
      goals: t('studentDashboard.tabs.goals'),
      resources: t('studentDashboard.tabs.resources'),
      payments: t('studentDashboard.tabs.payments'),
      messages: t('studentDashboard.tabs.messages'),
    },
    greeting: t('studentDashboard.greeting'),
    welcomeMessage: t('studentDashboard.welcomeMessage'),
    memberSince: t('studentDashboard.memberSince'),
    levelPrefix: t('studentDashboard.levelPrefix'),
    nextLesson: t('studentDashboard.nextLesson'),
    confirmed: t('studentDashboard.confirmed'),
    join: t('studentDashboard.join'),
    noLessons: t('studentDashboard.noLessons'),
    loading: t('studentDashboard.loading'),
    quickActions: t('studentDashboard.quickActions'),
    studyMaterials: t('studentDashboard.studyMaterials'),
    allResources: t('studentDashboard.allResources'),
    contactTeacher: t('studentDashboard.contactTeacher'),
    sendMessage: t('studentDashboard.sendMessage'),
    setGoals: t('studentDashboard.setGoals'),
    trackProgress: t('studentDashboard.trackProgress'),
    recentActivity: t('studentDashboard.recentActivity'),
    viewAll: t('studentDashboard.viewAll'),
    upcomingEvents: t('studentDashboard.upcomingEvents'),
    calendar: t('studentDashboard.calendar'),
    noEvents: t('studentDashboard.noEvents'),
    pending: t('studentDashboard.pending'),
    scheduled: t('studentDashboard.scheduled'),
    home: t('studentDashboard.home'),
    dashboardTitle: t('studentDashboard.dashboardTitle'),
    logout: t('studentDashboard.logout'),
    profileErrorFallback: t('studentDashboard.profileErrorFallback'),
    bookingsErrorFallback: t('studentDashboard.bookingsErrorFallback'),
    materialsErrorFallback: t('studentDashboard.materialsErrorFallback'),
    cancelErrorFallback: t('studentDashboard.cancelErrorFallback'),
  };
  const locale = localeByLanguage[language] || localeByLanguage.sk;
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');
  const [materials, setMaterials] = useState([]);
  const [isMaterialsLoading, setIsMaterialsLoading] = useState(true);
  const [materialsError, setMaterialsError] = useState('');
  const [isMaterialCreating, setIsMaterialCreating] = useState(false);
  const [materialCreateError, setMaterialCreateError] = useState('');
  const [bookingActionLoadingId, setBookingActionLoadingId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [goals, setGoals] = useState([]);
  const [goalsError, setGoalsError] = useState('');
  const [isGoalUpdating, setIsGoalUpdating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messagesError, setMessagesError] = useState('');
  const [isMessageUpdating, setIsMessageUpdating] = useState(false);
  const [progressRecords, setProgressRecords] = useState([]);
  const [progressError, setProgressError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;
      setIsProfileLoading(true);
      setProfileError('');
      try {
        const profile = await getUserProfile(token);
        setUserProfile(profile);
      } catch (error) {
        setProfileError(error?.message || copy.profileErrorFallback);
        // Don't throw error, use defaults
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  useEffect(() => {
    const loadGoals = async () => {
      if (!token) return;
      setGoalsError('');
      try {
        const response = await getStudentGoals(token);
        setGoals(response);
      } catch (error) {
        setGoalsError(error?.message || 'No se pudieron cargar las metas.');
      }
    };
    loadGoals();
  }, [token]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!token) return;
      setMessagesError('');
      try {
        const response = await getStudentMessages(token);
        setMessages(response);
      } catch (error) {
        setMessagesError(error?.message || 'No se pudieron cargar los mensajes.');
      }
    };
    loadMessages();
  }, [token]);

  useEffect(() => {
    const loadProgress = async () => {
      if (!token) return;
      setProgressError('');
      try {
        const response = await getStudentProgress(token);
        setProgressRecords(response);
      } catch (error) {
        setProgressError(error?.message || 'No se pudo cargar el progreso.');
      }
    };
    loadProgress();
  }, [token]);

  useEffect(() => {
    const loadBookings = async () => {
      if (!token) return;
      setIsBookingsLoading(true);
      setBookingsError('');
      try {
        const response = await getStudentBookings(token);
        setBookings(response);
      } catch (error) {
        setBookingsError(error?.message || copy.bookingsErrorFallback);
      } finally {
        setIsBookingsLoading(false);
      }
    };

    loadBookings();
  }, [token]);

  useEffect(() => {
    const loadMaterials = async () => {
      if (!token) return;
      setIsMaterialsLoading(true);
      setMaterialsError('');
      try {
        const response = await getStudentMaterials(token);
        setMaterials(response);
      } catch (error) {
        setMaterialsError(error?.message || copy.materialsErrorFallback);
      } finally {
        setIsMaterialsLoading(false);
      }
    };

    loadMaterials();
  }, [token]);

  const handleCancelBooking = async (bookingId) => {
    if (!token) return;
    setBookingActionLoadingId(bookingId);
    setBookingsError('');
    try {
      await cancelStudentBooking({ token, bookingId });
      setBookings((prev) => prev.map((booking) => (
        booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
      )));
    } catch (error) {
      setBookingsError(error?.message || copy.cancelErrorFallback);
    } finally {
      setBookingActionLoadingId(null);
    }
  };

  const handleUpdateProfile = async ({ language_level, bio }) => {
    if (!token) return;
    setIsProfileSaving(true);
    setProfileError('');
    try {
      const updated = await updateUserProfile({ token, language_level, bio });
      setUserProfile(updated);
    } catch (error) {
      setProfileError(error?.message || copy.profileErrorFallback);
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleCreateMaterial = async (payload) => {
    if (!token) return;
    setIsMaterialCreating(true);
    setMaterialCreateError('');
    try {
      const created = await createStudentMaterial({ token, payload });
      setMaterials((prev) => [created, ...prev]);
    } catch (error) {
      setMaterialCreateError(error?.message || copy.materialsErrorFallback);
      throw error;
    } finally {
      setIsMaterialCreating(false);
    }
  };

  const handleToggleGoal = async (goalId, isCompleted) => {
    if (!token) return;
    setIsGoalUpdating(true);
    setGoalsError('');
    try {
      const updated = await updateStudentGoal({ token, goalId, payload: { is_completed: isCompleted } });
      setGoals((prev) => prev.map((goal) => (goal.id === updated.id ? updated : goal)));
    } catch (error) {
      setGoalsError(error?.message || 'No se pudo actualizar la meta.');
    } finally {
      setIsGoalUpdating(false);
    }
  };

  const handleMarkMessageRead = async (messageId) => {
    if (!token) return;
    setIsMessageUpdating(true);
    setMessagesError('');
    try {
      const updated = await markStudentMessageRead({ token, messageId, is_read: true });
      setMessages((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      setMessagesError(error?.message || 'No se pudo actualizar el mensaje.');
    } finally {
      setIsMessageUpdating(false);
    }
  };

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((item) => {
        const datetime = new Date(`${item.date}T${item.time || '00:00:00'}`);
        return !Number.isNaN(datetime.getTime()) && datetime >= now;
      })
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00:00'}`) - new Date(`${b.date}T${b.time || '00:00:00'}`));
  }, [bookings]);

  const pastBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((item) => {
        const datetime = new Date(`${item.date}T${item.time || '00:00:00'}`);
        return !Number.isNaN(datetime.getTime()) && datetime < now;
      })
      .sort((a, b) => new Date(`${b.date}T${b.time || '00:00:00'}`) - new Date(`${a.date}T${a.time || '00:00:00'}`));
  }, [bookings]);

  const nextBooking = upcomingBookings[0] || null;

  const studentData = useMemo(() => ({
    name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || copy.defaultStudentName,
    email: user?.email || '-',
    level: userProfile?.language_level || 'A1',
    joinDate: userProfile?.created_at || new Date().toISOString().split('T')[0],
    totalLessons: bookings.length,
    completedHours: pastBookings.length,
    currentStreak: 0,
    nextLesson: nextBooking ? {
      date: nextBooking.date,
      time: nextBooking.time,
      type: nextBooking.lesson?.title || copy.defaultSessionTitle,
      teacher: 'Ester Mesaros',
    } : null,
  }), [user, userProfile, bookings.length, pastBookings.length, nextBooking, copy.defaultStudentName, copy.defaultSessionTitle]);

  const quickStats = [
    {
      id: 1,
      title: copy.stats.totalLessons,
      value: studentData?.totalLessons,
      icon: "BookOpen",
      color: "text-primary bg-primary/10",
      trend: copy.stats.totalLessonsTrend
    },
    {
      id: 2,
      title: copy.stats.studyHours,
      value: studentData?.completedHours,
      icon: "Clock",
      color: "text-secondary bg-secondary/10",
      trend: copy.stats.studyHoursTrend
    },
    {
      id: 3,
      title: copy.stats.currentLevel,
      value: studentData?.level,
      icon: "TrendingUp",
      color: "text-success bg-success/10",
      trend: copy.stats.currentLevelTrend
    },
    {
      id: 4,
      title: copy.stats.streak,
      value: `${studentData?.currentStreak} ${copy.stats.daysSuffix}`,
      icon: "Flame",
      color: "text-accent bg-accent/10",
      trend: copy.stats.streakTrend
    }
  ];

  function statusLabelFromBooking(status, translate) {
    if (status === 'confirmed') return translate('studentLessons.status.confirmed');
    if (status === 'pending') return translate('studentLessons.status.pending');
    if (status === 'cancelled') return translate('studentLessons.status.cancelled');
    if (status === 'completed') return translate('studentLessons.status.completed');
    return status || '-';
  }

  const recentActivities = useMemo(() => {
    const bookingActivities = bookings.slice(0, 3).map((booking) => ({
      id: `booking-${booking.id}`,
      type: 'lesson',
      title: booking.lesson?.title || copy.defaultSessionTitle,
      description: statusLabelFromBooking(booking.status, t),
      timestamp: `${booking.date} ${booking.time || '00:00:00'}`,
      icon: 'BookOpen',
      color: 'text-primary',
    }));

    const materialActivities = materials.slice(0, 2).map((material) => ({
      id: `material-${material.id}`,
      type: 'resource',
      title: material.title,
      description: t('studentDashboard.activity.resourceDescription'),
      timestamp: material.created_at,
      icon: 'Download',
      color: 'text-secondary',
    }));

    const merged = [...bookingActivities, ...materialActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    if (merged.length) return merged;
    return [
      {
        id: 'empty-activity',
        type: 'system',
        title: t('studentDashboard.activity.lessonTitle'),
        description: t('studentDashboard.activity.lessonDescription'),
        timestamp: new Date().toISOString(),
        icon: 'Info',
        color: 'text-muted-foreground',
      },
    ];
  }, [bookings, materials, copy.defaultSessionTitle, t]);

  const upcomingEvents = upcomingBookings.slice(0, 5).map((booking) => ({
    id: booking.id,
    title: booking.lesson?.title || copy.defaultSessionTitle,
    date: booking.date,
    time: booking.time,
    teacher: 'Ester Mesaros',
    type: 'lesson',
    status: booking.status || 'scheduled',
  }));

  const navigationTabs = [
    { id: 'overview', name: copy.tabs.overview, icon: 'LayoutDashboard' },
    { id: 'lessons', name: copy.tabs.lessons, icon: 'BookOpen' },
    { id: 'progress', name: copy.tabs.progress, icon: 'TrendingUp' },
    { id: 'goals', name: copy.tabs.goals, icon: 'Target' },
    { id: 'resources', name: copy.tabs.resources, icon: 'FileText' },
    { id: 'payments', name: copy.tabs.payments, icon: 'CreditCard' },
    { id: 'messages', name: copy.tabs.messages, icon: 'MessageCircle' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return language === 'es' ? 'Hace un momento' : language === 'cz' ? 'Pred chvili' : 'Pred chvilou';
    } else if (diffInHours < 24) {
      if (language === 'es') return `Hace ${Math.floor(diffInHours)} horas`;
      return `Pred ${Math.floor(diffInHours)} hodinami`;
    } else {
      return date?.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-cultural rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-headlines font-bold mb-2">
              {copy.greeting}, {studentData?.name}! 👋
            </h1>
            <p className="text-white/90 mb-4">
              {copy.welcomeMessage}
            </p>
            {bookingsError && (
              <p className="text-sm text-white/90 bg-black/15 rounded-md px-3 py-2 inline-block">
                {bookingsError}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm text-white/80">
              <div className="flex items-center space-x-1">
                <Icon name="Calendar" size={16} />
                <span>{copy.memberSince} {formatDate(studentData?.joinDate)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Award" size={16} />
                <span>{copy.levelPrefix} {studentData?.level}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="User" size={48} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats?.map((stat) => (
          <div key={stat?.id} className="bg-white rounded-lg shadow-soft border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat?.color}`}>
                <Icon name={stat?.icon} size={24} />
              </div>
              <Icon name="TrendingUp" size={16} className="text-success" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stat?.value}</h3>
            <p className="text-sm text-muted-foreground mb-2">{stat?.title}</p>
            <p className="text-xs text-success">{stat?.trend}</p>
          </div>
        ))}
      </div>

      {/* Next Lesson & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Lesson */}
        <div className="bg-white rounded-lg shadow-soft border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-headlines font-semibold text-foreground">{copy.nextLesson}</h3>
            <Icon name="Calendar" size={20} className="text-primary" />
          </div>

          {studentData?.nextLesson ? (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{studentData?.nextLesson?.type}</h4>
                  <span className="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                    {copy.confirmed}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Icon name="Calendar" size={14} />
                    <span>{formatDate(studentData?.nextLesson?.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Clock" size={14} />
                    <span>{studentData?.nextLesson?.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="User" size={14} />
                    <span>{studentData?.nextLesson?.teacher}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="default" size="sm" iconName="Video" iconPosition="left" className="flex-1">
                    {copy.join}
                </Button>
                <Button variant="outline" size="sm" iconName="Calendar">
                  Setmore
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{copy.noLessons}</p>
              {isBookingsLoading && <p className="text-sm text-muted-foreground">{copy.loading}</p>}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-soft border p-6">
          <h3 className="text-lg font-headlines font-semibold text-foreground mb-4">{copy.quickActions}</h3>

          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('resources')}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <Icon name="BookOpen" size={20} className="text-secondary" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-foreground">{copy.studyMaterials}</h4>
                <p className="text-sm text-muted-foreground">{copy.allResources}</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Icon name="MessageCircle" size={20} className="text-accent" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-foreground">{copy.contactTeacher}</h4>
                <p className="text-sm text-muted-foreground">{copy.sendMessage}</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center group-hover:bg-success/20 transition-colors">
                <Icon name="Target" size={20} className="text-success" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-foreground">{copy.setGoals}</h4>
                <p className="text-sm text-muted-foreground">{copy.trackProgress}</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-soft border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-headlines font-semibold text-foreground">{copy.recentActivity}</h3>
            <Button variant="ghost" size="sm">{copy.viewAll}</Button>
          </div>

          <div className="space-y-4">
            {recentActivities?.map((activity) => (
              <div key={activity?.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity?.color} bg-current/10`}>
                  <Icon name={activity?.icon} size={16} className={activity?.color} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground text-sm">{activity?.title}</h4>
                  <p className="text-xs text-muted-foreground mb-1">{activity?.description}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(activity?.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-soft border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-headlines font-semibold text-foreground">{copy.upcomingEvents}</h3>
            <Button variant="ghost" size="sm">{copy.calendar}</Button>
          </div>

          <div className="space-y-4">
            {upcomingEvents?.map((event) => (
              <div key={event?.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground text-sm">{event?.title}</h4>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{formatDate(event?.date)}</span>
                    <span>•</span>
                    <span>{event?.time}</span>
                    {event?.teacher && (
                      <>
                        <span>•</span>
                        <span>{event?.teacher}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${event?.status === 'confirmed' ? 'bg-success/10 text-success' :
                  event?.status === 'scheduled' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                  }`}>
                  {event?.status === 'confirmed' ? copy.confirmed :
                    event?.status === 'scheduled' ? copy.scheduled : copy.pending}
                </span>
              </div>
            ))}
            {!upcomingEvents.length && (
              <p className="text-sm text-muted-foreground">{copy.noEvents}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'lessons':
        return (
          <StudentLessonsPanel
            upcomingBookings={upcomingBookings}
            pastBookings={pastBookings}
            isLoading={isBookingsLoading}
            error={bookingsError}
            onCancelBooking={handleCancelBooking}
            actionLoadingBookingId={bookingActionLoadingId}
            language={language}
          />
        );
      case 'progress':
        return (
          <Suspense fallback={<TabLoader />}>
            <ProgressChart language={language} progressRecords={progressRecords} error={progressError} />
          </Suspense>
        );
      case 'goals':
        return (
          <Suspense fallback={<TabLoader />}>
            <GoalTracker
              language={language}
              currentLevel={userProfile?.language_level || 'A1'}
              profileBio={userProfile?.bio || ''}
              onSaveProfile={handleUpdateProfile}
              isProfileSaving={isProfileSaving}
              profileError={profileError}
              bookings={bookings}
              materials={materials}
              goals={goals}
              goalsError={goalsError}
              onToggleGoal={handleToggleGoal}
              isGoalUpdating={isGoalUpdating}
            />
          </Suspense>
        );
      case 'resources':
        return (
          <StudentResourcesPanel
            materials={materials}
            isLoading={isMaterialsLoading}
            error={materialsError}
            language={language}
            bookings={bookings}
            onCreateMaterial={handleCreateMaterial}
            isCreatingMaterial={isMaterialCreating}
            createError={materialCreateError}
          />
        );
      case 'payments':
        return (
          <Suspense fallback={<TabLoader />}>
            <PaymentHistory language={language} bookings={bookings} />
          </Suspense>
        );
      case 'messages':
        return (
          <Suspense fallback={<TabLoader />}>
            <MessagingPortal
              language={language}
              user={user}
              nextBooking={nextBooking}
              messages={messages}
              onMarkRead={handleMarkMessageRead}
              isUpdatingMessage={isMessageUpdating}
              messagesError={messagesError}
            />
          </Suspense>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/homepage" className="hover:text-primary transition-colors">{copy.home}</Link>
              <Icon name="ChevronRight" size={16} />
              <span>{copy.dashboardTitle}</span>
            </div>
            <Button variant="outline" size="sm" iconName="LogOut" onClick={logout}>
              {copy.logout}
            </Button>
          </div>
          <h1 className="text-3xl font-headlines font-bold text-foreground">{copy.dashboardTitle}</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {navigationTabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab?.id
                    ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-8">
          {renderTabContent()}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default StudentDashboard;
