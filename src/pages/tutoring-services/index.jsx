import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import ServiceFeatures from './components/ServiceFeatures';
import LevelQuizTeaser from '../../components/LevelQuizTeaser';
import WaitlistForm from '../../components/WaitlistForm';
import { useTranslation } from '../../hooks/useTranslation';
import { contactInfo, getContactLinks } from '../../utils/contactInfo';
import { DEFAULT_OG_IMAGE, getCanonicalUrl, getHreflangLinks, getLocalizedPath } from '../../utils/seo';
import { openSetmoreBooking } from '../../utils/setmore';

const WAITLIST_TARGET_ID = 'course-waitlist';

const TutoringServices = () => {
  const { t, language } = useTranslation();
  const hreflangLinks = getHreflangLinks('/tutoring-services');
  const [waitlistCourseType, setWaitlistCourseType] = React.useState('intensive');
  const localeByLanguage = {
    sk: 'sk-SK',
    cz: 'cs-CZ',
    es: 'es-ES',
  };
  const locale = localeByLanguage[language] || 'sk-SK';
  const isCzech = language === 'cz';
  const offerCurrency = isCzech ? 'CZK' : 'EUR';
  const individualFromPrice = isCzech ? '500' : '20';
  const groupFromPrice = isCzech ? '3750' : '150';
  const highPrice = isCzech ? '3750' : '150';

  const servicesSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: t('meta.servicesTitle'),
    description: t('meta.servicesDescription'),
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Habluj',
      url: getCanonicalUrl('/', language),
    },
    inLanguage: locale,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: offerCurrency,
      lowPrice: individualFromPrice,
      highPrice,
      offerCount: 2,
      availability: 'https://schema.org/InStock',
      url: getCanonicalUrl('/tutoring-services', language),
      offers: [
        {
          '@type': 'Offer',
          name: t('services.offers.individual.title'),
          price: individualFromPrice,
          priceCurrency: offerCurrency,
          availability: 'https://schema.org/InStock',
          url: getCanonicalUrl('/tutoring-services#individual-classes', language),
        },
        {
          '@type': 'Offer',
          name: t('services.offers.group.title'),
          price: groupFromPrice,
          priceCurrency: offerCurrency,
          availability: 'https://schema.org/InStock',
          url: getCanonicalUrl('/tutoring-services#group-classes', language),
        },
      ],
    },
  };

  const handleBookLesson = () => {
    openSetmoreBooking();
  };

  const scrollToSection = (targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openWaitlist = (courseType) => {
    setWaitlistCourseType(courseType);
    scrollToSection(WAITLIST_TARGET_ID);
  };

  const serviceSections = [
    {
      id: 'individual-classes',
      icon: 'BookOpen',
      color: 'bg-success',
      title: t('services.offers.individual.title'),
      subtitle: t('services.offers.individual.subtitle'),
      items: [
        {
          title: t('services.offers.individual.item1'),
          description: t('services.offers.individual.item1desc'),
          helperDescription: t('services.offers.individual.item1help'),
        },
        {
          title: t('services.offers.individual.item2'),
          description: t('services.offers.individual.item2desc'),
          helperDescription: t('services.offers.individual.item2help'),
        },
        {
          title: t('services.offers.individual.item3'),
          description: t('services.offers.individual.item3desc'),
          helperDescription: t('services.offers.individual.item3help'),
        },
      ],
    },
    {
      id: 'group-classes',
      icon: 'Users',
      color: 'bg-primary',
      title: t('services.offers.group.title'),
      subtitle: t('services.offers.group.subtitle'),
      items: [
        {
          title: t('services.offers.group.item1'),
          description: t('services.offers.group.item1desc'),
          action: 'waitlist',
        },
        {
          title: t('services.offers.group.item2'),
          description: t('services.offers.group.item2desc'),
          action: 'contact',
        },
      ],
    },
    {
      id: 'intensive-courses',
      icon: 'Zap',
      color: 'bg-secondary',
      title: t('services.offers.intensive.title'),
      subtitle: t('services.offers.intensive.subtitle'),
      items: [
        {
          title: t('services.offers.intensive.item1'),
          description: t('services.offers.intensive.item1desc'),
        },
        {
          title: t('services.offers.intensive.item2'),
          description: t('services.offers.intensive.item2desc'),
        },
        {
          title: t('services.offers.intensive.item3'),
          description: t('services.offers.intensive.item3desc'),
        },
        {
          title: t('services.offers.intensive.item4'),
          description: t('services.offers.intensive.item4desc'),
        },
      ],
    },
  ];

  const sectionItemStyles = {
    'individual-classes': [
      { icon: 'Book', color: 'bg-green-100', text: 'text-green-700' },
      { icon: 'TrendingUp', color: 'bg-green-200', text: 'text-green-800' },
      { icon: 'Award', color: 'bg-green-200', text: 'text-green-800' },
      { icon: 'Flame', color: 'bg-green-300', text: 'text-green-900' },
    ],
    'group-classes': [
      { icon: 'Users', color: 'bg-red-100', text: 'text-red-700' },
      { icon: 'MessageCircle', color: 'bg-red-200', text: 'text-red-800' },
      { icon: 'Sparkles', color: 'bg-red-300', text: 'text-red-900' },
    ],
    'intensive-courses': [
      { icon: 'Zap', color: 'bg-blue-100', text: 'text-blue-700' },
      { icon: 'Target', color: 'bg-blue-200', text: 'text-blue-800' },
      { icon: 'BookOpen', color: 'bg-blue-200', text: 'text-blue-800' },
      { icon: 'Trophy', color: 'bg-blue-300', text: 'text-blue-900' },
    ],
  };

  const sectionAccentStyles = {
    'individual-classes': {
      cardBorder: 'border-green-100 hover:border-green-200',
      label: 'text-green-700',
      button: 'border-green-600 text-green-700 hover:bg-green-700 hover:text-white',
    },
    'group-classes': {
      cardBorder: 'border-red-100 hover:border-red-200',
      label: 'text-red-700',
      button: 'border-red-600 text-red-700 hover:bg-red-700 hover:text-white',
    },
    'intensive-courses': {
      cardBorder: 'border-blue-100 hover:border-blue-200',
      label: 'text-blue-700',
      button: 'border-blue-600 text-blue-700 hover:bg-blue-700 hover:text-white',
    },
  };

  const completePrograms = [
    {
      id: 'program-individual',
      targetId: 'individual-classes',
      icon: 'BookOpen',
      color: 'bg-success',
      title: t('learning.path1.title'),
      subtitle: t('learning.path1.subtitle'),
      description: t('learning.path1.description'),
      features: t('learning.path1.features').split(','),
      duration: t('learning.path1.duration'),
      lessons: t('learning.path1.lessons'),
      price: t('learning.path1.price'),
    },
    {
      id: 'program-group',
      targetId: 'group-classes',
      icon: 'Users',
      color: 'bg-primary',
      title: t('learning.path2.title'),
      subtitle: t('learning.path2.subtitle'),
      description: t('learning.path2.description'),
      features: t('learning.path2.features').split(','),
      duration: t('learning.path2.duration'),
      lessons: t('learning.path2.lessons'),
      price: t('learning.path2.price'),
    },
    {
      id: 'program-intensive',
      targetId: 'intensive-courses',
      icon: 'Zap',
      color: 'bg-secondary',
      title: t('learning.path3.title'),
      subtitle: t('learning.path3.subtitle'),
      description: t('learning.path3.description'),
      features: t('learning.path3.features').split(','),
      duration: t('learning.path3.duration'),
      lessons: t('learning.path3.lessons'),
      price: t('learning.path3.price'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t('meta.servicesTitle')}</title>
        <meta name="description" content={t('meta.servicesDescription')} />
        <link rel="canonical" href={getCanonicalUrl('/tutoring-services', language)} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
        <meta property="og:title" content={t('meta.servicesTitle')} />
        <meta property="og:description" content={t('meta.servicesDescription')} />
        <meta property="og:url" content={getCanonicalUrl('/tutoring-services', language)} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:locale" content={locale} />
        <meta property="og:locale:alternate" content="sk-SK" />
        <meta property="og:locale:alternate" content="cs-CZ" />
        <meta property="og:locale:alternate" content="es-ES" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('meta.servicesTitle')} />
        <meta name="twitter:description" content={t('meta.servicesDescription')} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(servicesSchema)}</script>
      </Helmet>
      <Header />
      <main>
      {/* Complete Programs Section (homepage style) */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 bg-muted rounded-full px-4 py-2 mb-6">
              <Icon name="Target" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">{t('learning.sectionLabel')}</span>
            </div>

            <h2 className="text-3xl lg:text-5xl font-headlines font-bold text-foreground mb-6">
              {t('learning.title').replace('{highlight}', '')}{' '}
              <span className="text-primary">{t('learning.highlight')}</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('learning.subtitle')}
            </p>
          </div>

          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,360px))] justify-center gap-8 mb-12">
            {completePrograms.map((program, index) => (
              <div
                key={program.id}
                className="relative bg-white rounded-2xl p-6 shadow-soft hover:shadow-cultural transition-all duration-300 group"
                style={{ '--milestone-index': index }}
              >
                <div className={`w-12 h-12 ${program.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon name={program.icon} size={24} className="text-white" />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-headlines font-bold text-foreground mb-1 line-clamp-2">
                      {program.title}
                    </h3>
                    <p className="text-sm text-primary font-medium">{program.subtitle}</p>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {program.description}
                  </p>

                  <ul className="space-y-2">
                    {program.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm">
                        <Icon name="Check" size={14} className="text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('learning.labels.duration')}</span>
                      <span className="font-medium text-foreground">{program.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('learning.labels.lessons')}</span>
                      <span className="font-medium text-foreground">{program.lessons}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('learning.labels.price')}</span>
                      <span className="font-bold text-primary">{program.price}</span>
                    </div>
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    fullWidth
                    className={program.id === 'program-intensive' ? 'bg-secondary hover:bg-secondary/90' : 'bg-primary hover:bg-primary/90'}
                    onClick={() => program.id === 'program-intensive' ? window.location.href = getLocalizedPath('/intensive-courses', language) : scrollToSection(program.targetId)}
                  >
                    {t('learning.cta')}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              {t('services.bottomText')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="default"
                size="lg"
                className="bg-secondary hover:bg-secondary/90"
                iconName="MessageCircle"
                iconPosition="left"
                asChild
              >
                <Link to={getLocalizedPath('/contact', language)}>{t('services.hero.ctaContact')}</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-white"
                iconName="Calendar"
                iconPosition="left"
                onClick={handleBookLesson}
              >
                {t('services.hero.ctaBook')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <LevelQuizTeaser />
          </div>
        </div>
      </section>

      {/* Detailed Sections By Category */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-6 space-y-12">
          {serviceSections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-28 bg-white rounded-2xl p-6 lg:p-8 shadow-soft border border-border">
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon name={section.icon} size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-headlines font-bold text-foreground">{section.title}</h3>
                  <p className="text-muted-foreground mt-1">{section.subtitle}</p>
                </div>
              </div>

              <div className="grid [grid-template-columns:repeat(auto-fit,minmax(240px,320px))] justify-center gap-4">
                {section.items.map((item, idx) => {
                  const itemStyleSet = sectionItemStyles[section.id] || [{ icon: section.icon, color: section.color }];
                  const itemStyle = itemStyleSet[idx % itemStyleSet.length];
                  const accentStyle = sectionAccentStyles[section.id] || {
                    cardBorder: 'border-border',
                    label: 'text-primary',
                    button: 'border-primary text-primary hover:bg-primary hover:text-white',
                  };
                  const isWaitlistOnly = item.action === 'waitlist' || (section.id === 'group-classes' || section.id === 'intensive-courses');
                  const isContactDirect = item.action === 'contact';
                  const waitlistCourseType = section.id === 'group-classes' ? 'small_group' : 'intensive';

                  return (
                    <div
                      key={idx}
                      className={`relative bg-white rounded-2xl p-6 shadow-soft border ${accentStyle.cardBorder} hover:shadow-cultural transition-all duration-300 group`}
                      style={{ '--milestone-index': idx }}
                    >
                      <div className="space-y-4">
                        {section.id === 'individual-classes' ? (
                          <>
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 ${itemStyle.color} rounded-xl ring-1 ring-black/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Icon name={itemStyle.icon} size={24} className={itemStyle.text || 'text-white'} />
                              </div>
                              <div>
                                <h4 className="text-xl font-headlines font-bold text-foreground line-clamp-2">{item.title}</h4>
                              </div>
                            </div>
                            <div className="space-y-2 text-left">
                              <p className={`text-sm font-medium ${accentStyle.label}`}>{section.title}</p>
                              <div className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-3 py-1.5 text-sm font-semibold text-green-700">
                                {item.description}
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{item.helperDescription}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className={`w-12 h-12 ${itemStyle.color} rounded-xl ring-1 ring-black/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                              <Icon name={itemStyle.icon} size={24} className={itemStyle.text || 'text-white'} />
                            </div>
                            <div>
                              <h4 className="text-xl font-headlines font-bold text-foreground mb-1 line-clamp-2">{item.title}</h4>
                              <p className={`text-sm font-medium ${accentStyle.label}`}>{section.title}</p>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                          </>
                        )}

                        {isContactDirect ? (
                          <Button
                            variant="outline"
                            size="sm"
                            fullWidth
                            className={accentStyle.button}
                            asChild
                          >
                            <Link to={getLocalizedPath('/contact', language)}>{t('services.hero.ctaContact')}</Link>
                          </Button>
                        ) : section.id === 'intensive-courses' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            fullWidth
                            className={accentStyle.button}
                            asChild
                          >
                            <Link to={getLocalizedPath('/intensive-courses', language)}>Más información</Link>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            fullWidth
                            className={accentStyle.button}
                            onClick={isWaitlistOnly ? () => openWaitlist(waitlistCourseType) : handleBookLesson}
                          >
                            {isWaitlistOnly ? t('waitlist.ctaJoin') : t('services.hero.ctaBook')}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id={WAITLIST_TARGET_ID} className="py-16 lg:py-20 bg-background scroll-mt-28">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-headlines font-bold text-foreground mb-3">
              {t('waitlist.sectionTitle')}
            </h2>
            <p className="text-muted-foreground">
              {t('waitlist.sectionSubtitle')}
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <WaitlistForm preferredCourseType={waitlistCourseType} />
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-headlines font-bold text-foreground mb-4">
              {t('services.whyTitle')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('services.whySubtitle')}
            </p>
          </div>
          <ServiceFeatures />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-cultural">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-headlines font-bold text-white mb-6">
              {t('services.cta.title')}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {t('services.cta.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                iconName="Calendar"
                iconPosition="left"
                onClick={handleBookLesson}
              >
                {t('services.cta.bookButton')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                iconName="MessageCircle"
                iconPosition="left"
                className="border-white text-white hover:bg-white hover:text-primary"
                asChild
              >
                <Link to={getLocalizedPath('/contact', language)}>{t('services.cta.callButton')}</Link>
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-white/80 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <Icon name="Shield" size={16} />
                <span>{t('services.cta.badge1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={16} />
                <span>{t('services.cta.badge2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" size={16} />
                <span>{t('services.cta.badge3')}</span>
              </div>
            </div>

            <a
              href={getContactLinks.instagram()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-colors"
              aria-label={`Open Instagram profile @${contactInfo.instagram}`}
            >
              <Icon name="Instagram" size={16} />
              <span className="font-medium">@{contactInfo.instagram}</span>
            </a>
          </div>
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
};

export default TutoringServices;
