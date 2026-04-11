import React, { useMemo } from 'react';
import { addDays, format, parseISO, startOfWeek } from 'date-fns';

const WeeklyBookingGrid = ({
  selectedDate,
  availabilityDays = [],
  selectedSlotStartUtc = '',
  onSelectSlot,
}) => {
  const weekDays = useMemo(() => {
    const anchor = selectedDate ? parseISO(selectedDate) : new Date();
    const monday = startOfWeek(anchor, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  }, [selectedDate]);

  const slotsByDate = useMemo(() => {
    const map = new Map();
    availabilityDays.forEach((day) => {
      map.set(day.date, day.slots || []);
    });
    return map;
  }, [availabilityDays]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {weekDays.map((day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const slots = slotsByDate.get(dayKey) || [];
        return (
          <div key={dayKey} className="rounded-md border border-border p-2 bg-background">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {format(day, 'EEE dd/MM')}
            </p>
            <div className="mt-2 space-y-2 max-h-56 overflow-y-auto">
              {!slots.length && (
                <p className="text-xs text-muted-foreground">Sin huecos</p>
              )}
              {slots.map((slot) => (
                <button
                  key={slot.start_time_utc || `${dayKey}-${slot.time}`}
                  type="button"
                  className={`w-full rounded-md border px-2 py-1.5 text-xs transition-colors ${
                    selectedSlotStartUtc === slot.start_time_utc
                      ? 'border-primary bg-primary text-white'
                      : 'border-border hover:border-primary/40'
                  }`}
                  onClick={() => onSelectSlot?.(dayKey, slot)}
                >
                  {String(slot.time || '').slice(0, 5)}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyBookingGrid;
