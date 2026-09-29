import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EsterDashboard from '../pages/ester-dashboard';

const leads = vi.hoisted(() => [
  { id: 1, full_name: 'Ana Contacto', email: 'ana@example.com', phone: '+34 600 000 001', preferred_language: 'es', source: 'contact_form', stage: 'new', notes: 'inquiry:general | subject:Clases\nNecesito información.', consent_privacy: true, consent_marketing: false, created_at: '2026-06-20T10:00:00Z' },
  { id: 2, full_name: 'Luis Test', email: 'luis@example.com', preferred_language: 'sk', source: 'advanced_level_test', stage: 'qualified', notes: 'test_type:advanced_spanish_b2_ceiling | test_score:11/15 | test_band:B2 solido | q1:c | q2:a', consent_privacy: true, created_at: '2026-06-21T10:00:00Z' },
  { id: 3, full_name: 'Lucia Waitlist', email: 'lucia@example.com', phone: '+34 600 111 222', preferred_language: 'cz', source: 'waitlist_intensive', stage: 'new', notes: '[COURSE:intensive_a2]\nHorario de tarde', consent_privacy: true, created_at: '2026-06-22T10:00:00Z' },
]);

vi.mock('../services/leads', () => ({
  getLeadDetail: vi.fn().mockImplementation(({ leadId }) => Promise.resolve({ ...leads.find((lead) => lead.id === leadId), activities: [] })),
  getLeads: vi.fn().mockResolvedValue(leads),
  loginAdminWithPassword: vi.fn(),
  updateLeadStage: vi.fn().mockImplementation(({ leadId, stage }) => Promise.resolve({ id: leadId, stage })),
}));

describe('EsterDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    sessionStorage.setItem('ester_dashboard_auth', 'Token demo-auth');
  });

  it('muestra únicamente las tres bandejas de información', async () => {
    render(<EsterDashboard />);
    expect(await screen.findByRole('button', { name: /Mensajes/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pruebas de nivel/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lista de espera/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Estudiantes/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reservas/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Agenda/ })).not.toBeInTheDocument();
  });

  it('muestra el detalle completo de un mensaje de la web', async () => {
    render(<EsterDashboard />);
    fireEvent.click(await screen.findByRole('button', { name: /Ana Contacto/ }));
    expect(await screen.findByText(/Necesito información/)).toBeInTheDocument();
    expect(screen.getAllByText('ana@example.com').length).toBeGreaterThan(0);
    expect(screen.getByText('Consentimiento de privacidad')).toBeInTheDocument();
  });

  it('muestra puntuación, nivel y respuestas de las pruebas', async () => {
    render(<EsterDashboard />);
    fireEvent.click(await screen.findByRole('button', { name: /Pruebas de nivel/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Luis Test/ }));
    expect((await screen.findAllByText('11/15')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('B2 solido').length).toBeGreaterThan(0);
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('Q2')).toBeInTheDocument();
  });

  it('identifica el curso concreto de una solicitud de lista de espera', async () => {
    render(<EsterDashboard />);
    fireEvent.click(await screen.findByRole('button', { name: /Lista de espera/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Lucia Waitlist/ }));
    expect(await screen.findByText('Intensivo de verano A2')).toBeInTheDocument();
  });

  it('permite actualizar el estado de seguimiento', async () => {
    render(<EsterDashboard />);
    fireEvent.click(await screen.findByRole('button', { name: /Ana Contacto/ }));
    await screen.findByText('Mensaje web');
    const status = screen.getAllByRole('combobox')[0];
    fireEvent.change(status, { target: { value: 'qualified' } });
    await waitFor(() => expect(status).toHaveValue('qualified'));
  });
});
