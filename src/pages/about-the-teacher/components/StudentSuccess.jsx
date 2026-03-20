import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useTranslation } from '../../../hooks/useTranslation';

const StudentSuccess = () => {
  const { t } = useTranslation();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Martina Kováčová",
      age: 28,
      profession: "Marketing manažérka",
      location: "Bratislava",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      level: "A1 → B2",
      duration: "8 mesiacov",
      achievement: "Získala prácu v medzinárodnej firme",
      quote: `Ester mi úplne zmenila pohľad na učenie španielčiny. Jej metóda je nielen efektívna, ale aj zábavná. Vďaka nej som si našla prácu v medzinárodnej firme, kde denne používam španielčinu. Nikdy by som si nepomyslela, že za 8 mesiacov budem schopná viesť obchodné rokovania v španielčine!`,
      rating: 5,
      tags: ["Obchodná španielčina", "Konverzácia", "Gramatika"]
    },
    {
      id: 2,
      name: "Tomáš Novák",
      age: 35,
      profession: "IT konzultant",
      location: "Košice",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      level: "A2 → C1",
      duration: "12 mesiacov",
      achievement: "Presťahoval sa do Španielska",
      quote: `Ako IT konzultant som potreboval španielčinu pre prácu v Barcelone. Ester mi pomohla nielen s jazykom, ale aj s kultúrnymi rozdielmi. Jej lekcie boli vždy praktické a zamerané na reálne situácie. Dnes žijem v Španielsku a cítim sa tam ako doma!`,
      rating: 5,
      tags: ["Technická španielčina", "Kultúra", "Presťahovanie"]
    },
    {
      id: 3,
      name: "Lucia Svobodová",
      age: 22,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      quote: "Ester má neuveriteľný dar vysvetliť gramatiku jednoducho a logicky. Po 6 mesiacoch som sa dokázala plynule dohovoriť na dovolenke v Španielsku.",
      level: "A2 → B2",
      duration: "6 mesiacov",
      achievement: "Získala prácu v španielskej firme",
      tags: ["Intenzívny kurz", "Obchodná španielčina"]
    },
    {
      name: "Peter S.",
      age: "35",
      profession: "IT Špecialista",
      location: "Košice",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      quote: "Oceňujem flexibilitu a online formu výučby. Hodiny sú vždy zábavné a plné energie. Nikdy som sa nenudil.",
      level: "B1 → C1",
      duration: "1 rok",
      achievement: "Úspešne zložil DELE C1",
      tags: ["Príprava na DELE", "Konverzácie"]
    },
    {
      name: "Lucia M.",
      age: "24",
      profession: "Študentka",
      location: "Trnava",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: "Vďaka Ester som sa prestala báť rozprávať. Vytvorila bezpečné prostredie, kde som mohla robiť chyby a učiť sa z nich.",
      level: "A1 → B1",
      duration: "8 mesiacov",
      achievement: "Erasmus pobyt v Valencii",
      tags: ["Začiatočník", "Štúdium v zahraničí"]
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[activeTestimonial];

  return (
    <section className="py-20 lg:py-32 bg-secondary/5 overflow-hidden" id="student-success">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left Column - Stats & Info */}
          <div className="lg:w-1/2">
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full mb-6 shadow-sm">
              <Icon name="Star" size={20} className="text-spanish" />
              <span className="text-sm font-medium text-foreground">{t('about.success.badge')}</span>
            </div>

            <h2 className="font-headlines text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {t('about.success.title').replace('{highlight}', '')} <span className="text-spanish">{t('about.success.titleHighlight')}</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              {t('about.success.description')}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="font-semibold text-foreground mb-1">{t('about.success.stats.success')}</div>
                <div className="text-sm text-muted-foreground">{t('about.success.stats.successDesc')}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
                <div className="text-3xl font-bold text-spanish mb-2">6</div>
                <div className="font-semibold text-foreground mb-1">{t('about.success.stats.months')}</div>
                <div className="text-sm text-muted-foreground">{t('about.success.stats.monthsDesc')}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
                <div className="text-3xl font-bold text-trust mb-2">100%</div>
                <div className="font-semibold text-foreground mb-1">{t('about.success.stats.certs')}</div>
                <div className="text-sm text-muted-foreground">{t('about.success.stats.certsDesc')}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
                <div className="text-3xl font-bold text-conversion mb-2">200+</div>
                <div className="font-semibold text-foreground mb-1">{t('about.success.stats.grads')}</div>
                <div className="text-sm text-muted-foreground">{t('about.success.stats.gradsDesc')}</div>
              </div>
            </div>
          </div>

          {/* Right Column - Testimonial Card */}
          <div className="lg:w-1/2 w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-cultural rounded-3xl transform rotate-3 opacity-20 blur-xl"></div>

              <div className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-cultural border border-border">
                {/* Navigation Buttons */}
                <div className="absolute top-8 right-8 flex space-x-2">
                  <button
                    onClick={prevTestimonial}
                    className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-300"
                  >
                    <Icon name="ChevronLeft" size={20} />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-300"
                  >
                    <Icon name="ChevronRight" size={20} />
                  </button>
                </div>

                <div className="flex items-center space-x-4 mb-8">
                  <Image
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{currentTestimonial.name}</h3>
                    <p className="text-muted-foreground text-sm">{currentTestimonial.profession}</p>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                      <Icon name="MapPin" size={12} />
                      <span>{currentTestimonial.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center space-x-1 text-spanish mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} name="Star" size={16} fill="currentColor" />
                    ))}
                  </div>
                  <blockquote className="text-foreground leading-relaxed mb-6 font-accent text-lg italic">
                    "{currentTestimonial.quote}"
                  </blockquote>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-secondary/5 rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('about.success.card.progress')}</p>
                    <span className="font-semibold text-primary">{currentTestimonial.level}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('about.success.card.duration')}</p>
                    <span className="font-semibold text-foreground">{currentTestimonial.duration}</span>
                  </div>
                </div>

                <div className="bg-gradient-cultural p-4 rounded-xl text-white mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="Trophy" size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">{t('about.success.card.success')}</p>
                      <p className="text-white/80 text-sm">{currentTestimonial.achievement}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentTestimonial.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center max-w-3xl mx-auto">
          <h3 className="font-headlines text-2xl font-bold text-foreground mb-4">
            {t('about.success.cta.title').replace('{highlight}', '')} <span className="text-spanish">{t('about.success.cta.titleHighlight')}</span>?
          </h3>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {t('about.success.cta.description')}
          </p>
          <button className="px-8 py-3 border border-spanish text-spanish rounded-lg font-semibold hover:bg-spanish hover:text-white transition-colors">
            {t('about.success.cta.button')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default StudentSuccess;
