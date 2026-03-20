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
    title: 'Zásady ochrany osobných údajov',
    intro: 'Tieto zásady vysvetľujú, ako Habluj spracúva osobné údaje v súlade s GDPR a príslušnými právnymi predpismi SR/ČR.',
    sections: [
      {
        heading: '1. Prevádzkovateľ',
        body: `Prevádzkovateľom je Habluj (vzdelávací projekt Ester Mesároš). Kontakt: ${contactEmail}.`
      },
      {
        heading: '2. Aké údaje spracúvame',
        body: 'Identifikačné a kontaktné údaje (meno, e-mail, Instagram), jazykové preferencie, údaje o rezerváciách a komunikácii.'
      },
      {
        heading: '3. Účel a právny základ',
        body: 'Údaje spracúvame na odpoveď na dopyty, správu rezervácií, poskytovanie výučby a plnenie zákonných povinností. Právnym základom je zmluvný vzťah, súhlas a oprávnený záujem.'
      },
      {
        heading: '4. Príjemcovia údajov',
        body: 'Údaje neposkytujeme na predaj. Môžu ich spracúvať len nevyhnutní partneri (napr. rezervačný systém, hosting, e-mailové služby) na základe zmluvných záruk ochrany údajov.'
      },
      {
        heading: '5. Doba uchovávania',
        body: 'Údaje uchovávame len po dobu potrebnú na daný účel a následne po zákonom stanovenú dobu pre prípad právnych nárokov.'
      },
      {
        heading: '6. Vaše práva',
        body: `Máte právo na prístup, opravu, výmaz, obmedzenie spracúvania, prenosnosť a námietku. Uplatnenie práv: ${contactEmail}. V SR môžete podať podnet na Úrad na ochranu osobných údajov SR, v ČR na ÚOOÚ.`
      },
      {
        heading: '7. Bezpečnosť a maloletí',
        body: 'Uplatňujeme primerané technické a organizačné opatrenia. Údaje maloletých spracúvame len s vedomím a oprávnením zákonného zástupcu.'
      },
      {
        heading: '8. Zmeny zásad',
        body: 'Tieto zásady môžeme priebežne aktualizovať. Vždy platí verzia zverejnená na tejto stránke.'
      }
    ]
  },
  cz: {
    title: 'Zásady ochrany osobních údajů',
    intro: 'Tyto zásady popisují, jak Habluj zpracovává osobní údaje v souladu s GDPR a příslušnými právními předpisy ČR/SR.',
    sections: [
      {
        heading: '1. Správce údajů',
        body: `Správcem je Habluj (vzdělávací projekt Ester Mesároš). Kontakt: ${contactEmail}.`
      },
      {
        heading: '2. Jaké údaje zpracováváme',
        body: 'Identifikační a kontaktní údaje (jméno, e-mail, Instagram), jazykové preference, údaje o rezervacích a komunikaci.'
      },
      {
        heading: '3. Účel a právní základ',
        body: 'Údaje zpracováváme pro odpovědi na poptávky, správu rezervací, poskytování výuky a plnění zákonných povinností. Právním základem je smluvní vztah, souhlas a oprávněný zájem.'
      },
      {
        heading: '4. Příjemci údajů',
        body: 'Údaje neprodáváme. Přístup k nim mají pouze nezbytní partneři (např. rezervační systém, hosting, e-mailové služby) na základě smluvních garancí ochrany údajů.'
      },
      {
        heading: '5. Doba uchování',
        body: 'Údaje uchováváme pouze po dobu nezbytnou pro daný účel a následně po zákonné lhůty pro ochranu právních nároků.'
      },
      {
        heading: '6. Vaše práva',
        body: `Máte právo na přístup, opravu, výmaz, omezení zpracování, přenositelnost a námitku. Uplatnění práv: ${contactEmail}. V ČR můžete podat stížnost u ÚOOÚ, na Slovensku u Úradu na ochranu osobných údajov SR.`
      },
      {
        heading: '7. Bezpečnost a nezletilí',
        body: 'Používáme přiměřená technická a organizační opatření. Údaje nezletilých zpracováváme pouze s vědomím a oprávněním zákonného zástupce.'
      },
      {
        heading: '8. Změny zásad',
        body: 'Tyto zásady můžeme průběžně aktualizovat. Vždy platí verze zveřejněná na této stránce.'
      }
    ]
  },
  es: {
    title: 'Política de Privacidad',
    intro: 'La presente política describe el tratamiento de datos personales efectuado por Habluj, de conformidad con el RGPD y con la normativa aplicable en Eslovaquia, Chequia y la Unión Europea.',
    sections: [
      {
        heading: '1. Responsable del tratamiento',
        body: `El responsable del tratamiento es Habluj (proyecto educativo de Ester Mesároš). Para cualquier consulta en materia de protección de datos puede contactar en: ${contactEmail}.`
      },
      {
        heading: '2. Categorías de datos tratados',
        body: 'Se tratan datos identificativos y de contacto (nombre, correo electrónico, Instagram), preferencias lingüísticas, datos de reserva y comunicaciones mantenidas con la persona usuaria.'
      },
      {
        heading: '3. Finalidades y base jurídica',
        body: 'Los datos se tratan para atender solicitudes, gestionar reservas, prestar el servicio formativo y cumplir obligaciones legales. La base jurídica es la ejecución de la relación precontractual/contractual, el consentimiento y, cuando proceda, el interés legítimo.'
      },
      {
        heading: '4. Destinatarios y encargados',
        body: 'No se venden ni ceden datos con fines comerciales. Únicamente acceden proveedores necesarios para la prestación del servicio (alojamiento, agenda y correo), bajo contratos de encargo y obligaciones de confidencialidad.'
      },
      {
        heading: '5. Plazos de conservación',
        body: 'Los datos se conservan durante el tiempo estrictamente necesario para cada finalidad y, posteriormente, durante los plazos legalmente exigibles para la formulación, ejercicio o defensa de reclamaciones.'
      },
      {
        heading: '6. Derechos de las personas interesadas',
        body: `Puede ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad mediante solicitud a ${contactEmail}. Asimismo, puede presentar reclamación ante la autoridad de control competente en Eslovaquia o Chequia, según corresponda.`
      },
      {
        heading: '7. Seguridad y personas menores de edad',
        body: 'Se aplican medidas técnicas y organizativas adecuadas para proteger la información. El tratamiento de datos de menores se realiza únicamente con la intervención y autorización de su representante legal.'
      },
      {
        heading: '8. Modificaciones de la política',
        body: 'Esta política podrá actualizarse por cambios normativos o funcionales. La versión vigente será siempre la publicada en esta página.'
      }
    ]
  }
};

const PrivacyPolicyPage = () => {
  const { language } = useTranslation();
  const content = contentByLanguage[language] || contentByLanguage.sk;
  const hreflangLinks = getHreflangLinks('/privacy-policy');

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{content.title} - Habluj</title>
        <meta name="description" content={content.intro} />
        <link rel="canonical" href={getCanonicalUrl('/privacy-policy')} />
        {hreflangLinks.map((link) => (
          <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
        <meta property="og:title" content={`${content.title} - Habluj`} />
        <meta property="og:description" content={content.intro} />
        <meta property="og:url" content={getCanonicalUrl('/privacy-policy')} />
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

export default PrivacyPolicyPage;
