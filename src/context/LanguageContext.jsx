import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) {
        return savedLanguage;
      }

      const browserLanguage = (navigator.language || '').toLowerCase();
      if (browserLanguage.startsWith('cs')) {
        return 'cz';
      }
      if (browserLanguage.startsWith('es')) {
        return 'es';
      }

      return 'sk';
    } catch (error) {
      console.warn('localStorage not available:', error);
      return 'sk';
    }
  });

  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Save language
    try {
      localStorage.setItem('language', language);
    } catch (error) {
      console.warn('Could not save language:', error);
    }

    const langMap = { sk: 'sk', cz: 'cs', es: 'es' };
    document.documentElement.lang = langMap[language] || 'sk';

    // Load translations dynamically
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        // Dynamic import
        const module = await import(`../locales/${language}.js`);
        setTranslations(module.default);
      } catch (error) {
        console.error(`Failed to load translations for ${language}`, error);
        // Fallback or retry logic could go here
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  // Prevent blank screen until initial translations are loaded.
  if (isLoading && Object.keys(translations).length === 0) {
    const loadingCopy = {
      sk: 'Načítavam obsah...',
      cz: 'Načítám obsah...',
      es: 'Cargando contenido...'
    };
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm font-medium tracking-wide text-primary">habluj</p>
          <p className="mt-2 text-muted-foreground">{loadingCopy[language] || loadingCopy.sk}</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, translations, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
