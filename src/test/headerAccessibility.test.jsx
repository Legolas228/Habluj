import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import Header from '../components/ui/Header';

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'sk',
    changeLanguage: vi.fn(),
  }),
}));

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key) => key,
    language: 'sk',
  }),
}));

const renderHeader = () =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Header />
    </MemoryRouter>,
  );

describe('Header accessibility', () => {
  it('exposes a skip link that targets main content', () => {
    renderHeader();

    const skipLink = screen.getByRole('link', { name: 'header.skipToContent' });
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('closes the mobile menu on Escape and returns focus to the toggle', () => {
    renderHeader();

    const toggle = screen.getByRole('button', { name: 'header.openMenu' });
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'header.closeMenu' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.getByRole('button', { name: 'header.openMenu' })).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(toggle);
  });

  it('keeps the collapsed mobile menu out of the tab order', () => {
    renderHeader();
    const mobilePanel = screen.getByTestId('mobile-menu-panel');

    expect(mobilePanel).toHaveAttribute('aria-hidden', 'true');
    expect(mobilePanel.hasAttribute('inert')).toBe(true);
  });
});
