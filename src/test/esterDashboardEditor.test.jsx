import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import EsterDashboard from '../pages/ester-dashboard';

vi.mock('../services/leads', () => ({
  createBasicAuthHeader: vi.fn(() => 'Basic mocked'),
  exportLeadsCsv: vi.fn(),
  getLeadDetail: vi.fn(),
  getLeadMetrics: vi.fn().mockResolvedValue({ by_stage: [], by_source: [], by_language: [] }),
  getLeads: vi.fn().mockResolvedValue([]),
  updateLead: vi.fn(),
  updateLeadStage: vi.fn(),
  verifyAdminCredentials: vi.fn().mockResolvedValue({}),
}));

vi.mock('../services/adminPortal', () => ({
  createAdminGoal: vi.fn(),
  createAdminMaterial: vi.fn(),
  createAdminMessage: vi.fn(),
  createAdminProgress: vi.fn(),
  deleteAdminGoal: vi.fn().mockResolvedValue({}),
  deleteAdminMaterial: vi.fn().mockResolvedValue({}),
  deleteAdminMessage: vi.fn().mockResolvedValue({}),
  deleteAdminProgress: vi.fn().mockResolvedValue({}),
  getAdminBookings: vi.fn().mockResolvedValue([]),
  getAdminGoals: vi.fn().mockResolvedValue([
    { id: 1, title: 'Meta pendiente', description: '', is_completed: false, due_date: '2099-01-01' },
    { id: 2, title: 'Meta completada', description: '', is_completed: true, due_date: '2099-01-01' },
  ]),
  getAdminLessons: vi.fn().mockResolvedValue([]),
  getAdminMaterials: vi.fn().mockResolvedValue([
    {
      id: 101,
      title: 'Guia visible',
      description: 'Material activo para el alumno',
      resource_type: 'pdf',
      is_active: true,
      can_delete: true,
      created_by: { username: 'ester' },
      external_url: 'https://example.com/guia-visible',
      uploaded_file: null,
    },
    {
      id: 102,
      title: 'Recurso oculto',
      description: 'Material desactivado',
      resource_type: 'link',
      is_active: false,
      can_delete: false,
      created_by: { username: 'otro' },
      external_url: 'https://example.com/recurso-oculto',
      uploaded_file: null,
    },
  ]),
  getAdminMessages: vi.fn().mockResolvedValue([
    { id: 11, subject: 'Pendiente de leer', body: 'Mensaje no leido', is_read: false },
    { id: 12, subject: 'Mensaje leido', body: 'Mensaje ya revisado', is_read: true },
  ]),
  getAdminProgress: vi.fn().mockResolvedValue([
    { id: 21, completed: false, score: 40, lesson: { id: 1, title: 'Clase pendiente' }, notes: '' },
    { id: 22, completed: true, score: 95, lesson: { id: 2, title: 'Clase completada' }, notes: '' },
  ]),
  getAdminStudents: vi.fn().mockResolvedValue([
    {
      id: 1,
      username: 'ana',
      first_name: 'Ana',
      last_name: 'Test',
      email: 'ana@example.com',
      language_level: 'A2',
      is_active: true,
      booking_count: 0,
      upcoming_bookings: 0,
      bio: '',
    },
    {
      id: 2,
      username: 'luis',
      first_name: 'Luis',
      last_name: 'Test',
      email: 'luis@example.com',
      language_level: 'B1',
      is_active: true,
      booking_count: 0,
      upcoming_bookings: 0,
      bio: '',
    },
  ]),
  updateAdminGoal: vi.fn(),
  updateAdminMaterial: vi.fn(),
  updateAdminMessage: vi.fn(),
  updateAdminBooking: vi.fn(),
  updateAdminProgress: vi.fn(),
  updateAdminStudent: vi.fn(),
}));

import {
  getAdminGoals,
  deleteAdminGoal,
  deleteAdminMessage,
  deleteAdminProgress,
} from '../services/adminPortal';

describe('EsterDashboard student editor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    sessionStorage.setItem('ester_dashboard_auth', 'Basic demo-auth');
  });

  it('filters goals by status and updates visible counter', async () => {
    render(<EsterDashboard />);

    fireEvent.click(await screen.findByRole('button', { name: /Estudiantes/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Metas' }));

    await screen.findByText('Meta pendiente');
    await screen.findByText('Meta completada');

    const goalsFilterContainer = screen.getByText('Filtro de metas').closest('div');
    const goalsFilterSelect = goalsFilterContainer?.querySelector('select');
    if (!goalsFilterSelect) {
      throw new Error('No se encontro el select de filtro de metas');
    }
    fireEvent.change(goalsFilterSelect, {
      target: { value: 'completed' },
    });

    expect(screen.getByText('Meta completada')).toBeInTheDocument();
    expect(screen.queryByText('Meta pendiente')).not.toBeInTheDocument();
  });

  it('restores saved tab and asks confirmation before deleting a goal', async () => {
    sessionStorage.setItem('ester_student_editor_tab_1', 'goals');

    render(<EsterDashboard />);

    fireEvent.click(await screen.findByRole('button', { name: /Estudiantes/i }));

    await screen.findByText('Metas del estudiante');

    const pendingGoalCard = screen.getByText('Meta pendiente').closest('.text-xs.border');
    if (!pendingGoalCard) {
      throw new Error('No se encontro la tarjeta de meta pendiente');
    }

    fireEvent.click(within(pendingGoalCard).getByRole('button', { name: 'Eliminar' }));
    const confirmTitle = await screen.findByText('Confirmar eliminacion');
    const confirmModal = confirmTitle.closest('.w-full.max-w-md');
    if (!confirmModal) {
      throw new Error('No se encontro el modal de confirmacion');
    }

    fireEvent.click(within(confirmModal).getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => {
      expect(deleteAdminGoal).not.toHaveBeenCalled();
    });

    fireEvent.click(within(pendingGoalCard).getByRole('button', { name: 'Eliminar' }));
    const confirmTitleSecond = await screen.findByText('Confirmar eliminacion');
    const confirmModalSecond = confirmTitleSecond.closest('.w-full.max-w-md');
    if (!confirmModalSecond) {
      throw new Error('No se encontro el modal de confirmacion para eliminar');
    }
    fireEvent.click(within(confirmModalSecond).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => {
      expect(deleteAdminGoal).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Meta eliminada.').length).toBeGreaterThan(0);
    });
    expect(getAdminGoals).toHaveBeenCalled();
  });

  it('filters messages, persists selected tab, and confirms deletion flow', async () => {
    render(<EsterDashboard />);

    fireEvent.click(await screen.findByRole('button', { name: /Estudiantes/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Mensajes' }));

    await screen.findByText('Mostrando 2 de 2 mensajes');
    expect(sessionStorage.getItem('ester_student_editor_tab_1')).toBe('messages');

    const messagesFilterContainer = screen.getByText('Filtro de mensajes').closest('div');
    const messagesFilterSelect = messagesFilterContainer?.querySelector('select');
    if (!messagesFilterSelect) {
      throw new Error('No se encontro el select de filtro de mensajes');
    }

    fireEvent.change(messagesFilterSelect, { target: { value: 'unread' } });
    await screen.findByText('Mostrando 1 de 2 mensajes');
    expect(screen.getByText('Pendiente de leer')).toBeInTheDocument();
    expect(screen.queryByText('Mensaje leido')).not.toBeInTheDocument();

    const unreadCard = screen.getByText('Pendiente de leer').closest('.text-xs.border');
    if (!unreadCard) {
      throw new Error('No se encontro la tarjeta de mensaje no leido');
    }

    fireEvent.click(within(unreadCard).getByRole('button', { name: 'Eliminar' }));
    const modalTitle = await screen.findByText('Confirmar eliminacion');
    const modal = modalTitle.closest('.w-full.max-w-md');
    if (!modal) {
      throw new Error('No se encontro el modal para eliminar mensaje');
    }

    fireEvent.click(within(modal).getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => {
      expect(deleteAdminMessage).not.toHaveBeenCalled();
    });

    fireEvent.click(within(unreadCard).getByRole('button', { name: 'Eliminar' }));
    const modalTitleSecond = await screen.findByText('Confirmar eliminacion');
    const modalSecond = modalTitleSecond.closest('.w-full.max-w-md');
    if (!modalSecond) {
      throw new Error('No se encontro el modal para confirmar mensaje');
    }
    fireEvent.click(within(modalSecond).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => {
      expect(deleteAdminMessage).toHaveBeenCalledTimes(1);
    });
  });

  it('filters progress records and confirms progress deletion', async () => {
    render(<EsterDashboard />);

    fireEvent.click(await screen.findByRole('button', { name: /Estudiantes/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Progreso' }));

    await screen.findByText('Mostrando 2 de 2 registros');

    const progressFilterContainer = screen.getByText('Filtro de progreso').closest('div');
    const progressFilterSelect = progressFilterContainer?.querySelector('select');
    if (!progressFilterSelect) {
      throw new Error('No se encontro el select de filtro de progreso');
    }

    fireEvent.change(progressFilterSelect, { target: { value: 'completed' } });
    await screen.findByText('Mostrando 1 de 2 registros');
    expect(screen.getByText('Clase completada')).toBeInTheDocument();
    expect(screen.queryByText('Clase pendiente')).not.toBeInTheDocument();

    const completedCard = screen.getByText('Clase completada').closest('.text-xs.border');
    if (!completedCard) {
      throw new Error('No se encontro la tarjeta de progreso completado');
    }

    fireEvent.click(within(completedCard).getByRole('button', { name: 'Eliminar' }));
    const modalTitle = await screen.findByText('Confirmar eliminacion');
    const modal = modalTitle.closest('.w-full.max-w-md');
    if (!modal) {
      throw new Error('No se encontro el modal para eliminar progreso');
    }

    fireEvent.click(within(modal).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => {
      expect(deleteAdminProgress).toHaveBeenCalledTimes(1);
    });
  });

  it('requires confirmation modal to delete progress and supports cancel', async () => {
    render(<EsterDashboard />);

    fireEvent.click(await screen.findByRole('button', { name: /Estudiantes/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Progreso' }));

    await screen.findByText('Clase pendiente');

    const pendingProgressCard = screen.getByText('Clase pendiente').closest('.text-xs.border');
    if (!pendingProgressCard) {
      throw new Error('No se encontro la tarjeta de progreso pendiente');
    }

    fireEvent.click(within(pendingProgressCard).getByRole('button', { name: 'Eliminar' }));

    const modalTitle = await screen.findByText('Confirmar eliminacion');
    const modal = modalTitle.closest('.w-full.max-w-md');
    if (!modal) {
      throw new Error('No se encontro el modal de confirmacion para progreso');
    }

    fireEvent.click(within(modal).getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(deleteAdminProgress).not.toHaveBeenCalled();
    });

    fireEvent.click(within(pendingProgressCard).getByRole('button', { name: 'Eliminar' }));

    const modalTitleSecond = await screen.findByText('Confirmar eliminacion');
    const modalSecond = modalTitleSecond.closest('.w-full.max-w-md');
    if (!modalSecond) {
      throw new Error('No se encontro el modal de confirmacion para eliminar progreso');
    }
    fireEvent.click(within(modalSecond).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => {
      expect(deleteAdminProgress).toHaveBeenCalledTimes(1);
    });
  });

  it('filters materials by visibility and updates counter', async () => {
    render(<EsterDashboard />);

    fireEvent.click(await screen.findByRole('button', { name: /Estudiantes/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Materiales' }));

    await screen.findByText('Guia visible');
    await screen.findByText('Recurso oculto');

    const visibilityFilterContainer = screen.getByText('Visibilidad').closest('div');
    const visibilityFilterSelect = visibilityFilterContainer?.querySelector('select');
    if (!visibilityFilterSelect) {
      throw new Error('No se encontro el select de visibilidad');
    }

    fireEvent.change(visibilityFilterSelect, { target: { value: 'hidden' } });

    expect(screen.getByText('Recurso oculto')).toBeInTheDocument();
    expect(screen.queryByText('Guia visible')).not.toBeInTheDocument();
  });
});
