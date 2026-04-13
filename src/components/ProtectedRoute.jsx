import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { detectLanguageFromPath, getLocalizedPath } from '../utils/seo';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const language = detectLanguageFromPath(location.pathname) || 'sk';
    return <Navigate to={getLocalizedPath('/login', language)} replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
