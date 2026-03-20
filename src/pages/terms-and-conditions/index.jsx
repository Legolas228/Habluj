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
    title: 'Obchodné podmienky',
    intro: 'Tieto podmienky upravujú používanie webu Habluj a poskytovanie online výučby pre študentov zo Slovenska, Česka a EÚ.',
    sections: [
      {
        heading: '1. Predmet služby',
        body: 'Habluj poskytuje online lekcie španielčiny, konzultácie a súvisiace vzdelávacie služby podľa aktuálnej dostupnosti.'
      },
      {
        heading: '2. Rezervácia a platba',
        body: 'Rezervácie sa realizujú cez dostupný rezervačný systém. Cena, trvanie a podmienky platby sú uvedené pred potvrdením rezervácie.'
      },
      {
        heading: '3. Zmena termínu a storno',
        body: 'Zmenu alebo zrušenie je potrebné nahlásiť v primeranom predstihu. Pri neúčasti bez oznámenia môže byť lekcia považovaná za využitú.'
      },
      {
        heading: '4. Povinnosti používateľa',
        body: 'Používateľ sa zaväzuje poskytovať pravdivé údaje, nezasahovať do fungovania stránky a nepoužívať služby v rozpore so zákonom.'
      },
      {
        heading: '5. Duševné vlastníctvo',
        body: 'Obsah stránky, materiály a metodiky sú chránené právami duševného vlastníctva. Bez súhlasu ich nie je možné neoprávnene šíriť.'
      },
      {
        heading: '6. Zodpovednosť',
        body: 'Habluj zodpovedá za odborné poskytnutie služby, nezodpovedá však za výpadky tretích strán (internet, externé platformy) mimo primeranej kontroly.'
      },
      {
        heading: '7. Rozhodné právo',
        body: 'Podmienky sa riadia právom SR s rešpektovaním kogentných spotrebiteľských právnych predpisov ČR a EÚ, ak sú použiteľné.'
      },
      {
        heading: '8. Kontakt',
        body: `Otázky k podmienkam: ${contactEmail}.`
      }
    ]
  },
  cz: {
    title: 'Obchodní podmínky',
    intro: 'Tyto podmínky upravují používání webu Habluj a poskytování online výuky pro studenty z Česka, Slovenska a EU.',
    sections: [
      {
        heading: '1. Předmět služby',
        body: 'Habluj poskytuje online lekce španělštiny, konzultace a související vzdělávací služby podle aktuální dostupnosti.'
      },
      {
        heading: '2. Rezervace a platba',
        body: 'Rezervace probíhá přes dostupný rezervační systém. Cena, délka a platební podmínky jsou uvedeny před potvrzením.'
      },
      {
        heading: '3. Změna termínu a storno',
        body: 'Změnu nebo zrušení je nutné nahlásit s dostatečným předstihem. Nedostavení se bez oznámení může být považováno za čerpanou lekci.'
      },
      {
        heading: '4. Povinnosti uživatele',
        body: 'Uživatel je povinen uvádět pravdivé údaje, nezasahovat do provozu webu a nepoužívat služby v rozporu s právními předpisy.'
      },
      {
        heading: '5. Duševní vlastnictví',
        body: 'Obsah webu, výukové materiály a metodiky jsou chráněny právy duševního vlastnictví a nelze je bez souhlasu neoprávněně šířit.'
      },
      {
        heading: '6. Odpovědnost',
        body: 'Habluj odpovídá za odborné poskytování služby, nikoli za výpadky třetích stran (internet, externí platformy) mimo přiměřenou kontrolu.'
      },
      {
        heading: '7. Rozhodné právo',
        body: 'Podmínky se řídí právem SR s respektováním kogentních spotřebitelských předpisů ČR a EU, jsou-li použitelné.'
      },
      {
        heading: '8. Kontakt',
        body: `Dotazy k podmínkám: ${contactEmail}.`
      }
    ]
  },
  es: {
    title: 'Términos y Condiciones',
    intro: 'Los presentes términos y condiciones regulan el uso del sitio web Habluj y la contratación de clases online para personas usuarias de Eslovaquia, Chequia y la Unión Europea.',
    sections: [
      {
        heading: '1. Objeto del servicio',
        body: 'Habluj ofrece clases online de español, sesiones de conversación y servicios de acompañamiento académico, sujetos a disponibilidad.'
      },
      {
        heading: '2. Reserva y pago',
        body: 'La reserva se formaliza mediante el sistema habilitado. El precio, la duración y las condiciones de pago se muestran antes de la confirmación.'
      },
      {
        heading: '3. Cambios y cancelaciones',
        body: 'Las reprogramaciones y cancelaciones deberán solicitarse con antelación razonable. La inasistencia sin aviso previo podrá considerarse sesión efectivamente consumida.'
      },
      {
        heading: '4. Uso correcto',
        body: 'La persona usuaria se compromete a facilitar información veraz y a no utilizar el sitio para actividades ilícitas o que perjudiquen su funcionamiento.'
      },
      {
        heading: '5. Propiedad intelectual',
        body: 'Los contenidos, materiales y metodología están protegidos por derechos de propiedad intelectual e industrial y no podrán reproducirse ni reutilizarse sin autorización expresa.'
      },
      {
        heading: '6. Responsabilidad',
        body: 'Habluj responderá por la correcta prestación del servicio en su ámbito de control, sin perjuicio de interrupciones atribuibles a terceros o causas ajenas razonablemente inevitables.'
      },
      {
        heading: '7. Ley aplicable',
        body: 'Será de aplicación la normativa de la Unión Europea y, en lo que proceda, la legislación de Eslovaquia, sin perjuicio de los derechos imperativos de protección de consumidores aplicables en Chequia y demás Estados miembros.'
      },
      {
        heading: '8. Contacto',
        body: `Para cualquier consulta relativa a estos términos puede dirigirse a: ${contactEmail}.`
      }
    ]
  }
};

const TermsAndConditionsPage = () => {
  const { language } = useTranslation();
  const content = contentByLanguage[language] || contentByLanguage.sk;
  const hreflangLinks = getHreflangLinks('/terms-and-conditions');

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{content.title} - Habluj</title>
        <meta name="description" content={content.intro} />
        <link rel="canonical" href={getCanonicalUrl('/terms-and-conditions')} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
        <meta property="og:title" content={`${content.title} - Habluj`} />
        <meta property="og:description" content={content.intro} />
        <meta property="og:url" content={getCanonicalUrl('/terms-and-conditions')} />
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

export default TermsAndConditionsPage;
