import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../hooks/useTranslation';

const TestimonialsSection = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { t } = useTranslation();

  const testimonials = [
    {
      id: 1,
      name: 'Mariana V.',
      content: 'Hodiny španielčiny sa mi veľmi páčia ❤️ Okrem toho, že má Ester vždy pripravené niečo nové, tak je to aj sranda. Aspoň ja sa teda dobre bavím 😅 páči sa mi ako vie vždy naviazať na to, čo potrebujem vedieť, že je ochotná vysvetliť mi niektoré veci aj 10x, kým to nedostanem do hlavy. Cením si jej trpezlivosť, že ideme tempom, ktoré mi vyhovuje a že je veľmi všímavá a vidí, kedy sa v tom jazyku už strácam a potrebujem spomaliť. Inokedy ma zas mentálne nakopne a mám pocit, že môžem ísť hablovať s domácimi 😅 Som vďačná za čas, ktorý mi venuje a teším sa na ďalšie hodiny :)'
    },
    {
      id: 2,
      name: 'Daniela Ď.',
      content: 'Ahojte, hodiny s Ester určite môžem odporučiť. Odkedy ma doučuje, som viac sebavedomá čo sa týka mojej španielčiny a mala som možnosť pochopiť španielsku literatúru, kultúru, gramatiku a konverzáciu lepšie, vzhľadom k tomu, že učebný systém v škole kam chodím mi nie vždy sadne. Je naozaj trpezlivá a vie vysvetliť učivo rôznymi spôsobmi. Keď som to potrebovala, vždy mi učivo vedela vysvetliť jednoduchým a pochopiteľným spôsobom. Má skúsenosti s rôznymi žiakmi, z bilingválu, z normálnej strednej, alebo proste jednoducho povedané, žiakov rôznych vekových kategórii a tak. Skrátka, je to veľmi milá, ľudská, ochotná a pracovitá osoba, takže som za hodiny s ňou rada, vždy sa na ne teším a určite by som nechcela meniť doučovateľku😊'
    },
    {
      id: 3,
      name: 'Daniel K.',
      content: 'Ester je super doučovateľka s príjemným ľudským prístupom a zároveň mierou profesionality, ktorá vám pomôže byť sebavedomejším hovorcom Španielčiny. Určite odporúčam :)'
    },
    {
      id: 4,
      name: 'Megan J.',
      content: 'Osobne by som odporúčala. Vie veľmi dobre učiť, vždy má všetko naplánované a vie výborne vysvetľovať. Vždy sa teším na jej hodiny. Mám veľmi rada jej spôsob a postoj k učeniu. Motivuje ma to. Nerobím s ňou dlho ale už na sebe vidím zmeny. Je komunikatívna, priateľská a vie sa prispôsobiť. Mám ju veľmi rada a nikdy by som nechcela niekoho iného 💜'
    },
    {
      id: 5,
      name: 'Janka E.',
      content: 'Určite vrelo odporúčam Ester, mladú energicku babu, ktorá je veľmi ľudská a vie sa prispôsobiť podmienkam na mieru žiaka🙂🥰'
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

            <div className="relative z-10">
              <div className="space-y-6">
                <p className="text-2xl lg:text-3xl font-headlines font-semibold text-primary pl-8">
                  {currentTestimonial?.name}
                </p>
                <div className="relative">
                  <Icon name="Quote" size={24} className="text-primary/20 absolute -top-2 -left-1" />
                  <p className="text-lg text-foreground leading-relaxed pl-8 whitespace-pre-line">
                    {currentTestimonial?.content}
                  </p>
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
