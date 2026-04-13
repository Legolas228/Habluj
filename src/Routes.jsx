import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { getLanguageFromSegment, getLanguageSegment } from "./utils/seo";

// Lazy-loaded components for code splitting
const ContactPage = lazy(() => import('./pages/contact'));
const TutoringServices = lazy(() => import('./pages/tutoring-services'));
const AboutTheTeacher = lazy(() => import('./pages/about-the-teacher'));
const BookingSystem = lazy(() => import('./pages/booking-system'));
const LevelQuestionnairePage = lazy(() => import('./pages/level-questionnaire'));
const Homepage = lazy(() => import('./pages/homepage'));
const PrivacyPolicyPage = lazy(() => import('./pages/privacy-policy'));
const TermsAndConditionsPage = lazy(() => import('./pages/terms-and-conditions'));
const CookiesPolicyPage = lazy(() => import('./pages/cookies-policy'));
const EsterDashboard = lazy(() => import('./pages/ester-dashboard'));
const StudentDashboard = lazy(() => import('./pages/student-dashboard'));
const LoginPage = lazy(() => import('./pages/login'));
const SignupPage = lazy(() => import('./pages/signup'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const getPreferredLanguageSegment = () => {
  if (typeof window !== 'undefined') {
    try {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) {
        return getLanguageSegment(savedLanguage);
      }
    } catch (error) {
      // Ignore localStorage access issues.
    }

    const browserLanguage = (navigator.language || '').toLowerCase();
    if (browserLanguage.startsWith('cs')) return 'cs';
    if (browserLanguage.startsWith('es')) return 'es';
  }
  return 'sk';
};

const redirectToLocalized = (targetPath = '') => {
  const prefix = getPreferredLanguageSegment();
  const normalizedPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
  if (normalizedPath === '/') {
    return `/${prefix}`;
  }
  return `/${prefix}${normalizedPath}`;
};

const LanguageRouteGuard = () => {
  const { lang } = useParams();
  const location = useLocation();
  const normalized = getLanguageFromSegment(lang);
  const canonicalSegment = getLanguageSegment(normalized);

  if (lang !== canonicalSegment) {
    const pathWithoutSegment = location.pathname.replace(/^\/[^/]+/, '') || '/';
    return <Navigate to={`/${canonicalSegment}${pathWithoutSegment}${location.search}${location.hash}`} replace />;
  }

  return <Outlet />;
};

const Routes = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <RouterRoutes>
            {/* Legacy routes without language prefix -> redirect */}
            <Route path="/" element={<Navigate to={redirectToLocalized('/')} replace />} />
            <Route path="/contact" element={<Navigate to={redirectToLocalized('/contact')} replace />} />
            <Route path="/tutoring-services" element={<Navigate to={redirectToLocalized('/tutoring-services')} replace />} />
            <Route path="/login" element={<Navigate to={redirectToLocalized('/login')} replace />} />
            <Route path="/signup" element={<Navigate to={redirectToLocalized('/signup')} replace />} />
            <Route
              path="/student-dashboard"
              element={<Navigate to={redirectToLocalized('/student-dashboard')} replace />}
            />
            <Route path="/ester-dashboard" element={<Navigate to={redirectToLocalized('/ester-dashboard')} replace />} />
            <Route path="/about-the-teacher" element={<Navigate to={redirectToLocalized('/about-the-teacher')} replace />} />
            <Route path="/booking-system" element={<Navigate to={redirectToLocalized('/booking-system')} replace />} />
            <Route path="/level-questionnaire" element={<Navigate to={redirectToLocalized('/level-questionnaire')} replace />} />
            <Route path="/homepage" element={<Navigate to={redirectToLocalized('/')} replace />} />
            <Route path="/privacy-policy" element={<Navigate to={redirectToLocalized('/privacy-policy')} replace />} />
            <Route path="/terms-and-conditions" element={<Navigate to={redirectToLocalized('/terms-and-conditions')} replace />} />
            <Route path="/cookies-policy" element={<Navigate to={redirectToLocalized('/cookies-policy')} replace />} />

            {/* Language-prefixed canonical routes */}
            <Route path="/:lang" element={<LanguageRouteGuard />}>
              <Route index element={<Homepage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="tutoring-services" element={<TutoringServices />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route
                path="student-dashboard"
                element={(
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                )}
              />
              <Route path="ester-dashboard" element={<EsterDashboard />} />
              <Route path="about-the-teacher" element={<AboutTheTeacher />} />
              <Route path="booking-system" element={<BookingSystem />} />
              <Route path="level-questionnaire" element={<LevelQuestionnairePage />} />
              <Route path="homepage" element={<Navigate to=".." replace />} />
              <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="terms-and-conditions" element={<TermsAndConditionsPage />} />
              <Route path="cookies-policy" element={<CookiesPolicyPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
