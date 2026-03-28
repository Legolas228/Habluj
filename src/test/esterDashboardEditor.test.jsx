import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import EsterDashboard from '../pages/ester-dashboard';

vi.mock('../services/leads', () => ({
  createBasicAuthHeader: vi.fn(() => 'Basic mocked'),
  exportLeadsCsv: vi.fn(),
  getLeadDetail: vi.fn().mockResolvedValue(null),
  getLeadMetrics: vi.fn().mockResolvedValue({ by_stage: [], by_source: [], by_language: [] }),
  getLeads: vi.fn((authHeader, filters = {}) => {
    if (filters?.source === 'waitlist_intensive') {
      return Promise.resolve([{
        id: 1001,
        full_name: 'Lucia Waitlist',
        email: 'lucia@example.com',
        phone: '+34 600 111 222',
        source: 'waitlist_intensive',
        stage: 'new',
        created_at: '2026-06-20T10:00:00Z',
      }]);
    }
    if (filters?.source === 'waitlist_small_group') {
      return Promise.resolve([]);
    }
    return Promise.resolve([]);
  }),
  updateLead: vi.fn(),
  updateLeadStage: vi.fn().mockImplementation(({ leadId, stage }) => Promise.resolve({
    id: leadId,
    stage,
  })),
  verifyAdminCredentials: vi.fn().mockResolvedValue({}),
}));

vi.mock('../services/adminPortal', () => ({
  createAdminAvailabilityRange: vi.fn(),
  createAdminBooking: vi.fn().mockResolvedValue({
    id: 7001,
    status: 'confirmed',
    student: { id: 1, username: 'ana' },
    lesson: { id: 10, title: 'Clase 1:1' },
    date: '2026-07-10',
    time: '10:00:00',
  }),
  createAdminGoal: vi.fn(),
  createAdminMaterial: vi.fn(),
  createAdminMessage: vi.fn().mockResolvedValue({
    id: 9991,
    student: { id: 1, username: 'ana' },
    sender: { id: 999, username: 'ester' },
    subject: 'Chat',
    body: 'Perfecto, te escribo por aquí.',
    is_read: false,
    created_at: '2026-07-01T09:05:00Z',
  }),
  createAdminProgress: vi.fn(),
  createAdminSlotBlock: vi.fn().mockResolvedValue({
    id: 9100,
    date: '2026-07-11',
    time: '11:00:00',
    reason: 'Evento personal',
  }),
  createAdminWeeklyAvailability: vi.fn().mockResolvedValue({
    id: 8001,
    weekday: 1,
    time: '09:00:00',
    is_active: true,
  }),
  deleteAdminAvailabilityRange: vi.fn(),
  deleteAdminGoal: vi.fn(),
  deleteAdminMaterial: vi.fn(),
  deleteAdminMessage: vi.fn(),
  deleteAdminProgress: vi.fn(),
  deleteAdminSlotBlock: vi.fn().mockResolvedValue({}),
  getAdminAvailabilityRanges: vi.fn().mockResolvedValue([]),
  getAdminBookings: vi.fn().mockResolvedValue([
    {
      id: 301,
      student: { id: 1, username: 'ana', email: 'ana@example.com' },
      lesson: { id: 10, title: 'Clase 1:1' },
      date: '2026-07-10',
      time: '10:00:00',
      status: 'confirmed',
      notes: '',
    },
  ]),
  getAdminGoals: vi.fn().mockResolvedValue([]),
  getAdminLessons: vi.fn().mockResolvedValue([
    { id: 10, title: 'Clase 1:1' },
  ]),
  getAdminMaterials: vi.fn().mockResolvedValue([]),
  getAdminMessages: vi.fn().mockResolvedValue([
    {
      id: 501,
      student: { id: 1, username: 'ana' },
      sender: { id: 1, username: 'ana' },
      subject: 'Chat',
      body: 'Hola Ester',
      is_read: false,
      created_at: '2026-07-01T09:00:00Z',
    },
  ]),
  getAdminProgress: vi.fn().mockResolvedValue([]),
  getAdminSlotBlocks: vi.fn().mockResolvedValue([]),
  getAdminStudents: vi.fn().mockResolvedValue([
    {
      id: 1,
      username: 'ana',
      first_name: 'Ana',
      last_name: 'Test',
      email: 'ana@example.com',
      language_level: 'A2',
      is_active: true,
      booking_count: 1,
      upcoming_bookings: 1,
      bio: '',
    },
  ]),
  getAdminWeeklyAvailability: vi.fn().mockResolvedValue([
    { id: 401, weekday: 0, time: '09:00:00', is_active: true },
  ]),
  updateAdminAvailabilityRange: vi.fn(),
  updateAdminGoal: vi.fn(),
  updateAdminMaterial: vi.fn(),
  updateAdminMessage: vi.fn(),
  updateAdminBooking: vi.fn(),
  updateAdminProgress: vi.fn(),
  updateAdminSlotBlock: vi.fn(),
  updateAdminStudent: vi.fn(),
  updateAdminWeeklyAvailability: vi.fn().mockResolvedValue({
    id: 401,
    weekday: 0,
    time: '09:00:00',
    is_active: false,
  }),
}));

import {
  createAdminBooking,
  createAdminMessage,
} from '../services/adminPortal';

describe('EsterDashboard sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    sessionStorage.setItem('ester_dashboard_auth', 'Basic demo-auth');
  });

  it('renders new dashboard navigation sections', async () => {
    render(<EsterDashboard />);
    await screen.findByRole('button', { name: 'Oportunidades' });
    expect(screen.getByRole('button', { name: 'Estudiantes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reservas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lista de espera' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agenda' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mensajes' })).toBeInTheDocument();
  });

  it('sends a message from Ester messages tab', async () => {
    render(<EsterDashboard />);
    fireEvent.click(await screen.findByRole('button', { name: 'Mensajes' }));

    await screen.findByText('Chat con estudiante');
    expect(await screen.findByText('Hola Ester')).toBeInTheDocument();

    const composer = screen.getByPlaceholderText('Escribe un mensaje...');
    fireEvent.change(composer, { target: { value: 'Perfecto, te escribo por aquí.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => {
      expect(createAdminMessage).toHaveBeenCalledTimes(1);
    });
  });

  it('loads waitlist data in waitlist section', async () => {
    render(<EsterDashboard />);
    fireEvent.click(await screen.findByRole('button', { name: 'Lista de espera' }));
    await screen.findByText('Lucia Waitlist');
    expect(screen.queryByText('Grupo reducido')).not.toBeInTheDocument();
  });

  it('creates a manual booking from agenda section', async () => {
    render(<EsterDashboard />);
    fireEvent.click(await screen.findByRole('button', { name: 'Agenda' }));

    const manualPanelTitle = await screen.findByText('Reserva manual');
    const manualPanel = manualPanelTitle.closest('.bg-white');
    if (!manualPanel) {
      throw new Error('No se encontró el panel de reserva manual');
    }
    const studentSelect = within(manualPanel).getByText('Alumno').closest('div')?.querySelector('select');
    const lessonSelect = within(manualPanel).getByText('Clase').closest('div')?.querySelector('select');
    const statusSelect = within(manualPanel).getByText('Estado').closest('div')?.querySelector('select');
    if (!studentSelect || !lessonSelect || !statusSelect) {
      throw new Error('No se encontraron los selectores de reserva manual');
    }
    fireEvent.change(studentSelect, { target: { value: '1' } });
    fireEvent.change(lessonSelect, { target: { value: '10' } });
    fireEvent.change(statusSelect, { target: { value: 'confirmed' } });

    const dateInput = manualPanel.querySelector('input[type="date"]');
    const timeSelect = within(manualPanel).getByText('Hora').closest('div')?.querySelector('select');
    if (!dateInput || !timeSelect) {
      throw new Error('No se encontraron campos de fecha/hora en reserva manual');
    }
    fireEvent.change(dateInput, { target: { value: '2026-07-10' } });
    fireEvent.change(timeSelect, { target: { value: '10:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear reserva manual' }));

    await waitFor(() => {
      expect(createAdminBooking).toHaveBeenCalledTimes(1);
    });
  });

  it('renders quarter-hour agenda grid with availability states', async () => {
    render(<EsterDashboard />);
    fireEvent.click(await screen.findByRole('button', { name: 'Agenda' }));

    await screen.findByText('Agenda semanal');
    expect(screen.getAllByText('07:00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('07:15').length).toBeGreaterThan(0);
    expect(screen.getAllByText('07:30').length).toBeGreaterThan(0);
    expect(screen.getAllByText('07:45').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/No disponible/i).length).toBeGreaterThan(0);
  });
});
