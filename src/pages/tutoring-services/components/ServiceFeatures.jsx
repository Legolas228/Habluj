import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../hooks/useTranslation';

const ServiceFeatures = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: "Users",
      title: t('services.feature1.title'),
      description: t('services.feature1.description'),
      color: "bg-primary"
    },
    {
      icon: "Globe",
      title: t('services.feature2.title'),
      description: t('services.feature2.description'),
      color: "bg-secondary"
    },
    {
      icon: "BookOpen",
      title: t('services.feature3.title'),
      description: t('services.feature3.description'),
      color: "bg-accent"
    },
    {
      icon: "Video",
      title: t('services.feature4.title'),
      description: t('services.feature4.description'),
      color: "bg-success"
    },
    {
      icon: "Award",
      title: t('services.feature5.title'),
      description: t('services.feature5.description'),
      color: "bg-warning"
    },
    {
      icon: "Target",
      title: t('services.feature6.title'),
      description: t('services.feature6.description'),
      color: "bg-error"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features?.map((feature, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-soft border p-6 hover:shadow-cultural transition-all duration-300 hover:-translate-y-1"
        >
          <div className={`w-12 h-12 ${feature?.color} rounded-lg flex items-center justify-center mb-4`}>
            <Icon name={feature?.icon} size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-headlines font-bold text-foreground mb-3">
            {feature?.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {feature?.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ServiceFeatures;
