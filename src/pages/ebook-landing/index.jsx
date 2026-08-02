import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import {
  BookOpen,
  Check,
  ChevronDown,
  Download,
  FileText,
  Lock,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  TabletSmartphone,
} from 'lucide-react';

import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import SiteFooter from '../../components/ui/SiteFooter';
import { getCanonicalUrl, getHreflangLinks, DEFAULT_OG_IMAGE } from '../../utils/seo';
import { cn } from '../../utils/cn';

const copy = {
  sk: {
    metaTitle: 'eBook Španielčina bez strachu | Habluj',
    metaDescription: 'Digitálny eBook pre Slovákov a Čechov, ktorí chcú začať hovoriť po španielsky istejšie a bez zbytočného stresu.',
    heroBadge: 'Digitálny eBook PDF + EPUB',
    title: 'Prestaňte sa učiť španielčinu naslepo',
    subtitle: 'Praktický eBook, ktorý vám ukáže, ako si postaviť pevné základy, vyhnúť sa typickým chybám Slovákov a Čechov a začať hovoriť sebavedomejšie.',
    cta: 'Kúpiť za 15 €',
    secureBadge: 'Bezpečná platba a okamžitý prístup',
    proof: [
      'Čítanie na mobile, tablete aj počítači',
      'Okamžitý prístup po zaplatení',
      'Formáty PDF a EPUB v cene',
    ],
    chaptersTitle: 'Čo sa v eBooku naučíte',
    chaptersSubtitle: 'Konkrétne bloky zamerané na problémy, ktoré pri španielčine najčastejšie brzdia slovenských a českých študentov.',
    chapters: [
      ['Ako sa učiť španielčinu bez chaosu', 'Jednoduchý systém, ktorý vám pomôže vedieť, čo robiť ako prvé a čomu venovať čas.'],
      ['Najčastejšie chyby Slovákov a Čechov', 'Výslovnosť, gramatické pasce a zvyky, ktoré si z materinského jazyka prenášame do španielčiny.'],
      ['Rozprávanie bez paniky', 'Ako trénovať hovorenie tak, aby ste sa nezasekli pri prvej vete.'],
      ['Gramatika ako nástroj, nie strašiak', 'Ako pochopiť systém jazyka bez memorovania izolovaných poučiek.'],
      ['Kultúra a prirodzené frázy', 'Výrazy a kontext, vďaka ktorým španielčina začne znieť živšie a prirodzenejšie.'],
      ['Plán na prvých 30 dní', 'Konkrétny postup, ktorý vám pomôže začať a udržať tempo.'],
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
      'eBook vo formáte EPUB',
      'Prístup na čítanie v akomkoľvek zariadení',
      'Budúce menšie aktualizácie zdarma',
    ],
    faqTitle: 'Časté otázky',
    faqs: [
      ['Ako dostanem eBook?', 'Po zaplatení dostanete prístup k digitálnym súborom. Platobný flow je pripravený v komponente cez handleCheckout(lang).'],
      ['V akom formáte príde?', 'Súčasťou nákupu je PDF aj EPUB, takže si ho môžete prečítať v prehliadači, mobile, tablete alebo čítačke.'],
      ['Môžem ho čítať na Kindle?', 'Áno, EPUB môžete poslať do Kindle knižnice cez službu Send to Kindle. PDF funguje lepšie na väčších obrazovkách.'],
      ['Je eBook vhodný pre úplných začiatočníkov?', 'Áno. Je písaný tak, aby pomohol najmä ľuďom, ktorí chcú začať španielčinu od základov rozumne a bez chaosu.'],
    ],
  },
  cs: {
    metaTitle: 'eBook Španělština bez strachu | Habluj',
    metaDescription: 'Digitální eBook pro Slováky a Čechy, kteří chtějí začít mluvit španělsky jistěji a bez zbytečného stresu.',
    heroBadge: 'Digitální eBook PDF + EPUB',
    title: 'Přestaňte se učit španělštinu naslepo',
    subtitle: 'Praktický eBook, který vám ukáže, jak si postavit pevné základy, vyhnout se typickým chybám Čechů a Slováků a začít mluvit sebejistěji.',
    cta: 'Koupit za 380 CZK',
    secureBadge: 'Bezpečná platba a okamžitý přístup',
    proof: [
      'Čtení na mobilu, tabletu i počítači',
      'Okamžitý přístup po zaplacení',
      'Formáty PDF a EPUB v ceně',
    ],
    chaptersTitle: 'Co se v eBooku naučíte',
    chaptersSubtitle: 'Konkrétní bloky zaměřené na problémy, které ve španělštině nejčastěji brzdí české a slovenské studenty.',
    chapters: [
      ['Jak se učit španělštinu bez chaosu', 'Jednoduchý systém, díky kterému víte, co dělat jako první a čemu věnovat čas.'],
      ['Nejčastější chyby Čechů a Slováků', 'Výslovnost, gramatické pasti a zvyky, které si z mateřštiny přenášíme do španělštiny.'],
      ['Mluvení bez paniky', 'Jak trénovat mluvení tak, abyste se nezasekli u první věty.'],
      ['Gramatika jako nástroj, ne strašák', 'Jak pochopit systém jazyka bez memorování izolovaných pouček.'],
      ['Kultura a přirozené fráze', 'Výrazy a kontext, díky kterým začne španělština znít živěji a přirozeněji.'],
      ['Plán na prvních 30 dní', 'Konkrétní postup, který vám pomůže začít a udržet tempo.'],
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
      'eBook ve formátu EPUB',
      'Přístup ke čtení na jakémkoli zařízení',
      'Budoucí menší aktualizace zdarma',
    ],
    faqTitle: 'Časté otázky',
    faqs: [
      ['Jak dostanu eBook?', 'Po zaplacení dostanete přístup k digitálním souborům. Platební flow je připravené v komponentě přes handleCheckout(lang).'],
      ['V jakém formátu přijde?', 'Součástí nákupu je PDF i EPUB, takže si ho můžete přečíst v prohlížeči, mobilu, tabletu nebo čtečce.'],
      ['Můžu ho číst na Kindle?', 'Ano, EPUB můžete poslat do Kindle knihovny přes službu Send to Kindle. PDF funguje lépe na větších obrazovkách.'],
      ['Je eBook vhodný pro úplné začátečníky?', 'Ano. Je napsaný tak, aby pomohl hlavně lidem, kteří chtějí začít španělštinu od základů rozumně a bez chaosu.'],
    ],
  },
};

const priceByLanguage = {
  sk: { amount: '15', currency: '€', label: '15 €' },
  cs: { amount: '380', currency: 'CZK', label: '380 CZK' },
};

const normalizeLang = (lang) => (lang === 'cs' || lang === 'cz' ? 'cs' : 'sk');

const SectionHeader = ({ title, subtitle }) => (
  <div className="mx-auto max-w-3xl text-center space-y-3">
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headlines font-bold text-foreground">{title}</h2>
    {subtitle && <p className="text-base sm:text-lg text-muted-foreground">{subtitle}</p>}
  </div>
);

const BookMockup = ({ text }) => (
  <div className="relative mx-auto w-full max-w-sm">
    <div className="absolute -inset-4 rounded-2xl bg-gradient-cultural opacity-10 blur-2xl" />
    <div className="relative aspect-[4/5] rounded-2xl bg-white shadow-cultural border border-border p-5">
      <div className="h-full rounded-xl bg-gradient-to-br from-primary via-secondary to-brand-spanish p-6 text-white flex flex-col justify-between overflow-hidden">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <BookOpen size={14} />
            Habluj eBook
          </div>
          <div>
            <p className="font-accent text-lg text-white/80">Španielčina</p>
            <h3 className="text-3xl font-headlines font-bold leading-tight">bez strachu</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/15 p-3">
              <FileText size={18} />
              <p className="mt-2 text-xs font-semibold">PDF</p>
            </div>
            <div className="rounded-lg bg-white/15 p-3">
              <TabletSmartphone size={18} />
              <p className="mt-2 text-xs font-semibold">EPUB</p>
            </div>
          </div>
          <p className="text-sm text-white/85">{text}</p>
        </div>
      </div>
    </div>
  </div>
);

const ProofBar = ({ items }) => {
  const icons = [MonitorSmartphone, Download, FileText];

  return (
    <section className="border-y border-border bg-white">
      <div className="container mx-auto px-4 lg:px-6 py-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {items.map((item, index) => {
            const Icon = icons[index] || Check;
            return (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={18} />
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

const ChaptersGrid = ({ content }) => (
  <section className="py-14 lg:py-20">
    <div className="container mx-auto px-4 lg:px-6 space-y-10">
      <SectionHeader title={content.chaptersTitle} subtitle={content.chaptersSubtitle} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {content.chapters.map(([title, description], index) => (
          <article key={title} className="rounded-2xl border border-border bg-white p-6 shadow-soft hover:shadow-cultural transition-shadow duration-300">
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

const AudienceFit = ({ content }) => (
  <section className="bg-muted/50 py-14 lg:py-20">
    <div className="container mx-auto px-4 lg:px-6 space-y-10">
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
            <Check size={15} />
          </div>
          <p className="text-sm text-foreground">{item}</p>
        </div>
      ))}
    </div>
  </div>
);

const PricingCard = ({ content, price, lang, loading, onCheckout }) => (
  <section className="py-14 lg:py-20">
    <div className="container mx-auto px-4 lg:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-white p-6 shadow-cultural md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              <Sparkles size={16} />
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
              className="mt-6 bg-cta hover:bg-cta/90 text-white shadow-warm"
            >
              {loading ? content.loading : content.checkout}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock size={15} />
              {content.secureBadge}
            </p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-5">
            <h3 className="font-headlines text-lg font-bold text-foreground">{content.includesTitle}</h3>
            <div className="mt-4 space-y-3">
              {content.includes.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success">
                    <Check size={15} />
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
    <section className="bg-muted/50 py-14 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <SectionHeader title={content.faqTitle} />
          <div className="mt-8 space-y-3">
            {content.faqs.map(([question, answer], index) => {
              const isOpen = openIndex === index;
              return (
                <div key={question} className="rounded-xl border border-border bg-white shadow-sm">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-headlines font-semibold text-foreground"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    {question}
                    <ChevronDown className={cn('h-5 w-5 shrink-0 text-primary transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && <p className="px-5 pb-5 text-sm text-muted-foreground">{answer}</p>}
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
  const [checkoutLang, setCheckoutLang] = useState(null);
  const isLoading = checkoutLang === activeLang;

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

  const handleCheckout = (selectedLang) => {
    setCheckoutLang(selectedLang);
    window.setTimeout(() => {
      setCheckoutLang(null);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background">
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
      <main>
        <section className="relative overflow-hidden bg-gradient-warm pt-24 pb-14 lg:pt-28 lg:pb-20">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute left-10 top-20 h-32 w-32 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-16 right-12 h-40 w-40 rounded-full bg-secondary blur-3xl" />
          </div>
          <div className="container relative z-10 mx-auto grid gap-10 px-4 lg:grid-cols-2 lg:items-center lg:px-6">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                <BookOpen size={16} />
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
                  className="bg-cta hover:bg-cta/90 text-white shadow-warm"
                >
                  {isLoading ? content.loading : content.cta}
                </Button>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ShieldCheck size={18} className="text-success" />
                  {content.secureBadge}
                </div>
              </div>
            </div>
            <BookMockup text={content.heroBadge} />
          </div>
        </section>

        <ProofBar items={content.proof} />
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
