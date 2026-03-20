import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTranslation } from '../hooks/useTranslation';
import * as LanguageContext from '../context/LanguageContext';
import sk from '../locales/sk';
import es from '../locales/es';

// Mock the language context
vi.mock('../context/LanguageContext', () => ({
  useLanguage: vi.fn(),
  LanguageProvider: ({ children }) => children,
}));

describe('useTranslation', () => {
  it('returns translation key if translation does not exist', () => {
    // Setup mock to return 'sk' language
    vi.spyOn(LanguageContext, 'useLanguage').mockReturnValue({ language: 'sk', translations: sk });
    
    const { result } = renderHook(() => useTranslation());
    
    // Testing a non-existent key
    expect(result.current.t('non.existent.key')).toBe('non.existent.key');
  });

  it('translates correctly with existing keys', () => {
    vi.spyOn(LanguageContext, 'useLanguage').mockReturnValue({ language: 'sk', translations: sk });
    const { result } = renderHook(() => useTranslation());
    
    // Test base translation
    expect(result.current.t('header.home')).toBe('Domov');
  });

  it('switches translations when language changes', () => {
    vi.spyOn(LanguageContext, 'useLanguage').mockReturnValue({ language: 'es', translations: es });
    const { result } = renderHook(() => useTranslation());
    
    expect(result.current.t('header.home')).toBe('Inicio');
  });
});
