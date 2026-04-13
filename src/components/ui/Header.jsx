import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../context/AuthContext';
import { SETMORE_BOOKING_URL } from '../../utils/setmore';
import { getLocalizedPath, stripLanguagePrefix } from '../../utils/seo';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { changeLanguage, language } = useLanguage();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const authBaseTarget = isAuthenticated ? '/student-dashboard' : '/login';
  const authTarget = getLocalizedPath(authBaseTarget, language);
  const authLabel = isAuthenticated ? t('header.dashboard') : t('header.login');

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

  const navigationItems = [
    { path: getLocalizedPath('/', language), label: t('header.home'), icon: 'Home' },
    { path: getLocalizedPath('/about-the-teacher', language), label: t('header.about'), icon: 'User' },
    { path: getLocalizedPath('/tutoring-services', language), label: t('header.services'), icon: 'BookOpen' }
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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-soft' : 'bg-white'
      }`}>
        <div className="w-full">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Logo */}
            <Link to={getLocalizedPath('/', language)} className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-cultural rounded-lg flex items-center justify-center shadow-warm group-hover:shadow-cultural transition-all duration-300">
                  <span className="text-white font-headlines font-bold text-lg">H</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-headlines font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                  Habl<span className="text-primary">uj</span>
                </h1>
                <p className="text-xs text-muted-foreground font-accent">{t('header.tagline')}</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {[...navigationItems, ...secondaryItems].map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  aria-current={isActivePath(item?.path) ? 'page' : undefined}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
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
              <Link to={authTarget}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {authLabel}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md text-foreground hover:text-primary hover:bg-muted transition-colors"
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`} aria-hidden={!isMobileMenuOpen}>
          <div className="bg-white border-t border-border shadow-soft max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav id="mobile-navigation" className="px-4 py-4 space-y-2" aria-label="Mobile navigation">
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
                <Link to={authTarget} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    fullWidth
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    {authLabel}
                  </Button>
                </Link>
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
