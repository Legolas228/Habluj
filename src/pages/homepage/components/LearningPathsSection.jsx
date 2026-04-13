import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { getLocalizedPath } from '../../../utils/seo';

const LearningPathsSection = () => {
  const { t, language } = useTranslation();

  const learningPaths = [
    {
      id: 1,
      targetId: 'individual-classes',
      title: t('learning.path1.title'),
      subtitle: t('learning.path1.subtitle'),
      description: t('learning.path1.description'),
      icon: "BookOpen",
      color: "bg-success",
      features: t('learning.path1.features').split(','),
      duration: t('learning.path1.duration'),
      lessons: t('learning.path1.lessons'),
      price: t('learning.path1.price'),
      popular: false
    },
    {
      id: 2,
      targetId: 'group-classes',
      title: t('learning.path2.title'),
      subtitle: t('learning.path2.subtitle'),
      description: t('learning.path2.description'),
      icon: "TrendingUp",
      color: "bg-primary",
      features: t('learning.path2.features').split(','),
      duration: t('learning.path2.duration'),
      lessons: t('learning.path2.lessons'),
      price: t('learning.path2.price'),
      popular: true
    },
    {
      id: 3,
      targetId: 'intensive-courses',
      title: t('learning.path3.title'),
      subtitle: t('learning.path3.subtitle'),
      description: t('learning.path3.description'),
      icon: "Briefcase",
      color: "bg-secondary",
      features: t('learning.path3.features').split(','),
      duration: t('learning.path3.duration'),
      lessons: t('learning.path3.lessons'),
      price: t('learning.path3.price'),
      popular: false
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-muted rounded-full px-4 py-2 mb-6">
            <Icon name="Target" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">{t('learning.sectionLabel')}</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-headlines font-bold text-foreground mb-6">
            {t('learning.title').replace('{highlight}', '')} <span className="text-primary">{t('learning.highlight')}</span>
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('learning.subtitle')}
          </p>
        </div>

        {/* Learning Paths Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {learningPaths?.map((path, index) => (
            <div
              key={path?.id}
              className={`relative bg-white rounded-2xl p-6 shadow-soft hover:shadow-cultural transition-all duration-300 group flex flex-col ${path?.popular ? 'ring-2 ring-primary ring-offset-4' : ''
                }`}
              style={{ '--milestone-index': index }}
            >
              {/* Popular Badge */}
              {path?.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-white px-4 py-1 rounded-full text-xs font-medium">
                    {t('learning.path2.popular')}
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 ${path?.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon name={path?.icon} size={24} className="text-white" />
              </div>

              {/* Content */}
              <div className="space-y-4 flex flex-col h-full">
                <div>
                  <h3 className="text-xl font-headlines font-bold text-foreground mb-1 line-clamp-2">
                    {path?.title}
                  </h3>
                  <p className="text-sm text-primary font-medium">{path?.subtitle}</p>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {path?.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {path?.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm">
                      <Icon name="Check" size={14} className="text-success flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Details */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('learning.labels.duration')}</span>
                    <span className="font-medium text-foreground">{path?.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('learning.labels.lessons')}</span>
                    <span className="font-medium text-foreground">{path?.lessons}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('learning.labels.price')}</span>
                    <span className="font-bold text-primary">{path?.price}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-auto pt-2">
                  <Link to={getLocalizedPath(`/tutoring-services#${path?.targetId}`, language)}>
                    <Button
                      variant={path?.popular ? "default" : "outline"}
                      size="sm"
                      fullWidth
                      className={path?.popular ? "bg-primary hover:bg-primary/90" : "border-primary text-primary hover:bg-primary hover:text-white"}
                    >
                      {t('learning.cta')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            {t('learning.bottomText')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="default"
              size="lg"
              className="bg-secondary hover:bg-secondary/90"
              iconName="MessageCircle"
              iconPosition="left"
            >
              {t('features.ctaButton1')}
            </Button>
            <Link to={getLocalizedPath('/tutoring-services', language)}>
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-white"
                iconName="ArrowRight"
                iconPosition="right"
              >
                {t('footer.services')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningPathsSection;
