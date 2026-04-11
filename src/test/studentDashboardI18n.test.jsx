import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import StudentDashboard from '../pages/student-dashboard';
import sk from '../locales/sk';
import cz from '../locales/cz';
import es from '../locales/es';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('../services/studentAuth', () => ({
  getStudentBookings: vi.fn().mockResolvedValue([]),
  getStudentMaterials: vi.fn().mockResolvedValue([]),
  getUserProfile: vi.fn().mockResolvedValue({ language_level: 'A1', created_at: '2024-09-15' }),
  cancelStudentBooking: vi.fn().mockResolvedValue({ status: 'booking cancelled' }),
  sendStudentMessage: vi.fn().mockResolvedValue({}),
}));

vi.mock('../components/ui/Header', () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock('../components/ui/SiteFooter', () => ({
  default: () => <div data-testid="footer" />,
}));

import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { getStudentBookings, getStudentMaterials, getUserProfile } from '../services/studentAuth';

const localesByLang = { sk, cz, es };

const makeTranslator = (translations) => (key) => translations[key] || key;

describe('StudentDashboard i18n smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      user: { username: 'student', first_name: '', last_name: '' },
      token: 'token',
      logout: vi.fn(),
    });
  });

  it.each([
    ['sk', 'studentDashboard.dashboardTitle', 'studentDashboard.tabs.overview'],
    ['cz', 'studentDashboard.dashboardTitle', 'studentDashboard.tabs.overview'],
    ['es', 'studentDashboard.dashboardTitle', 'studentDashboard.tabs.overview'],
  ])('renders dashboard chrome in %s', async (lang, titleKey, overviewTabKey) => {
    const translations = localesByLang[lang];
    useTranslation.mockReturnValue({
      language: lang,
      t: makeTranslator(translations),
    });

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <StudentDashboard />
      </MemoryRouter>,
    );

    // Let dashboard effects settle to avoid act warnings from async state updates.
    await waitFor(() => {
      expect(getUserProfile).toHaveBeenCalledTimes(1);
      expect(getStudentBookings).toHaveBeenCalledTimes(1);
      expect(getStudentMaterials).toHaveBeenCalledTimes(1);
    });

    expect(screen.getAllByText(translations[titleKey]).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: translations[overviewTabKey] })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: translations['studentDashboard.tabs.lessons'] })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: translations['studentDashboard.tabs.resources'] })).toBeInTheDocument();
  });
});
