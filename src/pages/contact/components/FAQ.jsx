import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import { contactInfo } from '../../../utils/contactInfo';
import { useTranslation } from '../../../hooks/useTranslation';

const faqContent = {
  sk: {
    categories: [
      { id: 'all', label: 'Všetko', icon: 'List' },
      { id: 'teaching', label: 'Výučba', icon: 'BookOpen' },
      { id: 'booking', label: 'Rezervácie', icon: 'Calendar' },
      { id: 'technical', label: 'Technika', icon: 'Settings' },
      { id: 'pricing', label: 'Cena', icon: 'CreditCard' },
    ],
    title: 'Často kladené otázky',
    subtitle: 'Nájdite odpovede na najčastejšie otázky o lekciách, rezerváciách a technických detailoch.',
    searchPlaceholder: 'Hľadať v otázkach...',
    emptyTitle: 'Nenašli sa žiadne výsledky',
    emptyText: 'Skúste iný výraz alebo kategóriu.',
    ctaTitle: 'Nenašli ste odpoveď?',
    ctaText: 'Napíšte nám priamo a pomôžeme vám s výberom správneho postupu.',
    emailCta: 'Napísať email',
    igCta: 'Instagram',
    faqs: [
      { id: 1, category: 'teaching', question: 'Ako prebiehajú online lekcie?', answer: 'Lekcie prebiehajú individuálne cez online videohovor. Obsah je prispôsobený vašej úrovni, cieľom a tempu učenia.' },
      { id: 2, category: 'booking', question: 'Ako si rezervujem termín?', answer: 'Termín si vyberiete v rezervačnom systéme. Po potvrdení dostanete všetky inštrukcie na email.' },
      { id: 3, category: 'pricing', question: 'Aká je cena lekcie?', answer: 'Štandardná cena je 20 € za 60 minút. Aktuálne podmienky a dostupnosť vidíte na stránke služieb.' },
      { id: 4, category: 'technical', question: 'Čo potrebujem na online hodinu?', answer: 'Stabilný internet, mikrofón, slúchadlá a tiché prostredie. Pred prvou hodinou vieme spraviť krátky technický test.' },
    ],
  },
  cz: {
    categories: [
      { id: 'all', label: 'Vše', icon: 'List' },
      { id: 'teaching', label: 'Výuka', icon: 'BookOpen' },
      { id: 'booking', label: 'Rezervace', icon: 'Calendar' },
      { id: 'technical', label: 'Technika', icon: 'Settings' },
      { id: 'pricing', label: 'Cena', icon: 'CreditCard' },
    ],
    title: 'Často kladené otázky',
    subtitle: 'Najdete odpovědi na nejčastější otázky o lekcích, rezervacích a technických detailech.',
    searchPlaceholder: 'Hledat v otázkách...',
    emptyTitle: 'Nenalezeny žádné výsledky',
    emptyText: 'Zkuste jiný výraz nebo kategorii.',
    ctaTitle: 'Nenašli jste odpověď?',
    ctaText: 'Napište nám přímo a pomůžeme vám vybrat správný postup.',
    emailCta: 'Napsat email',
    igCta: 'Instagram',
    faqs: [
      { id: 1, category: 'teaching', question: 'Jak probíhají online lekce?', answer: 'Lekce probíhají individuálně přes online videohovor. Obsah je přizpůsoben vaší úrovni, cílům a tempu učení.' },
      { id: 2, category: 'booking', question: 'Jak si rezervuji termín?', answer: 'Termín si vyberete v rezervačním systému. Po potvrzení dostanete všechny instrukce na email.' },
      { id: 3, category: 'pricing', question: 'Jaká je cena lekce?', answer: 'Standardní cena je 500 Kč za 60 minut. Aktuální podmínky a dostupnost najdete na stránce služeb.' },
      { id: 4, category: 'technical', question: 'Co potřebuji na online hodinu?', answer: 'Stabilní internet, mikrofon, sluchátka a klidné prostředí. Před první hodinou můžeme udělat krátký technický test.' },
    ],
  },
  es: {
    categories: [
      { id: 'all', label: 'Todo', icon: 'List' },
      { id: 'teaching', label: 'Clases', icon: 'BookOpen' },
      { id: 'booking', label: 'Reservas', icon: 'Calendar' },
      { id: 'technical', label: 'Técnica', icon: 'Settings' },
      { id: 'pricing', label: 'Precio', icon: 'CreditCard' },
    ],
    title: 'Preguntas frecuentes',
    subtitle: 'Aquí encontrará respuestas claras sobre clases, reservas y aspectos técnicos.',
    searchPlaceholder: 'Buscar en preguntas...',
    emptyTitle: 'No se encontraron resultados',
    emptyText: 'Prueba otro término o categoría.',
    ctaTitle: '¿No ha encontrado su respuesta?',
    ctaText: 'Escríbanos directamente y le ayudaremos a elegir el siguiente paso más adecuado.',
    emailCta: 'Enviar correo',
    igCta: 'Instagram',
    faqs: [
      { id: 1, category: 'teaching', question: '¿Cómo se imparten las clases online?', answer: 'Las clases son individuales por videollamada. El contenido se adapta a su nivel, objetivos y ritmo de aprendizaje.' },
      { id: 2, category: 'booking', question: '¿Cómo puedo reservar una clase?', answer: 'Puede seleccionar el horario en el sistema de reservas. Tras confirmar, recibirá todas las instrucciones por correo electrónico.' },
      { id: 3, category: 'pricing', question: '¿Cuál es el precio de una clase?', answer: 'El precio estándar es de 20 € por sesión de 60 minutos. Consulte condiciones y disponibilidad en la página de servicios.' },
      { id: 4, category: 'technical', question: '¿Qué necesito para una clase online?', answer: 'Necesitará una conexión estable, micrófono, auriculares y un entorno tranquilo. Antes de la primera sesión podemos realizar una prueba técnica.' },
    ],
  },
};

const FAQ = () => {
  const { language } = useTranslation();
  const content = faqContent[language === 'cz' ? 'cz' : language === 'es' ? 'es' : 'sk'];
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState(new Set());

  const filteredFAQs = content.faqs.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || item.question.toLowerCase().includes(term) || item.answer.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id) => {
    const next = new Set(openItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenItems(next);
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <section className="py-16 lg:py-24 bg-background">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-headlines font-bold text-foreground mb-6">{content.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{content.subtitle}</p>
        </div>

        <div className="mb-8">
          <div className="max-w-md mx-auto mb-6">
            <Input
              type="search"
              placeholder={content.searchPlaceholder}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {content.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category.id ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <Icon name={category.icon} size={16} />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">{content.emptyTitle}</h3>
              <p className="text-muted-foreground">{content.emptyText}</p>
            </div>
          ) : (
            filteredFAQs.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-soft border border-border overflow-hidden">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <h3 className="font-medium text-foreground pr-4">{item.question}</h3>
                  <Icon name={openItems.has(item.id) ? 'ChevronUp' : 'ChevronDown'} size={20} className="text-muted-foreground flex-shrink-0" />
                </button>
                {openItems.has(item.id) && (
                  <div className="px-6 pb-4">
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{item.answer}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-muted rounded-lg p-8 max-w-2xl mx-auto">
            <Icon name="HelpCircle" size={32} className="text-primary mx-auto mb-4" />
            <h3 className="text-xl font-headlines font-semibold text-foreground mb-3">{content.ctaTitle}</h3>
            <p className="text-muted-foreground mb-6">{content.ctaText}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`mailto:${contactInfo.email}`}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                aria-label={`Send email to ${contactInfo.email}`}
              >
                <Icon name="Mail" size={18} className="mr-2" />
                {content.emailCta}
              </a>
              <a
                href={`https://instagram.com/${contactInfo.instagram}`}
                className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground rounded-md hover:bg-muted transition-colors"
                aria-label={`Open Instagram profile @${contactInfo.instagram}`}
              >
                <Icon name="Instagram" size={18} className="mr-2" />
                {content.igCta}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
