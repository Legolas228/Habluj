import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentStudent, studentLogin, studentLogout, studentRegister } from '../services/studentAuth';

const AUTH_TOKEN_KEY = 'habluj_student_auth_token';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY) || '';
    } catch {
      return '';
    }
  });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const clearAuth = () => {
    setToken('');
    setUser(null);
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
      // Ignore storage errors.
    }
  };

  useEffect(() => {
    const hydrateAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await getCurrentStudent(token);
        setUser(me);
      } catch {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    hydrateAuth();
  }, [token]);

  const login = async ({ identifier, password }) => {
    setAuthError('');
    const result = await studentLogin({ identifier, password });
    setToken(result.token);
    setUser(result.user);
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, result.token);
    } catch {
      // Ignore storage errors.
    }
    return result;
  };

  const register = async ({ first_name, last_name, username, email, password, password_confirm, language_level, learning_reason, birth_date }) => {
    setAuthError('');
    const result = await studentRegister({
      first_name,
      last_name,
      username,
      email,
      password,
      password_confirm,
      language_level,
      learning_reason,
      birth_date,
    });
    setToken(result.token);
    setUser(result.user);
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, result.token);
    } catch {
      // Ignore storage errors.
    }
    return result;
  };

  const logout = async () => {
    const currentToken = token;
    clearAuth();
    if (!currentToken) return;
    try {
      await studentLogout(currentToken);
    } catch {
      // Keep local logout even if network call fails.
    }
  };

  const value = useMemo(() => ({
    token,
    user,
    isLoading,
    authError,
    isAuthenticated: Boolean(token && user),
    setAuthError,
    login,
    register,
    logout,
  }), [token, user, isLoading, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
