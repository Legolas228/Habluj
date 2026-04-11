import json
import os
from urllib import error, request

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
        f'Telefono: {lead.phone or "-"}\n'
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
        f'<p><strong>Telefono:</strong> {lead.phone or "-"}</p>'
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


def sync_lead_to_mailerlite(lead):
    if not _require_api_key():
        return {'status': 'skipped', 'reason': 'MAILERLITE_API_KEY is not configured'}

    group_id = os.environ.get('MAILERLITE_LEAD_GROUP_ID', '').strip()
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
    services_url = os.environ.get('SERVICES_PUBLIC_URL', 'https://habluj.sk/tutoring-services')
    if not sender_email:
        return {'status': 'skipped', 'reason': 'MAILERLITE_SENDER_EMAIL or DJANGO_DEFAULT_FROM_EMAIL is not configured'}

    individual_recommendation = (
        'Te recomendamos empezar con clases individuales para reforzar base, '
        'ganar confianza y corregir errores clave rapidamente.'
    )
    group_recommendation = (
        'Tambien puedes combinar con clases grupales para practicar conversacion, '
        'escucha activa y fluidez en contexto real.'
    )

    subject = 'Resultado de tu test de espanol - Habluj'
    text_content = (
        f'Hola {lead.full_name},\n\n'
        'Gracias por completar el test avanzado de espanol.\n\n'
        f'Resultado: {score}/15\n'
        f'Nivel estimado: {band}\n\n'
        'Recomendacion personalizada:\n'
        f'- Individuales: {individual_recommendation}\n'
        f'- Grupales: {group_recommendation}\n\n'
        'Reservar clases:\n'
        f'- Reserva directa: {booking_url}\n'
        f'- Informacion de servicios: {services_url}\n\n'
        'Si quieres, responde a este correo y te ayudamos a elegir el mejor plan.\n\n'
        'Equipo Habluj\n'
    )
    html_content = (
        f'<h3>Hola {lead.full_name},</h3>'
        '<p>Gracias por completar el test avanzado de espanol.</p>'
        f'<p><strong>Resultado:</strong> {score}/15<br>'
        f'<strong>Nivel estimado:</strong> {band}</p>'
        '<h4>Recomendacion personalizada</h4>'
        f'<p><strong>Clases individuales:</strong> {individual_recommendation}</p>'
        f'<p><strong>Clases grupales:</strong> {group_recommendation}</p>'
        '<h4>Reservar clases</h4>'
        f'<p><a href="{booking_url}">Reserva directa</a></p>'
        f'<p><a href="{services_url}">Informacion de servicios</a></p>'
        '<p>Si quieres, responde a este correo y te ayudamos a elegir el mejor plan.</p>'
        '<p>Equipo Habluj</p>'
    )

    if _smtp_notifications_available():
        try:
            send_mail(
                subject=subject,
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