import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import Icon from '../../../components/AppIcon';

const Credentials = () => {
  const { t } = useTranslation();

  const certifications = [
    {
      title: "DELE C2",
      institution: "Instituto Cervantes",
      year: "2020",
      description: t('about.credentials.cert1.desc'),
      icon: "Award",
      color: "text-spanish"
    },
    {
      title: t('about.credentials.cert2.title'),
      institution: t('about.credentials.cert2.inst'),
      year: "2018",
      description: t('about.credentials.cert2.desc'),
      icon: "BookOpen",
      color: "text-primary"
    },
    {
      title: "ELE",
      institution: "Universidad de Salamanca",
      year: "2019",
      description: t('about.credentials.cert3.desc'),
      icon: "Globe",
      color: "text-trust"
    },
    {
      title: "TKT CLIL",
      institution: "Cambridge Assessment English",
      year: "2021",
      description: t('about.credentials.cert4.desc'),
      icon: "CheckCircle",
      color: "text-conversion"
    }
  ];

  const specializations = [
    {
      title: t('about.credentials.specs.1.title'),
      description: t('about.credentials.specs.1.desc'),
      icon: "MessageCircle"
    },
    {
      title: t('about.credentials.specs.2.title'),
      description: t('about.credentials.specs.2.desc'),
      icon: "Users"
    },
    {
      title: t('about.credentials.specs.3.title'),
      description: t('about.credentials.specs.3.desc'),
      icon: "Laptop"
    },
    {
      title: t('about.credentials.specs.4.title'),
      description: t('about.credentials.specs.4.desc'),
      icon: "Award"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-background overflow-hidden" id="credentials">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Certifications Column */}
          <div className="lg:w-1/2">
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Icon name="Award" size={20} className="text-primary" />
              <span className="text-sm font-medium text-foreground">{t('about.credentials.badge')}</span>
            </div>

            <h2 className="font-headlines text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {t('about.credentials.title').replace('{highlight1}', '')} <span className="text-primary">{t('about.credentials.titleHighlight1')}</span> a <span className="text-spanish">{t('about.credentials.titleHighlight2')}</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              {t('about.credentials.description')}
            </p>

            <div className="space-y-6">
              {certifications.map((cert, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow duration-300 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 ${cert.color}`}>
                    <Icon name={cert.icon} size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-lg text-foreground">{cert.title}</h3>
                      <span className="text-sm font-medium text-muted-foreground bg-secondary/10 px-2 py-1 rounded-md">{cert.year}</span>
                    </div>
                    <p className="text-primary font-medium text-sm mb-2">{cert.institution}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">{cert.description}</p>
                    <div className="flex items-center space-x-1 text-spanish text-xs font-medium">
                      <Icon name="Check" size={12} />
                      <span>{t('about.credentials.verified')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specializations Column */}
          <div className="lg:w-1/2">
            <div className="bg-gradient-cultural rounded-3xl p-8 lg:p-12 text-white h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              <h3 className="font-headlines text-2xl lg:text-3xl font-bold mb-6 relative z-10">
                {t('about.credentials.specs.title').replace('{highlight}', '')} <span className="text-accent">{t('about.credentials.specs.titleHighlight')}</span>
              </h3>

              <p className="text-white/80 leading-relaxed mb-12 relative z-10">
                {t('about.credentials.specs.description')}
              </p>

              <div className="grid sm:grid-cols-2 gap-6 relative z-10">
                {specializations.map((spec, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/20 transition-colors duration-300">
                    <Icon name={spec.icon} size={24} className="text-accent mb-4" />
                    <h4 className="font-semibold text-white mb-2">{spec.title}</h4>
                    <p className="text-white/70 text-sm leading-relaxed">{spec.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-white/20 relative z-10">
                <h4 className="font-semibold text-white mb-2">{t('about.credentials.continuous.title')}</h4>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  {t('about.credentials.continuous.desc')}
                </p>
                <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs text-white">
                  <Icon name="RefreshCw" size={12} />
                  <span>{t('about.credentials.continuous.lastUpdate')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Credentials;
