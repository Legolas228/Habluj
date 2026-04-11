import React, { useEffect, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

const styleForKind = (kind) => {
  if (kind === 'booked') {
    return {
      backgroundColor: 'rgba(245, 158, 11, 0.25)',
      borderColor: 'rgba(245, 158, 11, 0.35)',
      textColor: '#92400e',
    };
  }
  if (kind === 'unavailable') {
    return {
      backgroundColor: 'rgba(107, 114, 128, 0.2)',
      borderColor: 'rgba(107, 114, 128, 0.35)',
      textColor: '#374151',
    };
  }
  // 'available' (por defecto)
  return {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.28)',
    textColor: '#166534',
  };
};

const AgendaCalendar = ({
  events = [],
  anchorDate,
  viewMode,
  onViewModeChange,
  onSelectSlot,
  onSelectEvent,
}) => {
  const calendarRef = useRef(null);
  const calendarView = viewMode === 'monthly' ? 'dayGridMonth' : 'timeGridWeek';

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api || !anchorDate) return;
    api.gotoDate(anchorDate);
  }, [anchorDate]);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    const expectedView = viewMode === 'monthly' ? 'dayGridMonth' : 'timeGridWeek';
    if (api.view.type !== expectedView) {
      api.changeView(expectedView);
    }
  }, [viewMode]);

  const fullCalendarEvents = useMemo(() => {
    return events.map((event) => {
      const kind = event?.resource?.kind || 'available';
      return {
        ...event,
        ...styleForKind(kind),
        extendedProps: {
          resource: event.resource,
        },
      };
    });
  }, [events]);

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      locale={esLocale}
      initialView={calendarView}
      initialDate={anchorDate}
      headerToolbar={false}
      events={fullCalendarEvents}
      selectable
      selectMirror
      select={(info) => onSelectSlot?.({ start: info.start, end: info.end })}
      eventClick={(clickInfo) => {
        const resource = clickInfo?.event?.extendedProps?.resource;
        if (resource) {
          onSelectEvent?.({ resource });
        }
      }}
      height="100%"
      slotDuration="01:00:00"
      snapDuration="01:00:00"
      slotMinTime="07:00:00"
      slotMaxTime="22:00:00"
      allDaySlot={viewMode === 'monthly'}
      dayMaxEventRows={3}
      nowIndicator
      datesSet={(info) => {
        if (info.view.type === 'dayGridMonth') {
          onViewModeChange?.('monthly');
        } else {
          onViewModeChange?.('weekly');
        }
      }}
    />
  );
};

export default AgendaCalendar;
