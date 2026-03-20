import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const TestimonialSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Martina Kováčová",
      role: "Manažérka v medzinárodnej firme",
      location: "Bratislava",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: `Učenie s Elenou bolo fantastické! Ako Slovenka presne rozumie problémom, ktoré máme s výslovnosťou a gramatikou. Za 6 mesiacov som sa dostala z úplného začiatočníka na úroveň B1.\n\nNajviac sa mi páčilo, že každá lekcia bola prispôsobená mojim potrebám. Ester mi pomohla pripraviť sa na obchodné rokovania v španielčine.`,
      achievement: "A1 → B1 za 6 mesiacov",
      course: "Obchodná španielčina"
    },
    {
      id: 2,
      name: "Tomáš Novák",
      role: "Študent medicíny",
      location: "Praha",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: `Potreboval som sa pripraviť na DELE B2 za 3 mesiace. Ester mi vytvorila intenzívny plán a každý týždeň sme mali 3 lekcie. Skúšku som zvládol na prvý pokus!\n\nEster má skvelé materiály a vie presne, na čo sa zamerať pri príprave na certifikáty. Odporúčam každému, kto sa chce pripraviť na DELE.`,
      achievement: "DELE B2 úspešne na prvý pokus",
      course: "Príprava na DELE"
    },
    {
      id: 3,
      name: "Jana Svobodová",
      role: "Cestovateľka a blogerka",
      location: "Brno",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: `Chcela som sa naučiť španielčinu pre cestovanie po Južnej Amerike. Ester mi nielen naučila jazyk, ale aj kultúrne zvyklosti jednotlivých krajín.\n\nDnes plynule komunikujem v španielčine a cítim sa sebisto v akejkoľvek situácii. Moja cesta po Argentíne a Chile bola úžasná práve vďaka tomu!`,
      achievement: "Plynulá komunikácia za 8 mesiacov",
      course: "Konverzačná španielčina"
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

        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <Image
              src={currentTestimonial?.image}
              alt={currentTestimonial?.name}
              className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-white shadow-soft"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-1">
              <Icon name="Quote" size={16} className="text-white" />
            </div>
          </div>

          <h4 className="text-xl font-headlines font-bold text-foreground mb-1">
            {currentTestimonial?.name}
          </h4>
          <p className="text-muted-foreground text-sm mb-2">
            {currentTestimonial?.role}
          </p>
          <p className="text-muted-foreground text-xs mb-4">
            <Icon name="MapPin" size={12} className="inline mr-1" />
            {currentTestimonial?.location}
          </p>

          {/* Rating */}
          <div className="flex justify-center mb-6">
            {[...Array(currentTestimonial?.rating)]?.map((_, i) => (
              <Icon key={i} name="Star" size={16} className="text-yellow-400 fill-current" />
            ))}
          </div>
        </div>

        {/* Testimonial Text */}
        <div className="bg-muted rounded-lg p-6 mb-6">
          <p className="text-foreground leading-relaxed whitespace-pre-line text-center">
            "{currentTestimonial?.text}"
          </p>
        </div>

        {/* Achievement Badges */}
        <div className="flex flex-wrap justify-center gap-3">
          <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
            <Icon name="Trophy" size={14} className="inline mr-1" />
            {currentTestimonial?.achievement}
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            <Icon name="BookOpen" size={14} className="inline mr-1" />
            {currentTestimonial?.course}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlider;
