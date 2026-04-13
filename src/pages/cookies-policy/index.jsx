import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import { useTranslation } from '../../hooks/useTranslation';
import { DEFAULT_OG_IMAGE, getCanonicalUrl, getHreflangLinks } from '../../utils/seo';

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'habluj.sk@gmail.com';
const updatedAt = '14/03/2026';

const contentByLanguage = {
  sk: {
    title: 'Zásady používania cookies',
    intro: 'Táto stránka používa cookies v súlade s GDPR a ePrivacy pravidlami platnými pre používateľov zo Slovenska, Česka a EÚ.',
    sections: [
      {
        heading: '1. Čo sú cookies',
        body: 'Cookies sú malé textové súbory ukladané vo vašom zariadení na zabezpečenie funkčnosti stránky a zapamätanie preferencií.'
      },
      {
        heading: '2. Typy cookies',
        body: 'Používame nevyhnutné cookies (fungovanie stránky), preferenčné cookies (nastavenia) a prípadne analytické cookies, ak sú povolené.'
      },
      {
        heading: '3. Právny základ',
        body: 'Nevyhnutné cookies spracúvame na základe oprávneného záujmu na prevádzke stránky. Ostatné cookies sú použité len na základe vášho súhlasu.'
      },
      {
        heading: '4. Správa súhlasu',
        body: 'Súhlas s voliteľnými cookies môžete udeliť, odmietnuť alebo neskôr zmeniť v nastaveniach prehliadača alebo cookie nástroja.'
      },
      {
        heading: '5. Cookies tretích strán',
        body: 'Ak používame služby tretích strán (napr. analytika), tieto služby môžu ukladať vlastné cookies podľa ich vlastných podmienok.'
      },
      {
        heading: '6. Kontakt',
        body: `Otázky k cookies: ${contactEmail}.`
      }
    ]
  },
  cz: {
    title: 'Zásady používání cookies',
    intro: 'Tento web používá cookies v souladu s GDPR a ePrivacy pravidly pro uživatele z Česka, Slovenska a EU.',
    sections: [
      {
        heading: '1. Co jsou cookies',
        body: 'Cookies jsou malé textové soubory ukládané do vašeho zařízení pro zajištění funkčnosti webu a zapamatování preferencí.'
      },
      {
        heading: '2. Typy cookies',
        body: 'Používáme nezbytné cookies (funkčnost webu), preferenční cookies (nastavení) a případně analytické cookies, pokud jsou povoleny.'
      },
      {
        heading: '3. Právní základ',
        body: 'Nezbytné cookies používáme na základě oprávněného zájmu na provozu webu. Ostatní cookies se používají pouze na základě vašeho souhlasu.'
      },
      {
        heading: '4. Správa souhlasu',
        body: 'Souhlas s volitelnými cookies můžete udělit, odmítnout nebo později změnit v nastavení prohlížeče či cookie nástroje.'
      },
      {
        heading: '5. Cookies třetích stran',
        body: 'Pokud používáme služby třetích stran (např. analytiku), mohou tyto služby ukládat vlastní cookies podle svých podmínek.'
      },
      {
        heading: '6. Kontakt',
        body: `Dotazy ke cookies: ${contactEmail}.`
      }
    ]
  },
  es: {
    title: 'Política de Cookies',
    intro: 'Esta política regula el uso de cookies en Habluj conforme al RGPD y a la normativa ePrivacy aplicable en Eslovaquia, Chequia y la Unión Europea.',
    sections: [
      {
        heading: '1. Qué son las cookies',
        body: 'Las cookies son pequeños archivos de texto que se almacenan en su dispositivo para habilitar funciones técnicas y recordar preferencias de uso.'
      },
      {
        heading: '2. Tipologías de cookies',
        body: 'Podemos utilizar cookies necesarias (funcionamiento), de preferencias (configuración) y, cuando exista base jurídica suficiente, cookies analíticas.'
      },
      {
        heading: '3. Base jurídica',
        body: 'Las cookies necesarias se basan en el interés legítimo de funcionamiento del sitio. Las cookies no necesarias se activan exclusivamente tras la obtención de su consentimiento.'
      },
      {
        heading: '4. Gestión del consentimiento',
        body: 'Puede aceptar, rechazar o retirar en cualquier momento el consentimiento de cookies no necesarias desde la configuración del navegador o, en su caso, desde la herramienta de gestión de cookies.'
      },
      {
        heading: '5. Cookies de terceros',
        body: 'Algunos servicios externos (por ejemplo, herramientas analíticas) pueden instalar cookies propias y se rigen por sus respectivas políticas de privacidad y cookies.'
      },
      {
        heading: '6. Contacto',
        body: `Para cualquier consulta sobre cookies puede contactar en: ${contactEmail}.`
      }
    ]
  }
};

const CookiesPolicyPage = () => {
  const { language } = useTranslation();
  const content = contentByLanguage[language] || contentByLanguage.sk;
  const hreflangLinks = getHreflangLinks('/cookies-policy');

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{content.title} - Habluj</title>
        <meta name="description" content={content.intro} />
        <link rel="canonical" href={getCanonicalUrl('/cookies-policy', language)} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
        <meta property="og:title" content={`${content.title} - Habluj`} />
        <meta property="og:description" content={content.intro} />
        <meta property="og:url" content={getCanonicalUrl('/cookies-policy', language)} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-16 space-y-8">
        <h1 className="text-3xl lg:text-4xl font-headlines font-bold text-foreground">{content.title}</h1>
        <p className="text-muted-foreground leading-relaxed">{content.intro}</p>
        <p className="text-sm text-muted-foreground">Última actualización / Posledná aktualizácia / Poslední aktualizace: {updatedAt}</p>
        {content.sections.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
            <p className="text-muted-foreground leading-relaxed">{section.body}</p>
          </section>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
};

export default CookiesPolicyPage;
