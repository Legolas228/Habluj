import json
import os
from urllib import error, request
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from django.conf import settings
from django.core.mail import send_mail


class MailerLiteSyncError(Exception):
    pass


def _smtp_notifications_available():
    backend = getattr(settings, 'EMAIL_BACKEND', '')
    host = getattr(settings, 'EMAIL_HOST', '')
    # Require a non-console backend and host configuration to send real emails.
    return bool(host) and backend != 'django.core.mail.backends.console.EmailBackend'


def _send_django_email_notification(*, lead, recipient, sender_email, lead_url):
    subject = f'Nuevo lead recibido: {lead.full_name}'
    text_content = (
        'Nuevo lead en Habluj\n\n'
        f'Nombre: {lead.full_name}\n'
        f'Email: {lead.email}\n'
        f'Teléfono: {lead.phone or "-"}\n'
        f'Idioma: {lead.preferred_language}\n'
        f'Origen: {lead.source}\n'
        f'Consentimiento marketing: {"Si" if lead.consent_marketing else "No"}\n\n'
        f'Notas:\n{lead.notes or "-"}\n\n'
        f'Abrir lead en admin: {lead_url}\n'
    )
    html_content = (
        f'<h3>Nuevo lead en Habluj</h3>'
        f'<p><strong>Nombre:</strong> {lead.full_name}</p>'
        f'<p><strong>Email:</strong> {lead.email}</p>'
        f'<p><strong>Teléfono:</strong> {lead.phone or "-"}</p>'
        f'<p><strong>Idioma:</strong> {lead.preferred_language}</p>'
        f'<p><strong>Origen:</strong> {lead.source}</p>'
        f'<p><strong>Consentimiento marketing:</strong> {"Si" if lead.consent_marketing else "No"}</p>'
        f'<p><strong>Notas:</strong><br>{(lead.notes or "-").replace(chr(10), "<br>")}</p>'
        f'<p><a href="{lead_url}">Abrir lead en admin</a></p>'
    )

    try:
        send_mail(
            subject=subject,
            message=text_content,
            from_email=sender_email,
            recipient_list=[recipient],
            fail_silently=False,
            html_message=html_content,
        )
        return {'status': 'sent', 'channel': 'smtp'}
    except Exception as exc:  # pragma: no cover - depends on runtime mail backend
        raise MailerLiteSyncError(f'SMTP notification failed: {exc}') from exc


def _require_api_key():
    api_key = os.environ.get('MAILERLITE_API_KEY')
    if not api_key:
        return None
    return api_key


def _send_mailerlite_request(path, payload):
    api_key = _require_api_key()
    if not api_key:
        return {'status': 'skipped', 'reason': 'MAILERLITE_API_KEY is not configured'}

    body = json.dumps(payload).encode('utf-8')
    req = request.Request(
        f'https://connect.mailerlite.com/api/{path}',
        data=body,
        method='POST',
        headers={
            'accept': 'application/json',
            'authorization': f'Bearer {api_key}',
            'content-type': 'application/json',
        }
    )
    try:
        with request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode('utf-8') or '{}')
            return {'status': 'ok', 'data': data}
    except error.HTTPError as exc:
        detail = exc.read().decode('utf-8', errors='replace')
        raise MailerLiteSyncError(f'MailerLite HTTP {exc.code}: {detail}') from exc
    except error.URLError as exc:
        raise MailerLiteSyncError(f'MailerLite connection error: {exc.reason}') from exc


def _extract_level_metadata(notes):
    score = None
    band = ''
    for fragment in (notes or '').split('|'):
        item = fragment.strip()
        if item.startswith('test_score:'):
            value = item.split(':', 1)[1].strip()
            try:
                score = int(value.split('/')[0])
            except (ValueError, IndexError):
                score = None
        elif item.startswith('test_band:'):
            band = item.split(':', 1)[1].strip()
    return score, band


def _with_query_params(url, params):
    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query.update({k: v for k, v in params.items() if v is not None and v != ''})
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def _level_bucket(score):
    if score <= 3:
        return 'starter'
    if score <= 7:
        return 'basic'
    if score <= 10:
        return 'intermediate'
    if score <= 13:
        return 'upper_intermediate'
    return 'b2_ready'


def _followup_sequence_metadata(language, score):
    bucket = _level_bucket(score)

    if language == 'es':
        return {
            'sequence': 'level_test_v1',
            'language': 'es',
            'bucket': bucket,
            'd1_subject': 'Tu plan de 4 semanas para avanzar en espanol',
            'd3_subject': 'El error #1 que frena tu progreso (y como evitarlo)',
            'd7_subject': 'Ultimo recordatorio: reserva tu plaza esta semana',
            'd1_hook': 'Plan claro + accion inmediata',
            'd3_hook': 'Bloqueo comun + solucion concreta',
            'd7_hook': 'Cierre con urgencia suave',
        }

    if language == 'cz':
        return {
            'sequence': 'level_test_v1',
            'language': 'cz',
            'bucket': bucket,
            'd1_subject': 'Tvuj 4tydenni plan pro rychly posun ve spanelstine',
            'd3_subject': 'Nejcastejsi chyba, ktera brzdi pokrok (a jak ji odstranit)',
            'd7_subject': 'Posledni pripomenuti: rezervuj si misto tento tyden',
            'd1_hook': 'Jasny plan + okamzita akce',
            'd3_hook': 'Typicky blok + konkretni reseni',
            'd7_hook': 'Uzavreni s jemnou urgenci',
        }

    return {
        'sequence': 'level_test_v1',
        'language': 'sk',
        'bucket': bucket,
        'd1_subject': 'Tvoj 4-tyzdnovy plan pre rychly posun v spanielcine',
        'd3_subject': 'Najcastejsia chyba, ktora brzdi pokrok (a ako ju odstranit)',
        'd7_subject': 'Posledna pripomienka: rezervuj si miesto tento tyzden',
        'd1_hook': 'Jasny plan + okamzita akcia',
        'd3_hook': 'Typicky blok + konkretne riesenie',
        'd7_hook': 'Uzavretie s jemnou urgenciou',
    }


def _email_copy(language, score, band, full_name):
    first_name = (full_name or 'Hola').split()[0]
    bucket = _level_bucket(score)

    if language == 'es':
        tier_text = {
            'starter': 'Le conviene consolidar las bases y desarrollar su expresión oral.',
            'basic': 'Tiene una buena base para mejorar su fluidez con una estructura guiada.',
            'intermediate': 'Ya tiene una buena base; ahora puede convertir sus conocimientos en una conversación más natural.',
            'upper_intermediate': 'Está cerca de dar un gran salto en seguridad y precisión al hablar.',
            'b2_ready': 'Tiene una base excelente para orientarse hacia un nivel B2 sólido.',
        }
        return {
            'subject': 'Su resultado del test de español y el plan recomendado',
            'preheader': 'Ya tiene su nivel estimado y una recomendación para seguir avanzando.',
            'greeting': f'Hola, {first_name}:',
            'intro': 'Gracias por completar el test de nivel de Habluj. Aquí tiene su resultado y el siguiente paso recomendado.',
            'result_label': 'Nivel estimado',
            'score_label': 'Puntuación',
            'bucket_text': tier_text[bucket],
            'plan_title': 'Plan recomendado',
            'plan_individual': 'Empiece con clases individuales para corregir sus dificultades y ganar confianza.',
            'plan_group': 'Combine las clases individuales con un grupo para practicar la conversación en situaciones reales.',
            'cta_primary': 'Reservar una clase de inicio',
            'cta_secondary': 'Ver programas y precios',
            'urgency': 'Las plazas semanales son limitadas para mantener una atención personalizada.',
            'followup': 'Si responde a este correo con su objetivo, le enviaremos una ruta concreta de cuatro semanas.',
            'team': 'Equipo Habluj',
        }

    if language == 'cz':
        tier_text = {
            'starter': 'Nejvíce Vám nyní pomůže upevnit základy a začít plynuleji mluvit.',
            'basic': 'Máte dobrý základ a můžete zrychlit svou plynulost pomocí strukturované výuky.',
            'intermediate': 'Základy již máte; nyní je můžete proměnit v přirozenou konverzaci.',
            'upper_intermediate': 'Jste blízko výrazného posunu v jistotě i přesnosti při mluvení.',
            'b2_ready': 'Máte skvělý základ pro dosažení solidní úrovně B2.',
        }
        return {
            'subject': 'Váš výsledek testu španělštiny a doporučený plán',
            'preheader': 'Znáte svou odhadovanou úroveň a další doporučený krok.',
            'greeting': f'Dobrý den, {first_name}:',
            'intro': 'Děkujeme Vám za vyplnění testu úrovně v Habluj. Níže najdete svůj výsledek a doporučený další krok.',
            'result_label': 'Odhadovaná úroveň',
            'score_label': 'Skóre',
            'bucket_text': tier_text[bucket],
            'plan_title': 'Doporučený plán',
            'plan_individual': 'Začněte individuálními lekcemi, které Vám pomohou odstranit obtíže a získat větší jistotu.',
            'plan_group': 'Doplňte je skupinovou výukou pro procvičení konverzace v reálných situacích.',
            'cta_primary': 'Rezervovat úvodní lekci',
            'cta_secondary': 'Prohlédnout programy a ceny',
            'urgency': 'Týdenní kapacita je omezená, abychom zachovali vysokou kvalitu výuky.',
            'followup': 'Odpovězte na tento e-mail se svým cílem a zašleme Vám konkrétní plán na čtyři týdny.',
            'team': 'Tým Habluj',
        }

    tier_text = {
        'starter': 'Najviac Vám teraz pomôže upevniť základy a začať plynulejšie rozprávať.',
        'basic': 'Máte dobrý základ a môžete zrýchliť svoju plynulosť pomocou štruktúrovanej výučby.',
        'intermediate': 'Základy už máte; teraz ich môžete premeniť na prirodzenú konverzáciu.',
        'upper_intermediate': 'Ste blízko výrazného posunu v istote aj presnosti pri rozprávaní.',
        'b2_ready': 'Máte skvelý základ na dosiahnutie solídnej úrovne B2.',
    }
    return {
        'subject': 'Váš výsledok testu španielčiny a odporúčaný plán',
        'preheader': 'Poznáte svoju odhadovanú úroveň a ďalší odporúčaný krok.',
        'greeting': f'Dobrý deň, {first_name}:',
        'intro': 'Ďakujeme Vám za vyplnenie testu úrovne v Habluj. Nižšie nájdete svoj výsledok a odporúčaný ďalší krok.',
        'result_label': 'Odhadovaná úroveň',
        'score_label': 'Skóre',
        'bucket_text': tier_text[bucket],
        'plan_title': 'Odporúčaný plán',
        'plan_individual': 'Začnite individuálnymi lekciami, ktoré Vám pomôžu odstrániť ťažkosti a získať väčšiu istotu.',
        'plan_group': 'Doplňte ich skupinovou výučbou na precvičenie konverzácie v reálnych situáciách.',
        'cta_primary': 'Rezervovať úvodnú lekciu',
        'cta_secondary': 'Pozrieť si programy a ceny',
        'urgency': 'Týždenná kapacita je obmedzená, aby sme zachovali vysokú kvalitu výučby.',
        'followup': 'Odpovedzte na tento e-mail so svojím cieľom a pošleme Vám konkrétny plán na štyri týždne.',
        'team': 'Tím Habluj',
    }


def _localized_test_band(language, band):
    labels = {
        'es': {
            'B2 (maximo del test)': 'B2 (máximo del test)',
        },
        'cz': {
            'B1 alto': 'B1 vyšší',
            'B2 (máximo del test)': 'B2 (maximum testu)',
            'B2 (maximo del test)': 'B2 (maximum testu)',
        },
        'sk': {
            'B1 alto': 'B1 vyššia úroveň',
            'B2 (máximo del test)': 'B2 (maximum testu)',
            'B2 (maximo del test)': 'B2 (maximum testu)',
        },
    }
    return labels.get(language, {}).get(band, band)


def sync_lead_to_mailerlite(lead):
    if not _require_api_key():
        return {'status': 'skipped', 'reason': 'MAILERLITE_API_KEY is not configured'}

    group_id = os.environ.get('MAILERLITE_LEAD_GROUP_ID', '').strip()
    test_score, test_band = _extract_level_metadata(lead.notes)
    followup_meta = _followup_sequence_metadata(lead.preferred_language, test_score or 0)
    payload = {
        'email': lead.email,
        'fields': {
            'name': lead.full_name,
            'phone': lead.phone,
            'lead_source': lead.source,
            'lead_stage': lead.stage,
            'lead_language': lead.preferred_language,
            'consent_marketing': lead.consent_marketing,
            'consent_privacy': lead.consent_privacy,
            'level_test_score': test_score if test_score is not None else '',
            'level_test_band': test_band,
            'followup_sequence': followup_meta['sequence'] if lead.source == 'advanced_level_test' else '',
            'followup_language': followup_meta['language'] if lead.source == 'advanced_level_test' else '',
            'followup_bucket': followup_meta['bucket'] if lead.source == 'advanced_level_test' else '',
            'followup_d1_subject': followup_meta['d1_subject'] if lead.source == 'advanced_level_test' else '',
            'followup_d3_subject': followup_meta['d3_subject'] if lead.source == 'advanced_level_test' else '',
            'followup_d7_subject': followup_meta['d7_subject'] if lead.source == 'advanced_level_test' else '',
            'followup_d1_hook': followup_meta['d1_hook'] if lead.source == 'advanced_level_test' else '',
            'followup_d3_hook': followup_meta['d3_hook'] if lead.source == 'advanced_level_test' else '',
            'followup_d7_hook': followup_meta['d7_hook'] if lead.source == 'advanced_level_test' else '',
        },
        'status': 'active',
    }
    if group_id:
        payload['groups'] = [group_id]

    response = _send_mailerlite_request('subscribers', payload)
    if response['status'] == 'skipped':
        return response

    subscriber = response['data'].get('data', {}) if isinstance(response['data'], dict) else {}
    return {'status': 'synced', 'contact_id': str(subscriber.get('id', ''))}


def send_new_lead_notification(lead):
    recipient = os.environ.get('MAILERLITE_NOTIFICATION_TO', 'habluj.sk@gmail.com')
    sender_email = os.environ.get('MAILERLITE_SENDER_EMAIL') or getattr(settings, 'DEFAULT_FROM_EMAIL', '')

    admin_base_url = os.environ.get('DJANGO_ADMIN_BASE_URL', '')
    lead_path = f'/admin/api/lead/{lead.pk}/change/'
    lead_url = f'{admin_base_url.rstrip("/")}{lead_path}' if admin_base_url else lead_path

    if not sender_email:
        return {'status': 'skipped', 'reason': 'MAILERLITE_SENDER_EMAIL or DJANGO_DEFAULT_FROM_EMAIL is not configured'}

    if not _smtp_notifications_available():
        return {'status': 'skipped', 'reason': 'SMTP is not configured for MailerLite notifications'}

    return _send_django_email_notification(
        lead=lead,
        recipient=recipient,
        sender_email=sender_email,
        lead_url=lead_url,
    )


def send_level_test_results_email(*, lead, score, band):
    sender_email = os.environ.get('MAILERLITE_SENDER_EMAIL') or getattr(settings, 'DEFAULT_FROM_EMAIL', '')
    booking_url = os.environ.get('BOOKING_PUBLIC_URL', 'https://habluj.setmore.com/')
    services_base_url = os.environ.get('PUBLIC_SITE_URL', 'https://habluj.vercel.app').rstrip('/')
    services_url_env = os.environ.get('SERVICES_PUBLIC_URL', '').strip()
    language = (lead.preferred_language or 'sk').lower()
    services_path_by_language = {
        'es': '/es/tutoring-services',
        'cz': '/cz/tutoring-services',
        'sk': '/sk/tutoring-services',
    }
    services_url = services_url_env or f"{services_base_url}{services_path_by_language.get(language, '/sk/tutoring-services')}"

    if not sender_email:
        return {'status': 'skipped', 'reason': 'MAILERLITE_SENDER_EMAIL or DJANGO_DEFAULT_FROM_EMAIL is not configured'}

    copy = _email_copy(language, score, band, lead.full_name)
    localized_band = _localized_test_band(language, band)
    campaign = f'level_test_{language}'
    tracked_booking_url = _with_query_params(booking_url, {
        'utm_source': 'email',
        'utm_medium': 'crm',
        'utm_campaign': campaign,
        'utm_content': 'cta_primary_booking',
        'score': str(score),
        'band': band,
    })
    tracked_services_url = _with_query_params(services_url, {
        'utm_source': 'email',
        'utm_medium': 'crm',
        'utm_campaign': campaign,
        'utm_content': 'cta_secondary_services',
        'score': str(score),
        'band': band,
    })

    text_content = (
        f"{copy['greeting']}\n\n"
        f"{copy['intro']}\n\n"
        f"{copy['result_label']}: {localized_band}\n"
        f"{copy['score_label']}: {score}/15\n\n"
        f"{copy['bucket_text']}\n\n"
        f"{copy['plan_title']}:\n"
        f"- {copy['plan_individual']}\n"
        f"- {copy['plan_group']}\n\n"
        f"{copy['cta_primary']}: {tracked_booking_url}\n"
        f"{copy['cta_secondary']}: {tracked_services_url}\n\n"
        f"{copy['urgency']}\n\n"
        f"{copy['followup']}\n\n"
        f"{copy['team']}\n"
    )

    html_content = (
        '<!doctype html>'
        '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
        '<body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">'
        f'<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">{copy["preheader"]}</div>'
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 0;">'
        '<tr><td align="center">'
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">'
        '<tr><td style="background:linear-gradient(135deg,#4F8A78,#3D6F61);padding:28px 24px;color:#ffffff;">'
        '<p style="margin:0 0 8px;font-size:14px;opacity:.9;">Habluj</p>'
        f'<h1 style="margin:0;font-size:24px;line-height:1.3;">{copy["result_label"]}: {localized_band}</h1>'
        f'<p style="margin:10px 0 0;font-size:14px;opacity:.95;">{copy["score_label"]}: {score}/15</p>'
        '</td></tr>'
        '<tr><td style="padding:24px;">'
        f'<p style="margin:0 0 12px;font-size:16px;">{copy["greeting"]}</p>'
        f'<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;">{copy["intro"]}</p>'
        f'<p style="margin:0 0 18px;padding:12px 14px;background:#EEF6F2;border:1px solid #CFE3DA;border-radius:10px;font-size:14px;line-height:1.6;color:#2F6658;">{copy["bucket_text"]}</p>'
        f'<h2 style="margin:0 0 8px;font-size:18px;">{copy["plan_title"]}</h2>'
        '<ul style="margin:0 0 18px;padding-left:20px;color:#374151;font-size:14px;line-height:1.6;">'
        f'<li style="margin-bottom:6px;">{copy["plan_individual"]}</li>'
        f'<li>{copy["plan_group"]}</li>'
        '</ul>'
        f'<p style="margin:0 0 12px;font-size:14px;color:#6b7280;">{copy["urgency"]}</p>'
        f'<a href="{tracked_booking_url}" style="display:inline-block;background:#4F8A78;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;font-size:14px;margin-right:8px;margin-bottom:10px;">{copy["cta_primary"]}</a>'
        f'<a href="{tracked_services_url}" style="display:inline-block;background:#ffffff;color:#3D6F61;text-decoration:none;padding:11px 16px;border-radius:10px;border:1px solid #4F8A78;font-weight:700;font-size:14px;margin-bottom:10px;">{copy["cta_secondary"]}</a>'
        f'<p style="margin:14px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">{copy["followup"]}</p>'
        '</td></tr>'
        '<tr><td style="padding:16px 24px;border-top:1px solid #e5e7eb;background:#fafafa;">'
        f'<p style="margin:0;font-size:12px;color:#6b7280;">{copy["team"]}</p>'
        '</td></tr>'
        '</table>'
        '</td></tr></table></body></html>'
    )

    if _smtp_notifications_available():
        try:
            send_mail(
                subject=copy['subject'],
                message=text_content,
                from_email=sender_email,
                recipient_list=[lead.email],
                fail_silently=False,
                html_message=html_content,
            )
            return {'status': 'sent', 'channel': 'smtp'}
        except Exception as exc:  # pragma: no cover - depends on runtime mail backend
            raise MailerLiteSyncError(f'Level test result email failed: {exc}') from exc

    return {
        'status': 'skipped',
        'reason': 'No email channel available. Configure SMTP settings for MailerLite.',
    }
