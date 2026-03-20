import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useTranslation } from '../../../hooks/useTranslation';

const TestimonialsSection = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { t } = useTranslation();

  const testimonials = [
    {
      id: 1,
      name: "Martina Kováčová",
      role: "Marketing manažérka",
      location: "Bratislava, Slovensko",
      rating: 5,
      content: t('testimonials.testimonial1.content'),
      achievement: t('testimonials.testimonial1.achievement'),
      beforeAfter: {
        before: t('testimonials.testimonial1.before'),
        after: t('testimonials.testimonial1.after')
      }
    },
    {
      id: 2,
      name: "Tomáš Novák",
      role: "IT konzultant",
      location: "Praha, Česko",
      rating: 5,
      content: t('testimonials.testimonial2.content'),
      achievement: t('testimonials.testimonial2.achievement'),
      beforeAfter: {
        before: t('testimonials.testimonial2.before'),
        after: t('testimonials.testimonial2.after')
      }
    },
    {
      id: 3,
      name: "Lucia Svobodová",
      role: "Študentka medicíny",
      location: "Košice, Slovensko",
      rating: 5,
      content: t('testimonials.testimonial3.content'),
      achievement: t('testimonials.testimonial3.achievement'),
      beforeAfter: {
        before: t('testimonials.testimonial3.before'),
        after: t('testimonials.testimonial3.after')
      }
    },
    {
      id: 4,
      name: "Peter Dvořák",
      role: "Podnikateľ",
      location: "Brno, Česko",
      rating: 5,
      content: t('testimonials.testimonial4.content'),
      achievement: t('testimonials.testimonial4.achievement'),
      beforeAfter: {
        before: t('testimonials.testimonial4.before'),
        after: t('testimonials.testimonial4.after')
      }
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials?.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials?.length) % testimonials?.length);
  };

  const currentTestimonial = testimonials?.[activeTestimonial];

  return (
    <section className="py-20 bg-muted/30" role="region" aria-label={t('testimonials.sectionLabel')}>
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 mb-6 shadow-soft">
            <Icon name="Heart" size={16} className="text-cta" />
            <span className="text-sm font-medium text-foreground">{t('testimonials.sectionLabel')}</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-headlines font-bold text-foreground mb-6">
            {t('testimonials.title').replace('{highlight}', '')} <span className="text-primary">{t('testimonials.highlight')}</span>
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-cultural relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-cultural opacity-5 rounded-full blur-3xl"></div>

            <div className="grid lg:grid-cols-3 gap-8 items-center relative z-10">
              {/* Student Info */}
              <div className="text-center lg:text-left">
                <div className="relative inline-block mb-4">
                  {currentTestimonial?.avatar ? (
                    <>
                      <Image
                        src={currentTestimonial?.avatar}
                        alt={currentTestimonial?.name}
                        width="96"
                        height="96"
                        className="w-24 h-24 rounded-full object-cover mx-auto lg:mx-0"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-success w-8 h-8 rounded-full flex items-center justify-center">
                        <Icon name="Check" size={16} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto lg:mx-0">
                      <span className="text-3xl font-bold text-primary">{currentTestimonial?.name?.charAt(0)}</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-headlines font-bold text-foreground mb-1">
                  {currentTestimonial?.name}
                </h3>
                <p className="text-primary font-medium mb-1">{currentTestimonial?.role}</p>
                <p className="text-sm text-muted-foreground mb-4">{currentTestimonial?.location}</p>

                {/* Rating */}
                <div className="flex justify-center lg:justify-start space-x-1 mb-4">
                  {[...Array(currentTestimonial?.rating)]?.map((_, i) => (
                    <Icon key={i} name="Star" size={16} className="text-accent fill-current" />
                  ))}
                </div>

                {/* Achievement Badge */}
                <div className="inline-flex items-center space-x-2 bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
                  <Icon name="Trophy" size={14} />
                  <span>{currentTestimonial?.achievement}</span>
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="lg:col-span-2 space-y-6">
                <div className="relative">
                  <Icon name="Quote" size={40} className="text-primary/20 absolute -top-4 -left-2" />
                  <p className="text-lg text-foreground leading-relaxed pl-8">
                    {currentTestimonial?.content}
                  </p>
                </div>

                {/* Before/After */}
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">{t('testimonials.beforeAfter.before')}</div>
                      <div className="font-medium text-foreground">{currentTestimonial?.beforeAfter?.before}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">{t('testimonials.beforeAfter.after')}</div>
                      <div className="font-medium text-primary">{currentTestimonial?.beforeAfter?.after}</div>
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <Icon name="ArrowRight" size={20} className="text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <button
              type="button"
              onClick={prevTestimonial}
              aria-label={`${t('common.previous') || "Previous"} testimonial`}
              className="w-12 h-12 bg-white rounded-full shadow-soft flex items-center justify-center hover:shadow-cultural transition-all duration-200 group"
            >
              <Icon name="ChevronLeft" size={20} className="text-muted-foreground group-hover:text-primary" />
            </button>

            {/* Dots */}
            <div className="flex space-x-2">
              {testimonials?.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  aria-label={`Go to testimonial ${index + 1} of ${testimonials.length}`}
                  aria-current={index === activeTestimonial ? 'true' : undefined}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${index === activeTestimonial ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={nextTestimonial}
              aria-label={`${t('common.next') || "Next"} testimonial`}
              className="w-12 h-12 bg-white rounded-full shadow-soft flex items-center justify-center hover:shadow-cultural transition-all duration-200 group"
            >
              <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-primary" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{t('testimonials.stats.value1')}</div>
            <div className="text-sm text-muted-foreground">{t('testimonials.stat1')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary mb-2">{t('testimonials.stats.value2')}</div>
            <div className="text-sm text-muted-foreground">{t('testimonials.stat2')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">{t('testimonials.stats.value3')}</div>
            <div className="text-sm text-muted-foreground">{t('testimonials.stat3')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-2">{t('testimonials.stats.value4')}</div>
            <div className="text-sm text-muted-foreground">{t('testimonials.stat4')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
