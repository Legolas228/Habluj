import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BookingCalendar = ({ onTimeSelect, selectedService }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Mock calendar data
  const currentDate = new Date();
  const calendarDays = [];
  
  // Generate next 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date(currentDate);
    date?.setDate(currentDate?.getDate() + i);
    calendarDays?.push(date);
  }

  const timeSlots = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  const unavailableSlots = ["11:00", "15:00"]; // Mock unavailable times

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    if (onTimeSelect) {
      onTimeSelect({
        date: selectedDate,
        time: time,
        service: selectedService
      });
    }
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('sk-SK', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date?.toDateString() === today?.toDateString();
  };

  const isWeekend = (date) => {
    return date?.getDay() === 0 || date?.getDay() === 6;
  };

  return (
    <div className="bg-white rounded-xl shadow-soft border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Icon name="Calendar" size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-headlines font-bold text-foreground">
            Rezervácia termínu
          </h3>
          <p className="text-sm text-muted-foreground">
            Vyberte si dátum a čas pre vašu lekciu
          </p>
        </div>
      </div>
      {/* Date Selection */}
      <div className="mb-6">
        <h4 className="font-medium text-foreground mb-3">Vyberte dátum</h4>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays?.map((date, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(date)}
              disabled={isWeekend(date)}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedDate?.toDateString() === date?.toDateString()
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : isWeekend(date)
                  ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                  : isToday(date)
                  ? 'bg-accent text-accent-foreground hover:bg-accent/80'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              <div className="text-xs opacity-75">
                {date?.toLocaleDateString('sk-SK', { weekday: 'short' })}
              </div>
              <div className="font-bold">
                {date?.getDate()}
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Time Selection */}
      {selectedDate && (
        <div className="mb-6">
          <h4 className="font-medium text-foreground mb-3">
            Dostupné časy pre {formatDate(selectedDate)}
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {timeSlots?.map((time) => {
              const isUnavailable = unavailableSlots?.includes(time);
              return (
                <button
                  key={time}
                  onClick={() => !isUnavailable && handleTimeSelect(time)}
                  disabled={isUnavailable}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTime === time
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : isUnavailable
                      ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {time}
                  {isUnavailable && (
                    <div className="text-xs mt-1">Obsadené</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* Booking Summary */}
      {selectedDate && selectedTime && (
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="font-medium text-foreground">Zhrnutie rezervácie</h5>
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedDate)} o {selectedTime}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-foreground">25,00 €</div>
              <div className="text-sm text-muted-foreground">60 minút</div>
            </div>
          </div>
          <Button
            variant="default"
            fullWidth
            iconName="CreditCard"
            iconPosition="left"
            className="bg-success hover:bg-success/90"
          >
            Pokračovať k platbe
          </Button>
        </div>
      )}
      {/* Booking Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium mb-1">Informácie o rezervácii</p>
            <ul className="text-blue-700 space-y-1">
              <li>• Lekcie sa konajú online cez Zoom</li>
              <li>• Zrušenie možné do 24 hodín vopred</li>
              <li>• Link na lekciu dostanete e-mailom</li>
              <li>• Bezplatná skúšobná lekcia pre nových študentov</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
