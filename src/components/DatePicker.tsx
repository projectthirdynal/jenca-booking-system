'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  selectedDate: string | null;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DatePicker({ selectedDate, onChange, minDate, maxDate }: DatePickerProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const minDateObj = minDate ? new Date(minDate + 'T00:00:00') : null;
  const maxDateObj = maxDate ? new Date(maxDate + 'T00:00:00') : null;

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isDateDisabled = (day: number) => {
    const dateObj = new Date(viewYear, viewMonth, day);
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (minDateObj && dateObj < minDateObj) return true;
    if (maxDateObj && dateObj > maxDateObj) return true;
    if (dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return true;

    return false;
  };

  const handleDateClick = (day: number) => {
    if (isDateDisabled(day)) return;
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5 text-neutral-600" />
        </button>
        <h3 className="font-display text-lg font-semibold text-neutral-900">
          {MONTHS[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5 text-neutral-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-neutral-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const disabled = isDateDisabled(day);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              className={cn(
                'aspect-square rounded-lg text-sm font-medium transition-colors',
                disabled && 'text-neutral-300 cursor-not-allowed',
                !disabled && !isSelected && 'text-neutral-700 hover:bg-brand-50',
                isSelected && 'bg-brand-600 text-white hover:bg-brand-700'
              )}
              aria-label={`${MONTHS[viewMonth]} ${day}, ${viewYear}`}
              aria-pressed={isSelected}
            >
              {day}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 flex items-center gap-2 text-sm text-neutral-600 border-t border-neutral-100 pt-3">
          <CalendarIcon className="h-4 w-4 text-brand-600" />
          <span>
            Selected: <strong className="text-neutral-900">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-PH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}
