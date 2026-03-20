import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';
import LeadMagnetForm from '../../../components/LeadMagnetForm';
import { useTranslation } from '../../../hooks/useTranslation';
import { submitLeadCapture } from '../../../services/leads';

const mapPreferredLanguage = (language) => {
  if (language === 'cz') return 'cz';
  if (language === 'es') return 'es';
  return 'sk';
};

const ContactForm = () => {
  const { language } = useTranslation();
  const copy = {
    sk: {
      title: 'Napíšte nám',
      subtitle: 'Vyplňte formulár a my sa vám ozveme čo najskôr. Všetky polia označené hviezdičkou sú povinné.',
      successTitle: 'Správa bola odoslaná!',
      successText: 'Ďakujeme za vašu správu. Ozveme sa vám čo najskôr.',
      errorTitle: 'Chyba pri odosielaní',
      errorText: 'Niečo sa pokazilo. Skúste to prosím znovu alebo nás kontaktujte priamo.',
      nameLabel: 'Meno a priezvisko',
      namePlaceholder: 'Vaše celé meno',
      emailLabel: 'Email',
      emailPlaceholder: 'vas@email.sk',
      inquiryLabel: 'Typ otázky',
      inquiryPlaceholder: 'Vyberte typ otázky',
      subjectLabel: 'Predmet',
      subjectPlaceholder: 'Stručne opíšte vašu otázku',
      messageLabel: 'Správa',
      messagePlaceholder: 'Opíšte detailne vašu otázku alebo požiadavku...',
      messageHint: 'Minimálne 20 znakov, maximálne 1000 znakov',
      privacyTitle: 'Ochrana osobných údajov',
      privacyText: 'Vaše údaje používame výlučne na komunikáciu s vami a nikdy ich nezdieľame s tretími stranami. Odoslaním formulára súhlasíte so spracovaním osobných údajov v súlade s GDPR.',
      privacyConsentLabel: 'Súhlasím so spracovaním osobných údajov na účel vybavenia mojej správy.',
      submit: 'Odoslať správu',
      submitting: 'Odosielam...',
      clear: 'Vymazať formulár',
      errors: {
        name: 'Meno musí mať aspoň 2 znaky',
        email: 'Zadajte platnú emailovú adresu',
        inquiry: 'Vyberte typ otázky',
        subject: 'Predmet musí mať aspoň 5 znakov',
        messageMin: 'Správa musí mať aspoň 20 znakov',
        messageMax: 'Správa je príliš dlhá',
        privacy: 'Pred odoslaním musíte potvrdiť súhlas so spracovaním osobných údajov',
      },
      inquiryTypes: ['Všeobecné otázky', 'Rezervácia hodín', 'Technická podpora', 'Individuálny program', 'Cenník a platby', 'Metodika výučby'],
    },
    cz: {
      title: 'Napište nám',
      subtitle: 'Vyplňte formulář a my se vám ozveme co nejdříve. Pole označená hvězdičkou jsou povinná.',
      successTitle: 'Zpráva byla odeslána!',
      successText: 'Děkujeme za vaši zprávu. Brzy se vám ozveme.',
      errorTitle: 'Chyba při odeslání',
      errorText: 'Něco se pokazilo. Zkuste to prosím znovu nebo nás kontaktujte přímo.',
      nameLabel: 'Jméno a příjmení',
      namePlaceholder: 'Vaše celé jméno',
      emailLabel: 'Email',
      emailPlaceholder: 'vas@email.cz',
      inquiryLabel: 'Typ dotazu',
      inquiryPlaceholder: 'Vyberte typ dotazu',
      subjectLabel: 'Předmět',
      subjectPlaceholder: 'Stručně popište váš dotaz',
      messageLabel: 'Zpráva',
      messagePlaceholder: 'Popište podrobně svůj dotaz nebo požadavek...',
      messageHint: 'Minimálně 20 znaků, maximálně 1000 znaků',
      privacyTitle: 'Ochrana osobních údajů',
      privacyText: 'Vaše údaje používáme výhradně pro komunikaci s vámi a nikdy je nesdílíme s třetími stranami. Odesláním formuláře souhlasíte se zpracováním osobních údajů v souladu s GDPR.',
      privacyConsentLabel: 'Souhlasím se zpracováním osobních údajů za účelem vyřízení mé zprávy.',
      submit: 'Odeslat zprávu',
      submitting: 'Odesílám...',
      clear: 'Vymazat formulář',
      errors: {
        name: 'Jméno musí mít alespoň 2 znaky',
        email: 'Zadejte platnou emailovou adresu',
        inquiry: 'Vyberte typ dotazu',
        subject: 'Předmět musí mít alespoň 5 znaků',
        messageMin: 'Zpráva musí mít alespoň 20 znaků',
        messageMax: 'Zpráva je příliš dlouhá',
        privacy: 'Před odesláním musíte potvrdit souhlas se zpracováním osobních údajů',
      },
      inquiryTypes: ['Obecné otázky', 'Rezervace hodin', 'Technická podpora', 'Individuální program', 'Ceník a platby', 'Metodika výuky'],
    },
    es: {
      title: 'Escríbanos',
      subtitle: 'Complete el formulario y le responderemos a la mayor brevedad. Los campos marcados con asterisco son obligatorios.',
      successTitle: '¡Mensaje enviado!',
      successText: 'Gracias por su mensaje. Le responderemos en breve.',
      errorTitle: 'Error al enviar',
      errorText: 'Se ha producido un error. Inténtelo de nuevo o contacte con nosotros directamente.',
      nameLabel: 'Nombre y apellidos',
      namePlaceholder: 'Nombre completo',
      emailLabel: 'Email',
      emailPlaceholder: 'correo@ejemplo.com',
      inquiryLabel: 'Tipo de consulta',
      inquiryPlaceholder: 'Selecciona el tipo de consulta',
      subjectLabel: 'Asunto',
      subjectPlaceholder: 'Describa brevemente su consulta',
      messageLabel: 'Mensaje',
      messagePlaceholder: 'Describa con detalle su consulta o necesidad...',
      messageHint: 'Mínimo 20 caracteres, máximo 1000 caracteres',
      privacyTitle: 'Protección de datos',
      privacyText: 'Sus datos se utilizan exclusivamente para gestionar su consulta y no se ceden a terceros sin base jurídica. Al enviar el formulario, acepta el tratamiento de datos conforme al RGPD.',
      privacyConsentLabel: 'Acepto el tratamiento de mis datos personales para gestionar esta consulta.',
      submit: 'Enviar consulta',
      submitting: 'Enviando...',
      clear: 'Borrar formulario',
      errors: {
        name: 'El nombre debe contener al menos 2 caracteres',
        email: 'Introduzca un correo electrónico válido',
        inquiry: 'Selecciona un tipo de consulta',
        subject: 'El asunto debe contener al menos 5 caracteres',
        messageMin: 'El mensaje debe contener al menos 20 caracteres',
        messageMax: 'El mensaje es demasiado largo',
        privacy: 'Antes de enviar, debe aceptar el tratamiento de datos personales',
      },
      inquiryTypes: ['Consultas generales', 'Reserva de clases', 'Soporte técnico', 'Programa personalizado', 'Precios y pagos', 'Metodología'],
    },
  }[language === 'cz' ? 'cz' : language === 'es' ? 'es' : 'sk'];

  const contactSchema = z.object({
    name: z.string().min(2, { message: copy.errors.name }),
    email: z.string().email({ message: copy.errors.email }),
    inquiryType: z.string().min(1, { message: copy.errors.inquiry }),
    subject: z.string().min(5, { message: copy.errors.subject }),
    message: z.string().min(20, { message: copy.errors.messageMin }).max(1000, { message: copy.errors.messageMax }),
    consentPrivacy: z.boolean().refine((value) => value, { message: copy.errors.privacy }),
  });

  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '', email: '', inquiryType: '', subject: '', message: '', consentPrivacy: false
    }
  });

  const inquiryTypes = [
    { value: 'general', label: copy.inquiryTypes[0] },
    { value: 'booking', label: copy.inquiryTypes[1] },
    { value: 'technical', label: copy.inquiryTypes[2] },
    { value: 'custom', label: copy.inquiryTypes[3] },
    { value: 'pricing', label: copy.inquiryTypes[4] },
    { value: 'methodology', label: copy.inquiryTypes[5] }
  ];

  const onSubmit = async (data) => {
    setSubmitStatus(null);
    setSubmitErrorMessage('');
    try {
      const preferredLanguage = mapPreferredLanguage(language);
      const contactSummary = [
        `inquiry:${data.inquiryType}`,
        data.subject ? `subject:${data.subject}` : null,
      ].filter(Boolean).join(' | ');

      await submitLeadCapture({
        full_name: data.name,
        email: data.email,
        preferred_language: preferredLanguage,
        source: 'contact_form',
        notes: `${contactSummary}\n\n${data.message}`.trim(),
        consent_privacy: data.consentPrivacy,
        consent_marketing: false,
        consent_version: 'v1',
      });

      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
      setSubmitErrorMessage(error?.message || copy.errorText);
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-headlines font-bold text-foreground mb-6">
            {copy.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {copy.subtitle}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-8">

          {submitStatus === 'success' && (
            <div className="mb-8 p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center">
                <Icon name="CheckCircle" size={20} className="text-success mr-3" />
                <div>
                  <h4 className="font-medium text-success">{copy.successTitle}</h4>
                  <p className="text-sm text-success/80 mt-1">
                    {copy.successText}
                  </p>
                </div>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-8 p-4 bg-error/10 border border-error/20 rounded-lg">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={20} className="text-error mr-3" />
                <div>
                  <h4 className="font-medium text-error">{copy.errorTitle}</h4>
                  <p className="text-sm text-error/80 mt-1">
                    {submitErrorMessage || copy.errorText}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <Input
                  label={copy.nameLabel}
                  type="text"
                  placeholder={copy.namePlaceholder}
                  error={errors.name?.message}
                  autoComplete="name"
                  {...register('name')}
                />
              </div>

              <div className="w-full">
                <Input
                  label={copy.emailLabel}
                  type="email"
                  placeholder={copy.emailPlaceholder}
                  error={errors.email?.message}
                  autoComplete="email"
                  inputMode="email"
                  {...register('email')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <Select
                  label={copy.inquiryLabel}
                  options={inquiryTypes}
                  value={watch('inquiryType')}
                  onChange={(val) => setValue('inquiryType', val, { shouldValidate: true })}
                  placeholder={copy.inquiryPlaceholder}
                  error={errors.inquiryType?.message}
                />
              </div>
            </div>

            <div className="w-full">
                <Input
                  label={copy.subjectLabel}
                  type="text"
                  placeholder={copy.subjectPlaceholder}
                  error={errors.subject?.message}
                  autoComplete="off"
                  {...register('subject')}
                />
            </div>

            <div>
              <Textarea
                label={copy.messageLabel}
                required
                rows={6}
                placeholder={copy.messagePlaceholder}
                description={copy.messageHint}
                error={errors.message?.message}
                autoComplete="off"
                {...register('message')}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start">
                <Icon name="Shield" size={20} className="text-primary mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground text-sm mb-1">
                    {copy.privacyTitle}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {copy.privacyText}
                  </p>
                </div>
              </div>

              <label htmlFor="contact-consent-privacy" className="mt-4 flex items-start gap-2 text-sm text-foreground">
                <Input
                  id="contact-consent-privacy"
                  type="checkbox"
                  className="mt-0.5 border-primary/50 text-primary focus:ring-primary"
                  aria-invalid={Boolean(errors.consentPrivacy)}
                  {...register('consentPrivacy')}
                />
                <span>{copy.privacyConsentLabel}</span>
              </label>
              {errors.consentPrivacy?.message && (
                <p className="mt-2 text-sm text-destructive" role="alert">
                  {errors.consentPrivacy.message}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                variant="default"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 flex-1"
              >
                {isSubmitting ? copy.submitting : copy.submit}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                {copy.clear}
              </Button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-border">
            <LeadMagnetForm source="contact_page" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
