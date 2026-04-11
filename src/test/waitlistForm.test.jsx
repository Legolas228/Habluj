import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import WaitlistForm from '../components/WaitlistForm';

const submitLeadCaptureMock = vi.fn();

vi.mock('../services/leads', () => ({
  submitLeadCapture: (...args) => submitLeadCaptureMock(...args),
}));

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key) => key,
    language: 'sk',
  }),
}));

describe('WaitlistForm', () => {
  beforeEach(() => {
    submitLeadCaptureMock.mockReset();
    submitLeadCaptureMock.mockResolvedValue({ id: 1 });
  });

  it('sends waitlist source for small groups when selected', async () => {
    render(<WaitlistForm preferredCourseType="small_group" />);

    fireEvent.change(screen.getByLabelText('waitlist.namePlaceholder'), {
      target: { value: 'Ana Student' },
    });
    fireEvent.change(screen.getByLabelText('waitlist.emailPlaceholder'), {
      target: { value: 'ana@example.com' },
    });
    fireEvent.click(screen.getByLabelText('waitlist.privacyConsent'));

    fireEvent.click(screen.getByRole('button', { name: 'waitlist.submit' }));

    await waitFor(() => {
      expect(submitLeadCaptureMock).toHaveBeenCalledTimes(1);
      expect(submitLeadCaptureMock).toHaveBeenCalledWith(expect.objectContaining({
        source: 'waitlist_small_group',
      }));
    });
  });

  it('switches source to intensive waitlist when intensive course is selected', async () => {
    render(<WaitlistForm preferredCourseType="small_group" />);

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'intensive' },
    });

    fireEvent.change(screen.getByLabelText('waitlist.namePlaceholder'), {
      target: { value: 'Pedro Student' },
    });
    fireEvent.change(screen.getByLabelText('waitlist.emailPlaceholder'), {
      target: { value: 'pedro@example.com' },
    });
    fireEvent.click(screen.getByLabelText('waitlist.privacyConsent'));

    fireEvent.click(screen.getByRole('button', { name: 'waitlist.submit' }));

    await waitFor(() => {
      expect(submitLeadCaptureMock).toHaveBeenCalledTimes(1);
      expect(submitLeadCaptureMock).toHaveBeenCalledWith(expect.objectContaining({
        source: 'waitlist_intensive',
      }));
    });
  });

  it('includes intensive course metadata in notes for intensive waitlist', async () => {
    render(<WaitlistForm preferredCourseType="intensive" />);

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], {
      target: { value: 'intensive_dele' },
    });

    fireEvent.change(screen.getByLabelText('waitlist.namePlaceholder'), {
      target: { value: 'Lara Student' },
    });
    fireEvent.change(screen.getByLabelText('waitlist.emailPlaceholder'), {
      target: { value: 'lara@example.com' },
    });
    fireEvent.change(screen.getByLabelText('waitlist.messagePlaceholder'), {
      target: { value: 'Quiero prepararme para examen' },
    });
    fireEvent.click(screen.getByLabelText('waitlist.privacyConsent'));

    fireEvent.click(screen.getByRole('button', { name: 'waitlist.submit' }));

    await waitFor(() => {
      expect(submitLeadCaptureMock).toHaveBeenCalledTimes(1);
      expect(submitLeadCaptureMock).toHaveBeenCalledWith(expect.objectContaining({
        source: 'waitlist_intensive',
        notes: '[COURSE:intensive_dele]\nQuiero prepararme para examen',
      }));
    });
  });

  it('does not include intensive metadata in notes for small groups waitlist', async () => {
    render(<WaitlistForm preferredCourseType="small_group" />);

    fireEvent.change(screen.getByLabelText('waitlist.namePlaceholder'), {
      target: { value: 'Nora Student' },
    });
    fireEvent.change(screen.getByLabelText('waitlist.emailPlaceholder'), {
      target: { value: 'nora@example.com' },
    });
    fireEvent.change(screen.getByLabelText('waitlist.messagePlaceholder'), {
      target: { value: 'Prefiero martes por la tarde' },
    });
    fireEvent.click(screen.getByLabelText('waitlist.privacyConsent'));

    fireEvent.click(screen.getByRole('button', { name: 'waitlist.submit' }));

    await waitFor(() => {
      expect(submitLeadCaptureMock).toHaveBeenCalledTimes(1);
      expect(submitLeadCaptureMock).toHaveBeenCalledWith(expect.objectContaining({
        source: 'waitlist_small_group',
        notes: 'Prefiero martes por la tarde',
      }));
    });
  });
});
