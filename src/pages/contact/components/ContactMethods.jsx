import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { contactInfo, getContactLinks } from '../../../utils/contactInfo';
import { useTranslation } from '../../../hooks/useTranslation';
import { openSetmoreBooking } from '../../../utils/setmore';

const ContactMethods = () => {
  const { language } = useTranslation();
  const text = {
    sk: {
      emailDesc: 'Pre všeobecné otázky a informácie',
      emailAction: 'Napísať email',
      igDesc: 'Sledujte nás na sociálnych sieťach',
      igAction: 'Sledovať',
      title: 'Vyberte si spôsob komunikácie',
      subtitle: 'Ponúkame viacero možností, ako sa s nami môžete spojiť. Vyberte si tú, ktorá vám najviac vyhovuje.',
      recommended: 'Odporúčané',
      hoursTitle: 'Pracovné hodiny',
      hours: 'Pondelok - Piatok: 9:00 - 18:00\nSobota: 10:00 - 14:00\nNedeľa: Zatvorené',
      hoursNote: 'Mimo pracovných hodín odpovedáme do nasledujúceho pracovného dňa',
    },
    cz: {
      emailDesc: 'Pro obecné dotazy a informace',
      emailAction: 'Napsat email',
      igDesc: 'Sledujte nás na sociálních sítích',
      igAction: 'Sledovat',
      title: 'Vyberte si způsob komunikace',
      subtitle: 'Nabízíme více možností, jak se s námi spojit. Vyberte si tu, která vám nejvíce vyhovuje.',
      recommended: 'Doporučeno',
      hoursTitle: 'Pracovní hodiny',
      hours: 'Pondělí - Pátek: 9:00 - 18:00\nSobota: 10:00 - 14:00\nNeděle: Zavřeno',
      hoursNote: 'Mimo pracovní dobu odpovídáme následující pracovní den',
    },
    es: {
      emailDesc: 'Para preguntas generales e información',
      emailAction: 'Enviar correo',
      igDesc: 'Síguenos en redes sociales',
      igAction: 'Seguir',
      title: 'Elige tu canal de contacto',
      subtitle: 'Le ofrecemos varias vías de comunicación. Seleccione la que mejor se adapte a sus preferencias.',
      recommended: 'Recomendado',
      hoursTitle: 'Horario de atención',
      hours: 'Lunes - Viernes: 9:00 - 18:00\nSábado: 10:00 - 14:00\nDomingo: Cerrado',
      hoursNote: 'Fuera de este horario, respondemos el siguiente día laborable',
    },
  }[language === 'cz' ? 'cz' : language === 'es' ? 'es' : 'sk'];

  const contactMethods = [
    {
      id: 1,
      icon: "Mail",
      title: "Email",
      description: text.emailDesc,
      contact: contactInfo.email,
      action: text.emailAction,
      primary: true,
      link: getContactLinks.email()
    },
    {
      id: 2,
      icon: "Instagram",
      title: "Instagram",
      description: text.igDesc,
      contact: `@${contactInfo.instagram}`,
      action: text.igAction,
      primary: false,
      link: getContactLinks.instagram()
    }
  ];

  const handleContactAction = (method) => {
    if (method?.link) {
      window.open(method.link, '_blank');
      return;
    }
    
    switch (method?.icon) {
      case "Mail":
        window.location.href = `mailto:${method?.contact}`;
        break;
      case "Calendar":
        openSetmoreBooking();
        break;
      default:
        break;
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-headlines font-bold text-foreground mb-6">
            {text.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {text.subtitle}
          </p>
        </div>

        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(260px,360px))] justify-center gap-6">
          {contactMethods?.map((method) => (
            <div
              key={method?.id}
              className={`relative bg-white rounded-xl p-6 shadow-soft hover:shadow-warm transition-all duration-300 border ${
                method?.primary ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30'
              }`}
            >
              {method?.primary && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      {text.recommended}
                    </span>
                </div>
              )}

              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  method?.primary ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}>
                  <Icon name={method?.icon} size={28} />
                </div>

                <h3 className="text-xl font-headlines font-semibold text-foreground mb-2">
                  {method?.title}
                </h3>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {method?.description}
                </p>

                <div className="mb-4">
                  <p className="font-medium text-foreground text-sm mb-1">
                    {method?.contact}
                  </p>
                </div>

                <Button
                  variant={method?.primary ? "default" : "outline"}
                  size="sm"
                  fullWidth
                  onClick={() => handleContactAction(method)}
                  className={method?.primary ? "bg-primary hover:bg-primary/90" : ""}
                >
                  {method?.action}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-muted rounded-lg p-6 max-w-2xl mx-auto">
            <Icon name="Info" size={24} className="text-primary mx-auto mb-3" />
            <h3 className="font-headlines font-semibold text-lg mb-2">{text.hoursTitle}</h3>
            <p className="text-muted-foreground text-sm mb-3">
              {text.hours.split('\n').map((line) => (
                <React.Fragment key={line}>
                  {line}<br />
                </React.Fragment>
              ))}
            </p>
            <p className="text-xs text-muted-foreground">
              {text.hoursNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactMethods;
