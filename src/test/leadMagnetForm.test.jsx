import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LeadMagnetForm from '../components/LeadMagnetForm';

const submitLeadCaptureMock = vi.fn();

vi.mock('../services/leads', () => ({
  submitLeadCapture: (...args) => submitLeadCaptureMock(...args),
}));

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key) => key,
    language: 'es',
  }),
}));

describe('LeadMagnetForm level quiz', () => {
  beforeEach(() => {
    submitLeadCaptureMock.mockReset();
    submitLeadCaptureMock.mockResolvedValue({ id: 1 });
  });

  it('sends quiz metadata in lead notes', async () => {
    render(<LeadMagnetForm source="homepage_cta" />);

    fireEvent.change(screen.getByLabelText('leadMagnet.namePlaceholder'), {
      target: { value: 'Ana Student' },
    });
    fireEvent.change(screen.getByLabelText('leadMagnet.emailPlaceholder'), {
      target: { value: 'ana@example.com' },
    });

    fireEvent.change(screen.getByLabelText('leadMagnet.levelLabel'), {
      target: { value: 'intermediate' },
    });
    fireEvent.change(screen.getByLabelText('leadMagnet.goalLabel'), {
      target: { value: 'work' },
    });
    fireEvent.change(screen.getByLabelText('leadMagnet.paceLabel'), {
      target: { value: 'intensive' },
    });
    fireEvent.change(screen.getByLabelText('leadMagnet.formatLabel'), {
      target: { value: 'small_group' },
    });
    fireEvent.change(screen.getByLabelText('leadMagnet.availabilityLabel'), {
      target: { value: 'weekends' },
    });
    fireEvent.change(screen.getByLabelText('leadMagnet.startLabel'), {
      target: { value: 'one_month' },
    });
    fireEvent.change(screen.getByLabelText('leadMagnet.experienceLabel'), {
      target: { value: 'academy' },
    });
    fireEvent.change(screen.getByLabelText('leadMagnet.confidence.speakingLabel'), {
      target: { value: 'medium' },
    });
    fireEvent.change(screen.getByLabelText('leadMagnet.confidence.listeningLabel'), {
      target: { value: 'high' },
    });
    fireEvent.change(screen.getByLabelText('leadMagnet.confidence.grammarLabel'), {
      target: { value: 'medium' },
    });
    fireEvent.change(screen.getByLabelText('leadMagnet.motivationLabel'), {
      target: { value: 'Quiero mejorar para reuniones y entrevistas.' },
    });

    fireEvent.click(screen.getByLabelText('leadMagnet.privacyConsent'));

    fireEvent.click(screen.getByRole('button', { name: 'leadMagnet.submit' }));

    await waitFor(() => {
      expect(submitLeadCaptureMock).toHaveBeenCalledTimes(1);
      expect(submitLeadCaptureMock).toHaveBeenCalledWith(expect.objectContaining({
        source: 'homepage_cta',
        notes: 'quiz_level:intermediate | quiz_goal:work | quiz_pace:intensive | quiz_format:small_group | quiz_availability:weekends | quiz_start:one_month | quiz_experience:academy | quiz_confidence_speaking:medium | quiz_confidence_listening:high | quiz_confidence_grammar:medium | quiz_motivation:Quiero mejorar para reuniones y entrevistas.',
      }));
    });
  });

  it('maps legacy source lead_magnet to level_quiz', async () => {
    render(<LeadMagnetForm source="lead_magnet" />);

    fireEvent.change(screen.getByLabelText('leadMagnet.namePlaceholder'), {
      target: { value: 'Pedro Student' },
    });
    fireEvent.change(screen.getByLabelText('leadMagnet.emailPlaceholder'), {
      target: { value: 'pedro@example.com' },
    });
    fireEvent.change(screen.getByLabelText('leadMagnet.motivationLabel'), {
      target: { value: 'Necesito un plan claro para volver a estudiar.' },
    });
    fireEvent.click(screen.getByLabelText('leadMagnet.privacyConsent'));

    fireEvent.click(screen.getByRole('button', { name: 'leadMagnet.submit' }));

    await waitFor(() => {
      expect(submitLeadCaptureMock).toHaveBeenCalledTimes(1);
      expect(submitLeadCaptureMock).toHaveBeenCalledWith(expect.objectContaining({
        source: 'level_quiz',
      }));
    });
  });
});
