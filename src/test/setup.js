import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Runs a cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.stubEnv('VITE_CONTACT_EMAIL', 'test@example.com');
vi.stubEnv('VITE_CONTACT_INSTAGRAM', 'habluj_sk');
