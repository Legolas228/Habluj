import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded components for code splitting
const ContactPage = lazy(() => import('./pages/contact'));
const TutoringServices = lazy(() => import('./pages/tutoring-services'));
const AboutTheTeacher = lazy(() => import('./pages/about-the-teacher'));
const BookingSystem = lazy(() => import('./pages/booking-system'));
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

const Routes = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <RouterRoutes>
            {/* Define your route here */}
            <Route path="/" element={<Homepage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/tutoring-services" element={<TutoringServices />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/student-dashboard"
              element={(
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              )}
            />
            <Route path="/ester-dashboard" element={<EsterDashboard />} />
            <Route path="/about-the-teacher" element={<AboutTheTeacher />} />
            <Route
              path="/booking-system"
              element={(
                <ProtectedRoute>
                  <BookingSystem />
                </ProtectedRoute>
              )}
            />
            <Route path="/homepage" element={<Navigate to="/" replace />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
            <Route path="/cookies-policy" element={<CookiesPolicyPage />} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
