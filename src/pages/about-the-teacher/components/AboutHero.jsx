import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const AboutHero = () => {
  const { t } = useTranslation();

  const scrollToVideo = () => {
    const videoSection = document.getElementById('video-introduction');
    if (videoSection) {
      videoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-16 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-background z-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent rounded-l-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-secondary/5 to-transparent rounded-r-full blur-3xl opacity-60" />
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex max-w-full items-center space-x-2 bg-primary/10 px-3 sm:px-4 py-2 rounded-full mb-6">
              <Icon name="Award" size={20} className="text-primary" />
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">{t('about.hero.badge')}</span>
            </div>

            <h1 className="font-headlines text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {t('about.hero.title').replace('{name}', '')} <span className="text-primary">Ester</span>
              <br />
              <span className="text-spanish">{t('about.hero.subtitle')}</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
              {t('about.hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                size="lg"
                className="bg-spanish text-white hover:bg-spanish/90 shadow-lg shadow-spanish/20"
                iconName="Play"
                iconPosition="left"
                onClick={scrollToVideo}
              >
                {t('about.hero.videoButton')}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 border-t border-border pt-6 sm:pt-8">
              <div>
                <div className="font-headlines text-2xl sm:text-3xl font-bold text-primary mb-1">4+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('about.hero.stats.experience')}</div>
              </div>
              <div>
                <div className="font-headlines text-2xl sm:text-3xl font-bold text-primary mb-1">30+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('about.hero.stats.students')}</div>
              </div>
              <div>
                <div className="font-headlines text-2xl sm:text-3xl font-bold text-primary mb-1">100%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t('about.hero.stats.satisfaction')}</div>
              </div>
            </div>
          </div>

          {/* Image Content */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
              <img
                src="/assets/images/ester-placeholder.webp"
                alt="Ester Mesároš"
                className="w-full h-full object-cover"
                fetchpriority="high"
                loading="eager"
                width="800"
                height="1000"
              />

              {/* Floating Card */}
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-20 bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-lg border border-white/20">
                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 bg-spanish/10 rounded-full flex items-center justify-center text-spanish">
                    <Icon name="Quote" size={24} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground italic">"{t('about.hero.quote')}"</p>
                    <p className="text-xs text-muted-foreground mt-1">- Ester Mesároš</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary/20 rounded-full blur-xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/20 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
