import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import { SETMORE_BOOKING_URL } from '../../utils/setmore';
import { getLocalizedPath, stripLanguagePrefix } from '../../utils/seo';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuToggleRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { changeLanguage, language } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location?.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      setIsMobileMenuOpen(false);
      menuToggleRef.current?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const navigationItems = [
    { path: getLocalizedPath('/', language), label: t('header.home'), icon: 'Home' },
    { path: getLocalizedPath('/about-the-teacher', language), label: t('header.about'), icon: 'User' },
    { path: getLocalizedPath('/tutoring-services', language), label: t('header.services'), icon: 'BookOpen' },
    { path: getLocalizedPath('/ebook', language), label: t('header.ebook'), icon: 'Book' }
  ];

  const secondaryItems = [
    { path: getLocalizedPath('/contact', language), label: t('header.contact'), icon: 'Mail' }
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLanguageChange = (targetLanguage) => {
    changeLanguage(targetLanguage);
    const pathWithoutLanguage = stripLanguagePrefix(location.pathname || '/');
    const nextPath = getLocalizedPath(pathWithoutLanguage, targetLanguage);
    navigate(nextPath, { replace: false });
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-soft"
      >
        {t('header.skipToContent')}
      </a>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-soft' : 'bg-white'
      }`}>
        <div className="w-full">
          <div className="flex h-16 items-center justify-between px-3 sm:px-4 lg:px-6">
            {/* Logo */}
            <Link to={getLocalizedPath('/', language)} className="flex items-center space-x-3 group">
              <img
                src="/assets/images/logo-habluj.jpg"
                alt="Habluj"
                className="h-11 w-auto max-w-[118px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="hidden sm:block border-l border-border pl-3">
                <p className="text-xs text-muted-foreground font-accent">{t('header.tagline')}</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-0 lg:flex xl:space-x-1">
              {[...navigationItems, ...secondaryItems].map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  aria-current={isActivePath(item?.path) ? 'page' : undefined}
                  className={`flex items-center space-x-1 rounded-md px-2 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary xl:space-x-2 xl:px-3 ${
                    isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'text-foreground hover:text-primary hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={16} />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </nav>

            {/* Desktop Language Flags */}
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={() => handleLanguageChange('sk')}
                className={`text-2xl hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm ${language === 'sk' ? 'opacity-100 ring-2 ring-primary/30' : 'opacity-75'}`}
                title="Slovenčina"
                aria-label="Prepnúť do slovenčiny"
                aria-pressed={language === 'sk'}
              >
                🇸🇰
              </button>
              <button
                onClick={() => handleLanguageChange('cz')}
                className={`text-2xl hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm ${language === 'cz' ? 'opacity-100 ring-2 ring-primary/30' : 'opacity-75'}`}
                title="Čeština"
                aria-label="Přepnout do češtiny"
                aria-pressed={language === 'cz'}
              >
                🇨🇿
              </button>
              <button
                onClick={() => handleLanguageChange('es')}
                className={`text-2xl hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm ${language === 'es' ? 'opacity-100 ring-2 ring-primary/30' : 'opacity-75'}`}
                title="Español"
                aria-label="Cambiar a español"
                aria-pressed={language === 'es'}
              >
                🇪🇸
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <a href={SETMORE_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-cta hover:bg-cta/90 text-white shadow-warm"
                >
                  {t('header.book')}
                </Button>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              ref={menuToggleRef}
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md text-foreground hover:text-primary hover:bg-muted transition-colors"
              aria-label={isMobileMenuOpen ? t('header.closeMenu') : t('header.openMenu')}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          data-testid="mobile-menu-panel"
          className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isMobileMenuOpen}
          {...(!isMobileMenuOpen ? { inert: '' } : {})}
        >
          <div className="bg-white border-t border-border shadow-soft max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav id="mobile-navigation" className="px-4 py-4 space-y-2" aria-label={t('header.mobileNav')}>
              {[...navigationItems, ...secondaryItems].map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActivePath(item?.path) ? 'page' : undefined}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:text-primary hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={18} />
                  <span>{item?.label}</span>
                </Link>
              ))}
              
              <div className="pt-4 border-t border-border space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleLanguageChange('sk')}
                    className={`text-xl p-2 rounded-md transition-colors ${language === 'sk' ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted/60'}`}
                    title="Slovenčina"
                    aria-label="Prepnúť do slovenčiny"
                    aria-pressed={language === 'sk'}
                  >
                    🇸🇰
                  </button>
                  <button
                    onClick={() => handleLanguageChange('cz')}
                    className={`text-xl p-2 rounded-md transition-colors ${language === 'cz' ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted/60'}`}
                    title="Čeština"
                    aria-label="Přepnout do češtiny"
                    aria-pressed={language === 'cz'}
                  >
                    🇨🇿
                  </button>
                  <button
                    onClick={() => handleLanguageChange('es')}
                    className={`text-xl p-2 rounded-md transition-colors ${language === 'es' ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted/60'}`}
                    title="Español"
                    aria-label="Cambiar a español"
                    aria-pressed={language === 'es'}
                  >
                    🇪🇸
                  </button>
                </div>
                <a href={SETMORE_BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    variant="default" 
                    fullWidth
                    className="bg-cta hover:bg-cta/90 text-white"
                  >
                    {t('header.book')}
                  </Button>
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>
      {/* Header Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;
