import json
import os
from urllib import error, request

from django.conf import settings
from django.core.mail import send_mail


class BrevoSyncError(Exception):
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
        raise BrevoSyncError(f'SMTP notification failed: {exc}') from exc


def _require_api_key():
    api_key = os.environ.get('BREVO_API_KEY')
    if not api_key:
        return None
    return api_key


def _send_brevo_request(path, payload):
    api_key = _require_api_key()
    if not api_key:
        return {'status': 'skipped', 'reason': 'BREVO_API_KEY is not configured'}

    body = json.dumps(payload).encode('utf-8')
    req = request.Request(
        f'https://api.brevo.com/v3/{path}',
        data=body,
        method='POST',
        headers={
            'accept': 'application/json',
            'api-key': api_key,
            'content-type': 'application/json',
        }
    )
    try:
        with request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode('utf-8') or '{}')
            return {'status': 'ok', 'data': data}
    except error.HTTPError as exc:
        detail = exc.read().decode('utf-8', errors='replace')
        raise BrevoSyncError(f'Brevo HTTP {exc.code}: {detail}') from exc
    except error.URLError as exc:
        raise BrevoSyncError(f'Brevo connection error: {exc.reason}') from exc


def sync_lead_to_brevo(lead):
    if not _require_api_key():
        return {'status': 'skipped', 'reason': 'BREVO_API_KEY is not configured'}

    list_id = os.environ.get('BREVO_LEAD_LIST_ID')
    payload = {
        'email': lead.email,
        'attributes': {
            'FIRSTNAME': lead.full_name.split(' ')[0] if lead.full_name else '',
            'LASTNAME': ' '.join(lead.full_name.split(' ')[1:]) if lead.full_name else '',
            'SMS': lead.phone,
            'LEAD_SOURCE': lead.source,
            'LEAD_STAGE': lead.stage,
            'LEAD_LANGUAGE': lead.preferred_language,
            'CONSENT_MARKETING': lead.consent_marketing,
            'CONSENT_PRIVACY': lead.consent_privacy,
        },
        'updateEnabled': True,
    }
    if list_id:
        try:
            payload['listIds'] = [int(list_id)]
        except ValueError as exc:
            raise BrevoSyncError('BREVO_LEAD_LIST_ID must be numeric') from exc

    response = _send_brevo_request('contacts', payload)
    if response['status'] == 'skipped':
        return response
    return {'status': 'synced', 'contact_id': str(response['data'].get('id', ''))}


def send_new_lead_notification(lead):
    recipient = os.environ.get('BREVO_NOTIFICATION_TO', 'habluj.sk@gmail.com')
    sender_email = os.environ.get('BREVO_SENDER_EMAIL') or getattr(settings, 'DEFAULT_FROM_EMAIL', '')

    sender_name = os.environ.get('BREVO_SENDER_NAME', 'Habluj')
    admin_base_url = os.environ.get('DJANGO_ADMIN_BASE_URL', '')
    lead_path = f'/admin/api/lead/{lead.pk}/change/'
    lead_url = f'{admin_base_url.rstrip("/")}{lead_path}' if admin_base_url else lead_path

    if not sender_email:
        return {'status': 'skipped', 'reason': 'BREVO_SENDER_EMAIL or DJANGO_DEFAULT_FROM_EMAIL is not configured'}

    # Prefer Brevo API when key is present; otherwise fallback to Django email backend.
    if not _require_api_key():
        if _smtp_notifications_available():
            return _send_django_email_notification(
                lead=lead,
                recipient=recipient,
                sender_email=sender_email,
                lead_url=lead_url,
            )
        return {'status': 'skipped', 'reason': 'BREVO_API_KEY is not configured'}

    subject = f'Nuevo lead recibido: {lead.full_name}'
    payload = {
        'sender': {
            'name': sender_name,
            'email': sender_email,
        },
        'to': [{'email': recipient}],
        'subject': subject,
        'htmlContent': (
            f'<h3>Nuevo lead en Habluj</h3>'
            f'<p><strong>Nombre:</strong> {lead.full_name}</p>'
            f'<p><strong>Email:</strong> {lead.email}</p>'
            f'<p><strong>Teléfono:</strong> {lead.phone or "-"}</p>'
            f'<p><strong>Idioma:</strong> {lead.preferred_language}</p>'
            f'<p><strong>Origen:</strong> {lead.source}</p>'
            f'<p><strong>Consentimiento marketing:</strong> {"Sí" if lead.consent_marketing else "No"}</p>'
            f'<p><strong>Notas:</strong><br>{(lead.notes or "-").replace(chr(10), "<br>")}</p>'
            f'<p><a href="{lead_url}">Abrir lead en admin</a></p>'
        ),
    }

    response = _send_brevo_request('smtp/email', payload)
    if response['status'] == 'skipped':
        return response
    return {'status': 'sent'}
