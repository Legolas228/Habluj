import React from 'react';
import { Link } from 'react-router-dom';

import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { trackImpact } from '../../../utils/analytics';

const MethodDemoSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      key: 'methodDemo.step1',
      icon: 'Target'
    },
    {
      key: 'methodDemo.step2',
      icon: 'MessageSquare'
    },
    {
      key: 'methodDemo.step3',
      icon: 'BarChart3'
    }
  ];

  const samplePhrases = t('methodDemo.samplePhrases').split(',');

  return (
    <section id="method-demo" className="py-16 lg:py-20 bg-muted/30 scroll-mt-24" role="region" aria-label={t('methodDemo.sectionLabel')}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 mb-6 shadow-soft">
            <Icon name="Video" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">{t('methodDemo.sectionLabel')}</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-headlines font-bold text-foreground mb-4">{t('methodDemo.title')}</h2>
          <p className="text-lg text-muted-foreground">{t('methodDemo.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-soft space-y-5">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon name={step.icon} size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('methodDemo.stepLabel')} {index + 1}</p>
                  <h3 className="text-lg font-headlines font-semibold text-foreground">{t(`${step.key}.title`)}</h3>
                  <p className="text-sm text-muted-foreground">{t(`${step.key}.description`)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-cultural rounded-3xl p-6 lg:p-8 text-white shadow-cultural flex flex-col justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm mb-4">
                <Icon name="ShieldCheck" size={15} />
                <span>{t('methodDemo.guaranteeBadge')}</span>
              </div>
              <h3 className="text-2xl font-headlines font-bold mb-3">{t('methodDemo.sampleTitle')}</h3>
              <p className="text-white/85 mb-4">{t('methodDemo.sampleSubtitle')}</p>
              <ul className="space-y-2 text-sm">
                {samplePhrases.map((phrase) => (
                  <li key={phrase} className="flex items-center gap-2">
                    <Icon name="Check" size={14} className="text-accent" />
                    <span>{phrase}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <Link
                to="/level-questionnaire"
                className="block"
                onClick={() => trackImpact('method_demo_questionnaire_click', { location: 'homepage_method_demo' })}
              >
                <Button variant="default" size="lg" className="w-full bg-white text-primary hover:bg-white/90" iconName="ListOrdered" iconPosition="left">
                  {t('methodDemo.primaryCta')}
                </Button>
              </Link>
              <Link
                to="/tutoring-services"
                className="block"
                onClick={() => trackImpact('method_demo_services_click', { location: 'homepage_method_demo' })}
              >
                <Button variant="outline" size="lg" className="w-full border-white/60 text-white hover:bg-white/10" iconName="ArrowRight" iconPosition="right">
                  {t('methodDemo.secondaryCta')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MethodDemoSection;
