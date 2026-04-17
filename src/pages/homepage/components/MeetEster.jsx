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
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Icon name="Heart" size={18} className="text-primary" />
            <span className="text-sm font-semibold text-primary">{t('meet-ester.label')}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-headlines font-bold text-foreground mb-4">
            {t('meet-ester.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('meet-ester.subtitle')}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Bio Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <div className="space-y-4">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground font-headlines">
                {t('meet-ester.intro.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t('meet-ester.intro.text')}
              </p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-primary/10 hover:border-primary/20 transition-colors">
                <div className="text-3xl font-bold text-primary font-headlines mb-2">4+</div>
                <div className="text-sm font-medium text-foreground">{t('meet-ester.stats.exp')}</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-secondary/10 hover:border-secondary/20 transition-colors">
                <div className="text-3xl font-bold text-secondary font-headlines mb-2">2×</div>
                <div className="text-sm font-medium text-foreground">{t('meet-ester.stats.olympiad')}</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-accent/10 hover:border-accent/20 transition-colors">
                <div className="text-3xl font-bold text-accent font-headlines mb-2">30+</div>
                <div className="text-sm font-medium text-foreground">{t('meet-ester.stats.students')}</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-green-200/30 hover:border-green-200/50 transition-colors">
                <div className="text-3xl font-bold text-green-600 font-headlines mb-2">100%</div>
                <div className="text-sm font-medium text-foreground">{t('meet-ester.stats.satisfaction')}</div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="space-y-4 pt-4">
              <h4 className="font-semibold text-foreground">{t('meet-ester.methodology')}</h4>
              <ul className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Icon name="CheckCircle" size={20} className="text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t(`meet-ester.method${i}`)}
                    </span>
                  </li>
                ))}
              </ul>
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
                src="/assets/images/ester-placeholder.webp"
                alt={t('meet-ester.image-alt')}
                className="w-full h-full object-cover"
                loading="lazy"
                width="600"
                height="800"
              />

              {/* Testimonial Card */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20">
                <div className="text-white space-y-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Icon key={i} name="Star" size={16} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed italic">
                    "{t('meet-ester.testimonial')}"
                  </p>
                  <p className="text-xs font-semibold opacity-80">
                    {t('meet-ester.testimonial-author')}
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Badge */}
            <div className="absolute -top-4 -right-4 bg-secondary text-white rounded-full py-3 px-5 shadow-lg font-semibold text-sm">
              ⭐ {t('meet-ester.badge')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetEster;
