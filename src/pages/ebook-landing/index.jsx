import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import SiteFooter from '../../components/ui/SiteFooter';
import AppIcon from '../../components/AppIcon';
import { getCanonicalUrl, getHreflangLinks, DEFAULT_OG_IMAGE } from '../../utils/seo';
import { cn } from '../../utils/cn';

const EBOOK_PAYMENT_URL = 'https://buy.stripe.com/bJeaEQeLB3Q94Sf48L5kk00?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAb21jcAUodmtleHRuA2FlbQMxMDAAcGRvZgJzcnRjBmFwcF9pZA81NjcwNjczNDMzNTI0MjcAAad4NcfZzC6KXLe2IU7ltBKfPnyVkFbl5DguPT7UZ0N25_Sntz65xHF3cqmvZQ_aem_Ikxa2xI5sLZzgk28boLw2A';

const copy = {
  sk: {
    metaTitle: 'eBook Španielčina bez strachu | Habluj',
    metaDescription: 'Digitálny eBook pre Slovákov a Čechov, ktorí chcú začať hovoriť po španielsky istejšie a bez zbytočného stresu.',
    heroBadge: 'Digitálny eBook PDF',
    sampleTitle: 'Ukážka knihy',
    sampleSubtitle: 'Pozrite si niekoľko strán z knihy a objavte jej metódu, štruktúru a cvičenia.',
    bookTitle: 'Španielčina',
    bookSubtitle: 'bez strachu',
    title: 'Prestaňte sa učiť španielčinu naslepo',
    subtitle: 'Praktický eBook, ktorý Vám vytvorí pevné základy španielčiny. V čom sa táto kniha líši od bežných učebníc španielčiny? Okrem toho, že v každej lekcii nájdete 19 - 25 praktických cvičení na precvičenie gramatiky, je navrhnutá našou kruhovou metódou. Táto metóda podporuje skoré rozprávanie študenta a to práve vďaka tomu, že vrámci piatich lekcií sa naučíte ako prítomný, tak aj budúci a minulý čas. V knihe sa nachádza viac ako 600 slov vrámci slovnej zásoby. Každá lekcia obsahuje jasne vysvetlenú gramatiku a záver lekcie s užitočnými radami s učeniu.',
    cta: 'Kúpiť za 24,90 €',
    secureBadge: 'Bezpečná platba a okamžitý prístup',
    proof: [
      'Čítanie na mobile, tablete aj počítači',
      'Okamžitý prístup po zaplatení',
      'eBook vo formáte PDF',
    ],
    reviewsTitle: 'Čo hovoria o eBooku',
    reviewsSubtitle: 'Skutočné skúsenosti s knihou Háblame en español.',
    reviews: [
      ['Aďka', 'Ester, veľmi pekne ďakujem za tvoju knihu Háblame en español. Dosiaľ najlepšia učebná pomôcka na učenie španielčiny, aká sa mi dostala do rúk. Je prehľadná, bohatá na slovnú zásobu a cvičenia a predovšetkým je v nej zrozumiteľne vysvetlená gramatika. Ďakujem ti veľmi pekne.'],
      ['Judita', 'Kniha Háblame en español je za mňa najlepšia pomôcka na učenie sa španielčiny. Veľké množstvo slovnej zásoby mi pomáha lepšie rozumieť textom. Cvičenia sú pre mňa ľahko spracovateľné vďaka podrobne vysvetlenej gramatike. A vďaka prehľadnosti sa viem vždy rýchlo vrátiť k tomu, čo si chcem zopakovať 😊'],
      ['Karin', 'Chcela by som vám odporučiť e-book od Ester. Kniha je prehľadná a krásne farebne rozdelená do kapitol. Každá kapitola má bohatú slovnú zásobu a veľa cvičení. Vďaka tejto knihe sa mi španielčina ľahšie učí a všetky potrebné veci nájdem na jednom mieste.'],
      ['Sylvia', 'Kniha je perfektná a super spracovaná. Oceňujem, že je v nej všetko jasne vysvetlené, obsahuje bohatú slovnú zásobu a dostatočné množstvo cvičení. Tuším mám novú závislosť :D Odkedy mi kniha prišla, teším sa na španielčinu každý deň. :)'],
    ],
    chaptersTitle: 'Čo sa v eBooku naučíte',
    chaptersSubtitle: 'Konkrétne bloky zamerané na problémy, ktoré pri španielčine najčastejšie brzdia slovenských a českých študentov.',
    chapters: [
      ['Ako sa učiť španielčinu bez chaosu', 'Jednoduchý systém, ktorý vám pomôže vedieť, čo robiť ako prvé a čomu venovať čas.'],
      ['Najčastejšie chyby Slovákov a Čechov', 'Výslovnosť, gramatické pasce a zvyky, ktoré si z materinského jazyka prenášame do španielčiny.'],
      ['Rozprávanie bez paniky', 'Ako trénovať hovorenie tak, aby ste sa nezasekli pri prvej vete.'],
      ['Gramatika ako nástroj, nie strašiak', 'Ako pochopiť systém jazyka bez memorovania izolovaných poučiek.'],
      ['Kultúra a prirodzené frázy', 'Výrazy a kontext, vďaka ktorým španielčina začne znieť živšie a prirodzenejšie.'],
    ],
    fitTitle: 'Pre koho je tento eBook',
    goodFitTitle: 'Je pre vás, ak...',
    badFitTitle: 'Nie je pre vás, ak...',
    goodFit: [
      'chcete začať hovoriť po španielsky bez hanby',
      'potrebujete jasný plán namiesto náhodných aplikácií',
      'ste Slovák alebo Čech a chcete vysvetlenia, ktoré vám dávajú zmysel',
      'ste ochotní robiť malé, pravidelné kroky',
    ],
    badFit: [
      'hľadáte magický trik bez práce',
      'chcete iba zbierať frázy bez pochopenia systému',
      'potrebujete oficiálnu prípravu na DELE alebo SIELE',
      'nechcete venovať učeniu čas mimo čítania',
    ],
    pricingTitle: 'Získajte eBook ešte dnes',
    priceLabel: 'Jednorazová platba',
    checkout: 'Kúpiť teraz',
    loading: 'Pripravujem platbu...',
    includesTitle: 'Čo dostanete',
    includes: [
      'eBook vo formáte PDF',
      'Prístup na čítanie v akomkoľvek zariadení',
      'Budúce menšie aktualizácie zdarma',
    ],
    faqTitle: 'Časté otázky',
    faqs: [
      ['V akom formáte príde?', 'Súčasťou nákupu je PDF, takže si ho môžete prečítať v prehliadači, mobile, tablete alebo čítačke.'],
      ['Môžem ho čítať na Kindle?', 'Áno, PDF môžete čítať aj na Kindle.'],
      ['Je eBook vhodný pre úplných začiatočníkov?', 'Áno. Je písaný tak, aby pomohol najmä ľuďom, ktorí chcú začať španielčinu od základov rozumne a bez chaosu.'],
    ],
  },
  cs: {
    metaTitle: 'eBook Španělština bez strachu | Habluj',
    metaDescription: 'Digitální eBook pro Slováky a Čechy, kteří chtějí začít mluvit španělsky jistěji a bez zbytečného stresu.',
    heroBadge: 'Digitální eBook PDF',
    sampleTitle: 'Ukázka knihy',
    sampleSubtitle: 'Prohlédněte si několik stran knihy a objevte její metodu, strukturu a cvičení.',
    bookTitle: 'Španělština',
    bookSubtitle: 'bez strachu',
    title: 'Přestaňte se učit španělštinu naslepo',
    subtitle: 'Praktický eBook, který vám ukáže, jak si postavit pevné základy, vyhnout se typickým chybám Čechů a Slováků a začít mluvit sebejistěji.',
    cta: 'Koupit za 625 CZK',
    secureBadge: 'Bezpečná platba a okamžitý přístup',
    proof: [
      'Čtení na mobilu, tabletu i počítači',
      'Okamžitý přístup po zaplacení',
      'eBook ve formátu PDF',
    ],
    reviewsTitle: 'Co říkají o eBooku',
    reviewsSubtitle: 'Skutečné zkušenosti s knihou Háblame en español.',
    reviews: [
      ['Aďka', 'Ester, veľmi pekne ďakujem za tvoju knihu Háblame en español. Dosiaľ najlepšia učebná pomôcka na učenie španielčiny, aká sa mi dostala do rúk. Je prehľadná, bohatá na slovnú zásobu a cvičenia a predovšetkým je v nej zrozumiteľne vysvetlená gramatika. Ďakujem ti veľmi pekne.'],
      ['Judita', 'Kniha Háblame en español je za mňa najlepšia pomôcka na učenie sa španielčiny. Veľké množstvo slovnej zásoby mi pomáha lepšie rozumieť textom. Cvičenia sú pre mňa ľahko spracovateľné vďaka podrobne vysvetlenej gramatike. A vďaka prehľadnosti sa viem vždy rýchlo vrátiť k tomu, čo si chcem zopakovať 😊'],
      ['Karin', 'Chcela by som vám odporučiť e-book od Ester. Kniha je prehľadná a krásne farebne rozdelená do kapitol. Každá kapitola má bohatú slovnú zásobu a veľa cvičení. Vďaka tejto knihe sa mi španielčina ľahšie učí a všetky potrebné veci nájdem na jednom mieste.'],
      ['Sylvia', 'Kniha je perfektná a super spracovaná. Oceňujem, že je v nej všetko jasne vysvetlené, obsahuje bohatú slovnú zásobu a dostatočné množstvo cvičení. Tuším mám novú závislosť :D Odkedy mi kniha prišla, teším sa na španielčinu každý deň. :)'],
    ],
    chaptersTitle: 'Co se v eBooku naučíte',
    chaptersSubtitle: 'Konkrétní bloky zaměřené na problémy, které ve španělštině nejčastěji brzdí české a slovenské studenty.',
    chapters: [
      ['Jak se učit španělštinu bez chaosu', 'Jednoduchý systém, díky kterému víte, co dělat jako první a čemu věnovat čas.'],
      ['Nejčastější chyby Čechů a Slováků', 'Výslovnost, gramatické pasti a zvyky, které si z mateřštiny přenášíme do španělštiny.'],
      ['Mluvení bez paniky', 'Jak trénovat mluvení tak, abyste se nezasekli u první věty.'],
      ['Gramatika jako nástroj, ne strašák', 'Jak pochopit systém jazyka bez memorování izolovaných pouček.'],
      ['Kultura a přirozené fráze', 'Výrazy a kontext, díky kterým začne španělština znít živěji a přirozeněji.'],
    ],
    fitTitle: 'Pro koho je tento eBook',
    goodFitTitle: 'Je pro vás, pokud...',
    badFitTitle: 'Není pro vás, pokud...',
    goodFit: [
      'chcete začít mluvit španělsky bez studu',
      'potřebujete jasný plán místo náhodných aplikací',
      'jste Čech nebo Slovák a chcete vysvětlení, která dávají smysl',
      'jste ochotni dělat malé, pravidelné kroky',
    ],
    badFit: [
      'hledáte kouzelný trik bez práce',
      'chcete jen sbírat fráze bez pochopení systému',
      'potřebujete oficiální přípravu na DELE nebo SIELE',
      'nechcete věnovat učení čas mimo čtení',
    ],
    pricingTitle: 'Získejte eBook ještě dnes',
    priceLabel: 'Jednorázová platba',
    checkout: 'Koupit teď',
    loading: 'Připravuji platbu...',
    includesTitle: 'Co dostanete',
    includes: [
      'eBook ve formátu PDF',
      'Přístup ke čtení na jakémkoli zařízení',
      'Budoucí menší aktualizace zdarma',
    ],
    faqTitle: 'Časté otázky',
    faqs: [
      ['V jakém formátu přijde?', 'Součástí nákupu je PDF, takže si ho můžete přečíst v prohlížeči, mobilu, tabletu nebo čtečce.'],
      ['Můžu ho číst na Kindle?', 'Ano, PDF můžete číst i na Kindle.'],
      ['Je eBook vhodný pro úplné začátečníky?', 'Ano. Je napsaný tak, aby pomohl hlavně lidem, kteří chtějí začít španělštinu od základů rozumně a bez chaosu.'],
    ],
  },
  es: {
    metaTitle: 'eBook Español sin miedo | Habluj',
    metaDescription: 'eBook digital para personas de habla eslovaca y checa que quieren empezar a hablar español con más seguridad y sin estrés innecesario.',
    heroBadge: 'eBook digital PDF',
    sampleTitle: 'Muestra del libro',
    sampleSubtitle: 'Mira algunas páginas del libro y descubre su método, estructura y ejercicios.',
    bookTitle: 'Español',
    bookSubtitle: 'sin miedo',
    title: 'Deja de aprender español a ciegas',
    subtitle: 'Un eBook práctico que te muestra cómo construir una base sólida, evitar los errores más comunes de eslovacos y checos y empezar a hablar con más confianza.',
    cta: 'Comprar por 24,90 €',
    secureBadge: 'Pago seguro y acceso instantáneo',
    proof: [
      'Lee en móvil, tableta u ordenador',
      'Acceso instantáneo después del pago',
      'eBook en formato PDF',
    ],
    reviewsTitle: 'Qué opinan sobre el eBook',
    reviewsSubtitle: 'Experiencias reales con el libro Háblame en español.',
    reviews: [
      ['Aďka', 'Ester, veľmi pekne ďakujem za tvoju knihu Háblame en español. Dosiaľ najlepšia učebná pomôcka na učenie španielčiny, aká sa mi dostala do rúk. Je prehľadná, bohatá na slovnú zásobu a cvičenia a predovšetkým je v nej zrozumiteľne vysvetlená gramatika. Ďakujem ti veľmi pekne.'],
      ['Judita', 'Kniha Háblame en español je za mňa najlepšia pomôcka na učenie sa španielčiny. Veľké množstvo slovnej zásoby mi pomáha lepšie rozumieť textom. Cvičenia sú pre mňa ľahko spracovateľné vďaka podrobne vysvetlenej gramatike. A vďaka prehľadnosti sa viem vždy rýchlo vrátiť k tomu, čo si chcem zopakovať 😊'],
      ['Karin', 'Chcela by som vám odporučiť e-book od Ester. Kniha je prehľadná a krásne farebne rozdelená do kapitol. Každá kapitola má bohatú slovnú zásobu a veľa cvičení. Vďaka tejto knihe sa mi španielčina ľahšie učí a všetky potrebné veci nájdem na jednom mieste.'],
      ['Sylvia', 'Kniha je perfektná a super spracovaná. Oceňujem, že je v nej všetko jasne vysvetlené, obsahuje bohatú slovnú zásobu a dostatočné množstvo cvičení. Tuším mám novú závislosť :D Odkedy mi kniha prišla, teším sa na španielčinu každý deň. :)'],
    ],
    chaptersTitle: 'Qué aprenderás en el eBook',
    chaptersSubtitle: 'Bloques concretos para superar los problemas que más frenan a los estudiantes eslovacos y checos de español.',
    chapters: [
      ['Cómo aprender español sin caos', 'Un sistema sencillo para saber qué hacer primero y dónde merece la pena invertir tu tiempo.'],
      ['Los errores más comunes de eslovacos y checos', 'Pronunciación, trampas gramaticales y hábitos que trasladamos de nuestra lengua materna al español.'],
      ['Hablar sin entrar en pánico', 'Cómo practicar la conversación para no bloquearte en la primera frase.'],
      ['La gramática como herramienta', 'Cómo entender el sistema del idioma sin memorizar reglas aisladas.'],
      ['Cultura y expresiones naturales', 'Expresiones y contexto para que tu español suene más vivo y natural.'],
    ],
    fitTitle: 'Para quién es este eBook',
    goodFitTitle: 'Es para ti si...',
    badFitTitle: 'No es para ti si...',
    goodFit: [
      'quieres empezar a hablar español sin vergüenza',
      'necesitas un plan claro en lugar de aplicaciones al azar',
      'eres de Eslovaquia o Chequia y quieres explicaciones que tengan sentido',
      'estás dispuesto a avanzar con pasos pequeños y constantes',
    ],
    badFit: [
      'buscas un truco mágico sin esfuerzo',
      'solo quieres coleccionar frases sin entender el sistema',
      'necesitas preparación oficial para DELE o SIELE',
      'no quieres dedicar tiempo al aprendizaje fuera de la lectura',
    ],
    pricingTitle: 'Consigue el eBook hoy mismo',
    priceLabel: 'Pago único',
    checkout: 'Comprar ahora',
    loading: 'Preparando el pago...',
    includesTitle: 'Qué incluye',
    includes: [
      'eBook en formato PDF',
      'Acceso desde cualquier dispositivo',
      'Pequeñas actualizaciones futuras gratuitas',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      ['¿En qué formato viene?', 'La compra incluye el PDF, para que puedas leerlo en el navegador, móvil, tableta u otro lector.'],
      ['¿Puedo leerlo en Kindle?', 'Sí, también puedes leer el PDF en Kindle.'],
      ['¿Es adecuado para principiantes absolutos?', 'Sí. Está escrito especialmente para quienes quieren empezar español desde cero de forma clara y sin caos.'],
    ],
  },
};

const priceByLanguage = {
  sk: { amount: '24.90', currency: '€', label: '24,90 €' },
  cs: { amount: '625', currency: 'CZK', label: '625 CZK' },
  es: { amount: '24.90', currency: '€', label: '24,90 €' },
};

const normalizeLang = (lang) => {
  if (lang === 'es') return 'es';
  if (lang === 'cs' || lang === 'cz') return 'cs';
  return 'sk';
};

const samplePages = [1, 2, 6, 8, 21, 48, 64, 76, 79, 104, 144, 172];

const SectionHeader = ({ title, subtitle }) => (
  <div className="mx-auto max-w-3xl text-center space-y-3">
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headlines font-bold text-foreground">{title}</h2>
    {subtitle && <p className="text-base sm:text-lg text-muted-foreground">{subtitle}</p>}
  </div>
);

const BookMockup = ({ title, subtitle }) => (
  <div className="mx-auto min-w-0 w-full max-w-sm overflow-hidden rounded-xl border border-border bg-white p-1 shadow-soft">
    <img
      src="/assets/images/portada-ebook.png"
      alt={`${title} ${subtitle}`}
      className="block h-auto w-full max-w-full object-contain"
    />
  </div>
);

const ProofBar = ({ items }) => {
  const icons = ['MonitorSmartphone', 'Download', 'FileText'];

  return (
    <section className="border-y border-border bg-white">
      <div className="w-full max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {items.map((item, index) => {
            const iconName = icons[index] || 'Check';
            return (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <AppIcon name={iconName} size={18} />
                </div>
                <p className="text-sm font-semibold text-foreground">{item}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const EbookReviews = ({ title, subtitle, reviews }) => (
  <section className="bg-muted/30 py-10 sm:py-14 lg:py-20">
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {reviews.map(([name, text]) => (
          <article key={name} className="relative rounded-2xl border border-border bg-white p-6 shadow-soft sm:p-8">
            <AppIcon name="Quote" size={28} className="absolute right-6 top-6 text-primary/20" />
            <h3 className="text-xl font-headlines font-bold text-primary">{name}</h3>
            <p className="mt-4 text-sm leading-relaxed text-foreground">{text}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const ChaptersGrid = ({ content }) => (
  <section className="py-10 sm:py-14 lg:py-20">
    <div className="w-full max-w-7xl mx-auto px-4 space-y-8 sm:px-6 sm:space-y-10 lg:px-8">
      <SectionHeader title={content.chaptersTitle} subtitle={content.chaptersSubtitle} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {content.chapters.map(([title, description], index) => (
          <article key={title} className="rounded-2xl border border-border bg-white p-5 shadow-soft hover:shadow-cultural transition-shadow duration-300 sm:p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-headlines font-bold">
              {String(index + 1).padStart(2, '0')}
            </div>
            <h3 className="text-lg font-headlines font-bold text-foreground">{title}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const SamplePreview = ({ content }) => {
  const [selectedPage, setSelectedPage] = useState(null);

  useEffect(() => {
    if (!selectedPage) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedPage(null);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPage]);

  return (
    <section className="border-b border-border bg-background py-10 sm:py-14 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title={content.sampleTitle} subtitle={content.sampleSubtitle} />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {samplePages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setSelectedPage(page)}
              className="group overflow-hidden rounded-xl border border-border bg-white text-left shadow-sm transition-shadow hover:shadow-md"
              aria-label={`${content.sampleTitle}, página ${page}`}
            >
              <img
                src={`/assets/images/ebook-sample/page-${page}.jpg`}
                alt={`${content.sampleTitle}, página ${page}`}
                className="h-auto w-full max-w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {selectedPage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${content.sampleTitle}, página ${selectedPage}`}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/80 p-4 sm:p-8"
          onClick={() => setSelectedPage(null)}
        >
          <div className="relative max-h-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <img
              src={`/assets/images/ebook-sample/page-${selectedPage}.jpg`}
              alt={`${content.sampleTitle}, página ${selectedPage}`}
              className="max-h-[calc(100vh-2rem)] max-w-full rounded-lg object-contain shadow-cultural sm:max-h-[calc(100vh-4rem)]"
            />
            <button
              type="button"
              onClick={() => setSelectedPage(null)}
              aria-label="Cerrar muestra"
              className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/80 text-white shadow-md transition-colors hover:bg-foreground"
            >
              <AppIcon name="X" size={20} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

const AudienceFit = ({ content }) => (
  <section className="bg-muted/50 py-10 sm:py-14 lg:py-20">
    <div className="w-full max-w-7xl mx-auto px-4 space-y-8 sm:px-6 sm:space-y-10 lg:px-8">
      <SectionHeader title={content.fitTitle} />
      <div className="grid gap-5 lg:grid-cols-2">
        <FitCard title={content.goodFitTitle} items={content.goodFit} positive />
        <FitCard title={content.badFitTitle} items={content.badFit} />
      </div>
    </div>
  </section>
);

const FitCard = ({ title, items, positive = false }) => (
  <div className={cn('rounded-2xl border bg-white p-6 shadow-soft', positive ? 'border-success/30' : 'border-border')}>
    <h3 className="text-xl font-headlines font-bold text-foreground">{title}</h3>
    <div className="mt-5 space-y-3">
      {items.map((item) => (
        <div key={item} className="flex gap-3">
          <div className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full', positive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
                <AppIcon name="Check" size={15} />
          </div>
          <p className="text-sm text-foreground">{item}</p>
        </div>
      ))}
    </div>
  </div>
);

const PricingCard = ({ content, price, lang, loading, onCheckout }) => (
  <section className="py-14 lg:py-20">
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-white p-5 shadow-cultural sm:p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              <AppIcon name="Sparkles" size={16} />
              {content.priceLabel}
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-headlines font-bold text-foreground">{content.pricingTitle}</h2>
            <div className="mt-5 flex items-end gap-2">
              <span className="text-5xl font-headlines font-bold text-primary">{price.amount}</span>
              <span className="pb-2 text-lg font-semibold text-muted-foreground">{price.currency}</span>
            </div>
            <Button
              type="button"
              size="xl"
              fullWidth
              loading={loading}
              disabled={loading}
              onClick={() => onCheckout(lang)}
              className="mt-6 w-full sm:w-auto bg-cta hover:bg-cta/90 text-white shadow-warm"
            >
              {loading ? content.loading : content.checkout}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <AppIcon name="ShieldCheck" size={15} />
              {content.secureBadge}
            </p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-5">
            <h3 className="font-headlines text-lg font-bold text-foreground">{content.includesTitle}</h3>
            <div className="mt-4 space-y-3">
              {content.includes.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success">
                    <AppIcon name="Check" size={15} />
                  </div>
                  <p className="text-sm text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FAQ = ({ content }) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-muted/50 py-10 sm:py-14 lg:py-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <SectionHeader title={content.faqTitle} />
          <div className="mt-8 space-y-3">
            {content.faqs.map(([question, answer], index) => {
              const isOpen = openIndex === index;
              return (
                <div key={question} className="rounded-xl border border-border bg-white shadow-sm">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left font-headlines font-semibold text-foreground sm:gap-4 sm:px-5"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    id={`ebook-faq-question-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`ebook-faq-answer-${index}`}
                  >
                    {question}
                    <AppIcon name="ChevronDown" className={cn('h-5 w-5 shrink-0 text-primary transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && (
                    <p
                      id={`ebook-faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`ebook-faq-question-${index}`}
                      className="px-4 pb-5 text-sm text-muted-foreground sm:px-5"
                    >
                      {answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const EbookLandingPage = ({ lang = null }) => {
  const { lang: routeLang } = useParams();
  const activeLang = normalizeLang(lang || routeLang);
  const content = copy[activeLang];
  const price = priceByLanguage[activeLang];
  const hreflangLinks = getHreflangLinks('/ebook');
  const isLoading = false;

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: content.metaTitle,
    description: content.metaDescription,
    image: DEFAULT_OG_IMAGE,
    brand: {
      '@type': 'Brand',
      name: 'Habluj',
    },
    offers: {
      '@type': 'Offer',
      price: price.amount,
      priceCurrency: activeLang === 'cs' ? 'CZK' : 'EUR',
      availability: 'https://schema.org/InStock',
      url: getCanonicalUrl('/ebook', activeLang === 'cs' ? 'cz' : 'sk'),
    },
  }), [activeLang, content, price]);

  const handleCheckout = () => {
    const checkoutWindow = window.open(EBOOK_PAYMENT_URL, '_blank', 'noopener,noreferrer');
    if (!checkoutWindow) {
      window.alert('Permite las ventanas emergentes para continuar con la compra.');
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Helmet>
        <title>{content.metaTitle}</title>
        <meta name="description" content={content.metaDescription} />
        <link rel="canonical" href={getCanonicalUrl('/ebook', activeLang === 'cs' ? 'cz' : 'sk')} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
        <meta property="og:title" content={content.metaTitle} />
        <meta property="og:description" content={content.metaDescription} />
        <meta property="og:url" content={getCanonicalUrl('/ebook', activeLang === 'cs' ? 'cz' : 'sk')} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={content.metaTitle} />
        <meta name="twitter:description" content={content.metaDescription} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <Header />
      <main id="main-content" tabIndex={-1}>
        <section className="relative overflow-hidden bg-gradient-warm pt-20 pb-10 sm:pt-24 sm:pb-14 lg:pt-28 lg:pb-20">
          <div className="relative z-10 mx-auto grid min-w-0 w-full max-w-7xl gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div className="min-w-0 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                <AppIcon name="BookOpen" size={16} />
                {content.heroBadge}
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-headlines font-bold leading-tight text-foreground">
                  {content.title}
                </h1>
                <p className="max-w-2xl text-base sm:text-xl text-muted-foreground">
                  {content.subtitle}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  size="xl"
                  loading={isLoading}
                  disabled={isLoading}
                  onClick={() => handleCheckout(activeLang)}
                  className="w-full bg-cta hover:bg-cta/90 text-white shadow-warm sm:w-auto"
                >
                  {isLoading ? content.loading : content.cta}
                </Button>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AppIcon name="ShieldCheck" size={18} className="text-success" />
                  {content.secureBadge}
                </div>
              </div>
            </div>
            <BookMockup title={content.bookTitle} subtitle={content.bookSubtitle} />
          </div>
        </section>

        <SamplePreview content={content} />
        <ProofBar items={content.proof} />
        <EbookReviews title={content.reviewsTitle} subtitle={content.reviewsSubtitle} reviews={content.reviews} />
        <ChaptersGrid content={content} />
        <AudienceFit content={content} />
        <PricingCard content={content} price={price} lang={activeLang} loading={isLoading} onCheckout={handleCheckout} />
        <FAQ content={content} />
      </main>
      <SiteFooter />
    </div>
  );
};

export default EbookLandingPage;
