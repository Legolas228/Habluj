import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { getLocalizedPath } from '../../../utils/seo';

const MeetEster = () => {
  const { t, language } = useTranslation();
  
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Icon name="Heart" size={18} className="text-primary" />
            <span className="text-sm font-semibold text-primary">{t('meet-ester.label')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headlines font-bold text-foreground mb-4">
            {t('meet-ester.title')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            {t('meet-ester.subtitle')}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: Bio Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground font-headlines">
                {t('meet-ester.intro.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                {t('meet-ester.intro.text')}
              </p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-primary/10 hover:border-primary/20 transition-colors">
                <div className="text-2xl sm:text-3xl font-bold text-primary font-headlines mb-2">4+</div>
                <div className="text-sm font-medium text-foreground">{t('meet-ester.stats.exp')}</div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-secondary/10 hover:border-secondary/20 transition-colors">
                <div className="text-2xl sm:text-3xl font-bold text-secondary font-headlines mb-2">2×</div>
                <div className="text-sm font-medium text-foreground">{t('meet-ester.stats.olympiad')}</div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-accent/10 hover:border-accent/20 transition-colors">
                <div className="text-2xl sm:text-3xl font-bold text-accent font-headlines mb-2">40+</div>
                <div className="text-sm font-medium text-foreground">{t('meet-ester.stats.students')}</div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-green-200/30 hover:border-green-200/50 transition-colors">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 font-headlines mb-2">100%</div>
                <div className="text-sm font-medium text-foreground">{t('meet-ester.stats.satisfaction')}</div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6">
              <Link to={getLocalizedPath('/about-the-teacher', language)}>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full lg:w-auto bg-primary hover:bg-primary/90"
                  iconName="ArrowRight"
                  iconPosition="right"
                >
                  {t('meet-ester.cta')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Image with Testimonial Overlay */}
          <div className="relative">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              {/* Image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />
              <img
                src="/assets/images/ester-foto.webp"
                alt={t('meet-ester.image-alt')}
                className="w-full h-full object-cover"
                loading="lazy"
                width="600"
                height="800"
              />

            </div>

            {/* Decorative Badge */}
            <div className="absolute top-3 right-3 sm:-top-4 sm:-right-4 bg-secondary text-white rounded-full py-2 px-3 sm:py-3 sm:px-5 shadow-lg font-semibold text-xs sm:text-sm max-w-[65%] sm:max-w-none text-center">
              ⭐ {t('meet-ester.badge')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetEster;
