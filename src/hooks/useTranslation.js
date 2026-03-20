import { useLanguage } from '../context/LanguageContext';

export const useTranslation = () => {
  const { language, translations } = useLanguage();

  const t = (key) => {
    return translations?.[key] || key;
  };

  return { t, language };
};
