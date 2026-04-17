import React from 'react';
import { Link } from 'react-router-dom';

import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { getLocalizedPath } from '../../../utils/seo';

const HeroSection = () => {
  const { t, language } = useTranslation();
  const trustBadges = [t('hero.trust1'), t('hero.trust2'), t('hero.trust3')];

  return (
    <section className="relative min-h-screen bg-gradient-warm flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10 w-full h-full">
        <div className="grid lg:grid-cols-2 gap-12 items-stretch h-full">
          {/* Content */}
          <div className="space-y-8 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-soft">
                <Icon name="MapPin" size={14} className="text-primary" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{t('hero.marketBadge')}</span>
              </div>
              {trustBadges.map((badge) => (
                <div key={badge} className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/80 px-3 py-1">
                  <Icon name="CheckCircle" size={14} className="text-success" />
                  <span className="text-xs font-medium text-foreground">{badge}</span>
                </div>
              ))}
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-headlines font-bold text-foreground leading-tight">
                {(() => {
                  const title = t('hero.title');
                  const highlight = t('hero.highlight');

                  if (title.includes('{highlight}')) {
                    const parts = title.split('{highlight}');
                    return (
                      <>
                        {parts[0]}
                        <span className="text-primary">{highlight}</span>
                        {parts[1]}
                      </>
                    );
                  }

                  // Fallback si no hay {highlight}
                  return (
                    <>
                      {title} <span className="text-primary">{highlight}</span>
                    </>
                  );
                })()}
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground font-accent leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* CTA principal unico */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link to={getLocalizedPath('/booking-system', language)}>
                <Button
                  variant="default"
                  size="lg"
                  className="bg-cta hover:bg-cta/90 text-white shadow-warm hover:shadow-cultural transition-all duration-300 hover:scale-105"
                  iconName="Calendar"
                  iconPosition="left"
                >
                  {t('hero.bookLesson')}
                </Button>
              </Link>
              <Link to={getLocalizedPath('/intensive-courses', language)}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-white transition-all"
                  iconName="Zap"
                  iconPosition="left"
                >
                  {t('hero.intensiveCourses')}
                </Button>
              </Link>
              <a href="#method-demo" className="text-sm text-primary hover:text-primary/80 underline underline-offset-4">
                {t('hero.watchVideo')}
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{t('hero.stat1Value')}</div>
                <div className="text-sm text-muted-foreground">{t('hero.stat1Label')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{t('hero.stat2Value')}</div>
                <div className="text-sm text-muted-foreground">{t('hero.stat2Label')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{t('hero.stat3Value')}</div>
                <div className="text-sm text-muted-foreground">{t('hero.stat3Label')}</div>
              </div>
            </div>
          </div>

          {/* Hero Image: Ester Portrait + Trust Card */}
          <div className="relative w-full h-full min-h-96 flex items-center justify-center">
            <div className="relative z-10 w-full h-full">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-cultural bg-gray-200">
                {/* Ester Portrait Image */}
                <div className="relative w-full h-full">
                  <img
                    src="/assets/images/ester-placeholder.webp"
                    alt="Ester - Tu profesora de español"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width="600"
                    height="700"
                  />
                  {/* Dark Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Trust Card Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/30">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon name="CheckCircle" size={18} className="text-success" />
                        <p className="text-sm font-semibold text-foreground">{t('hero.trust2')}</p>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        "4+ años enseñando español a checos y eslovacos. 40+ estudiantes satisfechos."
                      </p>
                      <Link to={getLocalizedPath('/about-the-teacher', language)} className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-xs font-medium underline">
                        Conoce mi historia <Icon name="ArrowRight" size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
              <div className="cultural-bridge rounded-2xl w-full h-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-70" aria-hidden="true">
        <Icon name="ChevronDown" size={24} className="text-muted-foreground" />
      </div>
    </section>
  );
};

export default HeroSection;
