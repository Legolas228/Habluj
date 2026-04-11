import logging
from datetime import datetime
from datetime import timezone as dt_timezone

from django.conf import settings

logger = logging.getLogger(__name__)


def _build_calendar_service():
    service_account_info = getattr(settings, 'GOOGLE_SERVICE_ACCOUNT_INFO', None)
    calendar_id = getattr(settings, 'GOOGLE_CALENDAR_ID', '')
    if not service_account_info or not calendar_id:
        return None, calendar_id

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except Exception:
        logger.warning('google-auth/google-api-python-client not installed, skipping Google Calendar sync')
        return None, calendar_id

    credentials = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=['https://www.googleapis.com/auth/calendar'],
    )
    service = build('calendar', 'v3', credentials=credentials, cache_discovery=False)
    return service, calendar_id


def get_busy_windows(time_min_utc: datetime, time_max_utc: datetime):
    service, calendar_id = _build_calendar_service()
    if service is None or not calendar_id:
        return []

    try:
        response = service.freebusy().query(body={
            'timeMin': time_min_utc.isoformat(),
            'timeMax': time_max_utc.isoformat(),
            'items': [{'id': calendar_id}],
        }).execute()
    except Exception:
        logger.warning('Google freebusy query failed for calendar_id=%s', calendar_id)
        return []

    busy = response.get('calendars', {}).get(calendar_id, {}).get('busy', [])
    windows = []
    for item in busy:
        start_value = item.get('start')
        end_value = item.get('end')
        if not start_value or not end_value:
            continue
        windows.append((
            datetime.fromisoformat(start_value.replace('Z', '+00:00')),
            datetime.fromisoformat(end_value.replace('Z', '+00:00')),
        ))
    return windows


def create_google_meet_event(*, start_utc: datetime, end_utc: datetime, attendee_email: str, summary: str):
    service, calendar_id = _build_calendar_service()
    if service is None or not calendar_id:
        raise RuntimeError('Google Calendar is not configured. Cannot create Meet link.')

    request_id = f'meet-{int(start_utc.timestamp())}-{attendee_email.split("@")[0]}'
    payload = {
        'summary': summary,
        'start': {'dateTime': start_utc.isoformat()},
        'end': {'dateTime': end_utc.isoformat()},
        'attendees': [{'email': attendee_email}],
        'conferenceData': {
            'createRequest': {
                'requestId': request_id,
                'conferenceSolutionKey': {'type': 'hangoutsMeet'},
            },
        },
    }

    try:
        event = service.events().insert(
            calendarId=calendar_id,
            conferenceDataVersion=1,
            body=payload,
        ).execute()
    except Exception as exc:
        raise RuntimeError(f'Google Calendar event creation failed: {exc}') from exc

    meet_link = event.get('hangoutLink', '')
    if not meet_link:
        entry_points = event.get('conferenceData', {}).get('entryPoints', [])
        for entry in entry_points:
            if entry.get('entryPointType') == 'video' and entry.get('uri'):
                meet_link = entry['uri']
                break

    if not meet_link:
        raise RuntimeError('Google Meet link could not be generated for this booking.')

    return meet_link, event.get('id', '')


def list_calendar_events(*, start_utc: datetime, end_utc: datetime):
    service, calendar_id = _build_calendar_service()
    if service is None or not calendar_id:
        return []

    try:
        response = service.events().list(
            calendarId=calendar_id,
            timeMin=start_utc.astimezone(dt_timezone.utc).isoformat(),
            timeMax=end_utc.astimezone(dt_timezone.utc).isoformat(),
            singleEvents=True,
            orderBy='startTime',
            maxResults=2500,
            showDeleted=False,
        ).execute()
    except Exception:
        logger.warning('Google events list failed for calendar_id=%s', calendar_id)
        return []

    items = response.get('items', []) or []
    events = []
    for item in items:
        start_raw = item.get('start', {}).get('dateTime')
        end_raw = item.get('end', {}).get('dateTime')
        # Skip all-day events for agenda slot grid.
        if not start_raw or not end_raw:
            continue
        try:
            start_dt = datetime.fromisoformat(start_raw.replace('Z', '+00:00')).astimezone(dt_timezone.utc)
            end_dt = datetime.fromisoformat(end_raw.replace('Z', '+00:00')).astimezone(dt_timezone.utc)
        except Exception:
            continue
        if end_dt <= start_dt:
            continue

        private_props = (item.get('extendedProperties', {}) or {}).get('private', {}) or {}
        block_id = private_props.get('hablujBlockId') or ''
        events.append({
            'id': item.get('id', ''),
            'summary': item.get('summary', '') or 'Google event',
            'description': item.get('description', '') or '',
            'start_time_utc': start_dt,
            'end_time_utc': end_dt,
            'html_link': item.get('htmlLink', ''),
            'is_habluj_block': bool(block_id),
            'habluj_block_id': str(block_id) if block_id else '',
        })

    return events


def upsert_block_event(*, block_id: int, start_utc: datetime, end_utc: datetime, summary: str, description: str = ''):
    service, calendar_id = _build_calendar_service()
    if service is None or not calendar_id:
        return ''

    prop = f'hablujBlockId={block_id}'
    try:
        existing = service.events().list(
            calendarId=calendar_id,
            singleEvents=True,
            privateExtendedProperty=prop,
            showDeleted=False,
            maxResults=10,
        ).execute().get('items', []) or []
    except Exception:
        logger.warning('Google events lookup failed for block_id=%s calendar_id=%s', block_id, calendar_id)
        return ''

    payload = {
        'summary': summary,
        'description': description,
        'start': {'dateTime': start_utc.astimezone(dt_timezone.utc).isoformat()},
        'end': {'dateTime': end_utc.astimezone(dt_timezone.utc).isoformat()},
        'extendedProperties': {
            'private': {
                'hablujBlockId': str(block_id),
            },
        },
    }

    if existing:
        event_id = existing[0].get('id')
        if not event_id:
            return ''
        try:
            updated = service.events().update(
                calendarId=calendar_id,
                eventId=event_id,
                body=payload,
            ).execute()
        except Exception:
            logger.warning('Google event update failed for block_id=%s calendar_id=%s', block_id, calendar_id)
            return ''
        return updated.get('id', '')

    try:
        created = service.events().insert(
            calendarId=calendar_id,
            body=payload,
        ).execute()
    except Exception:
        logger.warning('Google event create failed for block_id=%s calendar_id=%s', block_id, calendar_id)
        return ''
    return created.get('id', '')


def delete_block_event(*, block_id: int):
    service, calendar_id = _build_calendar_service()
    if service is None or not calendar_id:
        return 0

    prop = f'hablujBlockId={block_id}'
    try:
        existing = service.events().list(
            calendarId=calendar_id,
            singleEvents=True,
            privateExtendedProperty=prop,
            showDeleted=False,
            maxResults=25,
        ).execute().get('items', []) or []
    except Exception:
        logger.warning('Google events delete lookup failed for block_id=%s calendar_id=%s', block_id, calendar_id)
        return 0

    deleted = 0
    for item in existing:
        event_id = item.get('id')
        if not event_id:
            continue
        try:
            service.events().delete(calendarId=calendar_id, eventId=event_id).execute()
        except Exception:
            logger.warning('Google event delete failed for block_id=%s event_id=%s', block_id, event_id)
            continue
        deleted += 1
    return deleted
