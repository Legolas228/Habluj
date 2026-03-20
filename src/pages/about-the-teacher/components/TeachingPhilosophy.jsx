import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Icon from '../../../components/AppIcon';

const TeachingPhilosophy = () => {
  const { t } = useTranslation();

  const philosophyPrinciples = [
    {
      title: t('about.philosophy.principles.empathy.title'),
      description: t('about.philosophy.principles.empathy.desc'),
      icon: 'Heart'
    },
    {
      title: t('about.philosophy.principles.culture.title'),
      description: t('about.philosophy.principles.culture.desc'),
      icon: 'Globe'
    },
    {
      title: t('about.philosophy.principles.practical.title'),
      description: t('about.philosophy.principles.practical.desc'),
      icon: 'Briefcase'
    },
    {
      title: t('about.philosophy.principles.creative.title'),
      description: t('about.philosophy.principles.creative.desc'),
      icon: 'Lightbulb'
    }
  ];

  const methodologySteps = [
    {
      title: t('about.philosophy.steps.1.title'),
      description: t('about.philosophy.steps.1.desc'),
      features: [t('about.philosophy.steps.1.f1'), t('about.philosophy.steps.1.f2'), t('about.philosophy.steps.1.f3')]
    },
    {
      title: t('about.philosophy.steps.2.title'),
      description: t('about.philosophy.steps.2.desc'),
      features: [t('about.philosophy.steps.2.f1'), t('about.philosophy.steps.2.f2'), t('about.philosophy.steps.2.f3')]
    },
    {
      title: t('about.philosophy.steps.3.title'),
      description: t('about.philosophy.steps.3.desc'),
      features: [t('about.philosophy.steps.3.f1'), t('about.philosophy.steps.3.f2'), t('about.philosophy.steps.3.f3')]
    },
    {
      title: t('about.philosophy.steps.4.title'),
      description: t('about.philosophy.steps.4.desc'),
      features: [t('about.philosophy.steps.4.f1'), t('about.philosophy.steps.4.f2'), t('about.philosophy.steps.4.f3')]
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-secondary/5 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full mb-6 shadow-sm">
            <Icon name="BookOpen" size={20} className="text-primary" />
            <span className="text-sm font-medium text-foreground">{t('about.philosophy.badge')}</span>
          </div>

          <h2 className="font-headlines text-3xl lg:text-4xl font-bold text-foreground mb-6">
            {t('about.philosophy.title').replace('{highlight}', '')} <span className="text-primary">{t('about.philosophy.titleHighlight')}</span>
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {t('about.philosophy.description')}
          </p>
        </div>

        {/* Principles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {philosophyPrinciples.map((principle, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                <Icon name={principle.icon} size={24} />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-3">{principle.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{principle.description}</p>
            </div>
          ))}
        </div>

        {/* Methodology Steps */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg border border-border">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="font-headlines text-2xl lg:text-3xl font-bold text-foreground mb-4">
                {t('about.philosophy.methodology.title').replace('{highlight}', '')} <span className="text-spanish">{t('about.philosophy.methodology.titleHighlight')}</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {t('about.philosophy.methodology.desc')}
              </p>

              <div className="space-y-8">
                {methodologySteps.map((step, index) => (
                  <div key={index} className="relative pl-8 border-l-2 border-primary/20">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary"></div>
                    <h4 className="font-semibold text-lg text-foreground mb-2">{step.title}</h4>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{step.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.features.map((feature, featureIndex) => (
                        <span key={featureIndex} className="text-xs font-medium bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-cultural rounded-2xl opacity-10 blur-2xl"></div>
              <div className="relative bg-gradient-cultural rounded-2xl p-8 lg:p-12 text-white text-center">
                <Icon name="Quote" size={48} className="text-white/20 mx-auto mb-6" />
                <blockquote className="font-accent text-xl lg:text-2xl italic mb-6 leading-relaxed">
                  {t('about.philosophy.quote')}
                </blockquote>
                <div className="font-semibold">Ester Mesároš</div>
                <div className="text-white/80 text-sm">{t('about.philosophy.quoteAuthor')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeachingPhilosophy;
