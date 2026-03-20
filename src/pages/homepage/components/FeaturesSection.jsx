import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useTranslation } from '../../../hooks/useTranslation';

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      id: 1,
      icon: "Users",
      title: t('features.feature1.title'),
      description: t('features.feature1.description'),
      benefits: [t('features.feature1.benefit1'), t('features.feature1.benefit2'), t('features.feature1.benefit3')]
    },
    {
      id: 2,
      icon: "Globe",
      title: t('features.feature2.title'),
      description: t('features.feature2.description'),
      benefits: [t('features.feature2.benefit1'), t('features.feature2.benefit2'), t('features.feature2.benefit3')]
    },
    {
      id: 3,
      icon: "Clock",
      title: t('features.feature3.title'),
      description: t('features.feature3.description'),
      benefits: [t('features.feature3.benefit1'), t('features.feature3.benefit2'), t('features.feature3.benefit3')]
    },
    {
      id: 4,
      icon: "Award",
      title: t('features.feature4.title'),
      description: t('features.feature4.description'),
      benefits: [t('features.feature4.benefit1'), t('features.feature4.benefit2'), t('features.feature4.benefit3')]
    },
    {
      id: 5,
      icon: "Headphones",
      title: t('features.feature5.title'),
      description: t('features.feature5.description'),
      benefits: [t('features.feature5.benefit1'), t('features.feature5.benefit2'), t('features.feature5.benefit3')]
    },
    {
      id: 6,
      icon: "Heart",
      title: t('features.feature6.title'),
      description: t('features.feature6.description'),
      benefits: [t('features.feature6.benefit1'), t('features.feature6.benefit2'), t('features.feature6.benefit3')]
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-muted rounded-full px-4 py-2 mb-6">
            <Icon name="Sparkles" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">{t('features.sectionLabel')}</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-headlines font-bold text-foreground mb-6">
            {t('features.title').replace('{highlight}', '')} <span className="text-primary">{t('features.highlight')}</span>
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features?.map((feature, index) => (
            <div
              key={feature?.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-cultural transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Image */}
              {/* Image - Conditional */}
              {feature?.image && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={feature?.image}
                    alt={feature?.title}
                    width="400"
                    height="300"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                  {/* Icon Overlay if Image Exists */}
                  <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon name={feature?.icon} size={24} className="text-primary" />
                  </div>
                </div>
              )}

              {/* Icon - If no image, show prominent icon header */}
              {!feature?.image && (
                <div className="p-6 pb-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Icon name={feature?.icon} size={32} className="text-primary" />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-headlines font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {feature?.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  {feature?.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-2">
                  {feature?.benefits?.map((benefit, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm">
                      <Icon name="Check" size={14} className="text-success flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
