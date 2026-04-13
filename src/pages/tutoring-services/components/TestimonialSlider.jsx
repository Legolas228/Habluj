import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TestimonialSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Mariana V.',
      text: 'Hodiny španielčiny sa mi veľmi páčia ❤️ Okrem toho, že má Ester vždy pripravené niečo nové, tak je to aj sranda. Aspoň ja sa teda dobre bavím 😅 páči sa mi ako vie vždy naviazať na to, čo potrebujem vedieť, že je ochotná vysvetliť mi niektoré veci aj 10x, kým to nedostanem do hlavy. Cením si jej trpezlivosť, že ideme tempom, ktoré mi vyhovuje a že je veľmi všímavá a vidí, kedy sa v tom jazyku už strácam a potrebujem spomaliť. Inokedy ma zas mentálne nakopne a mám pocit, že môžem ísť hablovať s domácimi 😅 Som vďačná za čas, ktorý mi venuje a teším sa na ďalšie hodiny :)'
    },
    {
      id: 2,
      name: 'Daniela Ď.',
      text: 'Ahojte, hodiny s Ester určite môžem odporučiť. Odkedy ma doučuje, som viac sebavedomá čo sa týka mojej španielčiny a mala som možnosť pochopiť španielsku literatúru, kultúru, gramatiku a konverzáciu lepšie, vzhľadom k tomu, že učebný systém v škole kam chodím mi nie vždy sadne. Je naozaj trpezlivá a vie vysvetliť učivo rôznymi spôsobmi. Keď som to potrebovala, vždy mi učivo vedela vysvetliť jednoduchým a pochopiteľným spôsobom. Má skúsenosti s rôznymi žiakmi, z bilingválu, z normálnej strednej, alebo proste jednoducho povedané, žiakov rôznych vekových kategórii a tak. Skrátka, je to veľmi milá, ľudská, ochotná a pracovitá osoba, takže som za hodiny s ňou rada, vždy sa na ne teším a určite by som nechcela meniť doučovateľku😊'
    },
    {
      id: 3,
      name: 'Daniel K.',
      text: 'Ester je super doučovateľka s príjemným ľudským prístupom a zároveň mierou profesionality, ktorá vám pomôže byť sebavedomejším hovorcom Španielčiny. Určite odporúčam :)'
    },
    {
      id: 4,
      name: 'Megan J.',
      text: 'Osobne by som odporúčala. Vie veľmi dobre učiť, vždy má všetko naplánované a vie výborne vysvetľovať. Vždy sa teším na jej hodiny. Mám veľmi rada jej spôsob a postoj k učeniu. Motivuje ma to. Nerobím s ňou dlho ale už na sebe vidím zmeny. Je komunikatívna, priateľská a vie sa prispôsobiť. Mám ju veľmi rada a nikdy by som nechcela niekoho iného 💜'
    },
    {
      id: 5,
      name: 'Janka E.',
      text: 'Určite vrelo odporúčam Ester, mladú energicku babu, ktorá je veľmi ľudská a vie sa prispôsobiť podmienkam na mieru žiaka🙂🥰'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials?.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials?.length) % testimonials?.length);
  };

  const currentTestimonial = testimonials?.[currentSlide];

  return (
    <div className="bg-white rounded-xl shadow-soft border overflow-hidden">
      <div className="bg-gradient-cultural p-6 text-center">
        <h3 className="text-2xl font-headlines font-bold text-white mb-2">
          Príbehy úspechu
        </h3>
        <p className="text-white/90">
          Čo hovoria moji študenti o lekciách španielčiny
        </p>
      </div>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="hover:bg-muted"
          >
            <Icon name="ChevronLeft" size={20} />
          </Button>

          <div className="flex space-x-2">
            {testimonials?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSlide ? 'bg-primary w-6' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="hover:bg-muted"
          >
            <Icon name="ChevronRight" size={20} />
          </Button>
        </div>

        {/* Testimonial Text */}
        <div className="bg-muted rounded-lg p-6 mb-6">
          <p className="text-2xl font-headlines font-semibold text-primary mb-4 text-center">
            {currentTestimonial?.name}
          </p>
          <p className="text-foreground leading-relaxed whitespace-pre-line text-center">
            {currentTestimonial?.text}
          </p>
        </div>

        <div className="flex justify-center">
          <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2">
            <Icon name="CheckCircle" size={14} />
            Autentická recenzia
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlider;
