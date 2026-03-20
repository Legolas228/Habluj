import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../hooks/useTranslation';

const ContactHero = () => {
  const { language } = useTranslation();
  const copy = {
    sk: {
      title: 'Kontaktujte nás',
      subtitle: 'Sme tu pre vás! Či už máte otázky o výučbe španielčiny, potrebujete technickú podporu alebo chcete začať svoju jazykovú cestu - radi vám pomôžeme.',
      fastTitle: 'Rýchla odpoveď',
      fastDesc: 'Odpovedáme do 3 hodín v pracovných dňoch',
      personalTitle: 'Osobný prístup',
      personalDesc: 'Každý študent je pre nás jedinečný',
      trustTitle: 'Dôveryhodnosť',
      trustDesc: 'Vaše údaje sú v bezpečí',
    },
    cz: {
      title: 'Kontaktujte nás',
      subtitle: 'Jsme tu pro vás! Ať už máte dotazy k výuce španělštiny, potřebujete technickou podporu nebo chcete začít svou jazykovou cestu, rádi pomůžeme.',
      fastTitle: 'Rychlá odpověď',
      fastDesc: 'Odpovídáme do 3 hodin v pracovních dnech',
      personalTitle: 'Osobní přístup',
      personalDesc: 'Každý student je pro nás jedinečný',
      trustTitle: 'Důvěryhodnost',
      trustDesc: 'Vaše údaje jsou v bezpečí',
    },
    es: {
      title: 'Contáctanos',
      subtitle: 'Estamos a su disposición. Si desea información sobre las clases de español, soporte técnico o iniciar su itinerario de aprendizaje, estaremos encantados de atenderle.',
      fastTitle: 'Respuesta rápida',
      fastDesc: 'Respondemos en un plazo aproximado de 3 horas en días laborables',
      personalTitle: 'Atención personalizada',
      personalDesc: 'Cada estudiante recibe un acompañamiento individualizado',
      trustTitle: 'Confianza',
      trustDesc: 'Sus datos se tratan con garantías de seguridad',
    },
  }[language === 'cz' ? 'cz' : language === 'es' ? 'es' : 'sk'];

  return (
    <section className="bg-gradient-cultural text-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Icon name="MessageCircle" size={32} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-headlines font-bold mb-6 text-reveal">
            {copy.title}
          </h1>
          
          <p className="text-xl lg:text-2xl text-white/90 mb-8 font-body leading-relaxed">
            {copy.subtitle}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon name="Clock" size={24} className="text-white" />
              </div>
              <h3 className="font-headlines font-semibold text-lg mb-2">{copy.fastTitle}</h3>
              <p className="text-white/80 text-sm">{copy.fastDesc}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon name="Users" size={24} className="text-white" />
              </div>
              <h3 className="font-headlines font-semibold text-lg mb-2">{copy.personalTitle}</h3>
              <p className="text-white/80 text-sm">{copy.personalDesc}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon name="Shield" size={24} className="text-white" />
              </div>
              <h3 className="font-headlines font-semibold text-lg mb-2">{copy.trustTitle}</h3>
              <p className="text-white/80 text-sm">{copy.trustDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
