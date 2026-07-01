'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';

interface CalendarBooking {
  id: string;
  client_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  service?: { name: string };
}

interface BookingsCalendarProps {
  bookings: CalendarBooking[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function BookingsCalendar({ bookings }: BookingsCalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const getBookingsForDate = (dateStr: string) =>
    bookings.filter((b) => b.booking_date === dateStr && b.status !== 'cancelled');

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="card p-4 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-neutral-100" aria-label="Previous month">
            <ChevronLeft className="h-5 w-5 text-neutral-600" />
          </button>
          <h3 className="font-display text-lg font-semibold text-neutral-900">
            {MONTHS[viewMonth]} {viewYear}
          </h3>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-neutral-100" aria-label="Next month">
            <ChevronRight className="h-5 w-5 text-neutral-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-neutral-400 py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayBookings = getBookingsForDate(dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === today.toISOString().split('T')[0];

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={cn(
                  'min-h-[3rem] rounded-lg p-1.5 text-left transition-colors',
                  isSelected ? 'bg-brand-600 text-white' : 'hover:bg-neutral-50',
                  !isSelected && isToday && 'ring-1 ring-brand-300'
                )}
              >
                <span className={cn('text-xs font-medium', isSelected ? 'text-white' : 'text-neutral-700')}>
                  {day}
                </span>
                {dayBookings.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayBookings.slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className={cn(
                          'truncate text-[10px] rounded px-1 py-0.5',
                          isSelected ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'
                        )}
                      >
                        {formatTime(b.booking_time)} {b.client_name}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className={cn('text-[10px]', isSelected ? 'text-white/70' : 'text-neutral-400')}>
                        +{dayBookings.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-display text-sm font-semibold text-neutral-900">
          {selectedDate
            ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-PH', {
                weekday: 'long', month: 'long', day: 'numeric'
              })
            : 'Select a date'}
        </h3>

        {selectedDate && selectedDateBookings.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {selectedDateBookings.map((b) => (
              <li key={b.id} className="rounded-lg border border-neutral-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900">{b.client_name}</span>
                  <span className="text-xs text-neutral-500">{formatTime(b.booking_time)}</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">{b.service?.name}</p>
              </li>
            ))}
          </ul>
        ) : selectedDate ? (
          <p className="mt-3 text-sm text-neutral-400">No bookings for this date.</p>
        ) : (
          <p className="mt-3 text-sm text-neutral-400">Click a date to see bookings.</p>
        )}
      </div>
    </div>
  );
}
