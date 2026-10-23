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
    <section className="relative bg-gradient-warm overflow-hidden pt-24 pb-12 lg:min-h-screen lg:pt-0 lg:pb-0 lg:flex lg:items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Content */}
          <div className="space-y-6 lg:space-y-8 flex flex-col justify-center">
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
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-headlines font-bold text-foreground leading-tight">
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
              <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground font-accent leading-relaxed">
                {t('hero.subtitle')}
              </p>
              <a
                href="#method-demo"
                className="inline-flex text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
              >
                {t('hero.watchVideo')}
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 border-t border-border/50 pt-6 sm:grid-cols-3 sm:gap-4 sm:pt-8">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">{t('hero.stat1Value')}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('hero.stat1Label')}</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-secondary">{t('hero.stat2Value')}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('hero.stat2Label')}</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-accent">{t('hero.stat3Value')}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('hero.stat3Label')}</div>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                to={`${getLocalizedPath('/tutoring-services', language)}?course=group_maturita#course-waitlist`}
                className="inline-flex w-full items-center gap-3 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 px-5 py-4 text-base font-bold text-primary shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-cultural"
              >
                <Icon name="Sparkles" size={20} />
                <span>{t('hero.maturitaNotice')}</span>
              </Link>
              <Link to={getLocalizedPath('/level-questionnaire', language)} className="block w-full sm:w-fit">
                <Button
                  variant="default"
                  size="xl"
                  className="h-14 w-full rounded-xl bg-cta px-8 text-lg font-bold text-white shadow-warm hover:bg-cta/90 hover:shadow-cultural transition-all duration-300 hover:scale-[1.02]"
                  iconName="Zap"
                  iconPosition="left"
                >
                  {t('hero.bookLesson')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image: Ester Portrait + Trust Card */}
          <div className="relative w-full min-h-[300px] sm:min-h-96 lg:min-h-[520px] flex items-center justify-center">
            <div className="relative z-10 w-full h-full">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-cultural bg-gray-200">
                {/* Ester Portrait Image */}
                <div className="relative w-full h-full">
                  <img
                    src="/assets/images/ester-foto-480.webp"
                    srcSet="/assets/images/ester-foto-480.webp 480w, /assets/images/ester-foto-768.webp 768w, /assets/images/ester-foto-1023.webp 1023w"
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    alt={t('hero.imageAlt')}
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    width="480"
                    height="721"
                  />
                  {/* Dark Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Trust Card Overlay */}
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-20 bg-white/95 backdrop-blur-sm p-4 sm:p-5 rounded-xl shadow-lg border border-white/30">
                    <div className="space-y-3">
                      <blockquote className="border-l-2 border-primary/30 pl-3 text-xs text-muted-foreground italic">
                        "{t('hero.trustQuote')}"
                      </blockquote>
                      <Link to={getLocalizedPath('/about-the-teacher', language)} className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-xs font-medium underline">
                        {t('hero.storyLink')} <Icon name="ArrowRight" size={14} />
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

    </section>
  );
};

export default HeroSection;
