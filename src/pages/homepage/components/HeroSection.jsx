import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Carousel from '../../../components/Carousel';
import { useTranslation } from '../../../hooks/useTranslation';

const HeroSection = () => {
  const { t } = useTranslation();

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

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/booking-system">
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
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-white"
                iconName="Play"
                iconPosition="left"
              >
                {t('hero.watchVideo')}
              </Button>
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

          {/* Hero Carousel */}
          <div className="relative w-full h-full min-h-96 flex items-center justify-center">
            <div className="relative z-10 w-full h-full">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-cultural bg-gray-200">
                <Carousel
                  images={[
                    { src: '/assets/images/monuments/alhambra.webp', alt: 'Granada' },
                    { src: '/assets/images/monuments/barcelona.webp', alt: 'Barcelona' },
                    { src: '/assets/images/monuments/mezquitacodoba.webp', alt: 'Córdoba' },
                    { src: '/assets/images/monuments/madrid.webp', alt: 'Madrid' },
                    { src: '/assets/images/monuments/sevilla.webp', alt: 'Sevilla' },
                    { src: '/assets/images/monuments/segovia.webp', alt: 'Segovia' },
                    { src: '/assets/images/monuments/palma-de-mallorca.webp', alt: 'Palma de Mallorca' },
                    { src: '/assets/images/monuments/toledo.webp', alt: 'Toledo' },
                    { src: '/assets/images/monuments/playadelaconcha.webp', alt: 'San Sebastián' },
                    { src: '/assets/images/monuments/catedralSantiago.webp', alt: 'Santiago de Compostela' },
                  ]}
                  delay={5000}
                  priority={true}
                />
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
