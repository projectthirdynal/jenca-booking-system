'use client';

import { Clock, Sunrise, Sun, Sunset } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { TimeSlot } from '@/types';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onChange: (time: string) => void;
  loading?: boolean;
}

function getPeriod(time: string): 'morning' | 'afternoon' | 'evening' {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const PERIOD_META = {
  morning: { label: 'Morning', icon: Sunrise },
  afternoon: { label: 'Afternoon', icon: Sun },
  evening: { label: 'Evening', icon: Sunset },
};

export function TimeSlotPicker({ slots, selectedTime, onChange, loading }: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 text-neutral-500">
          <Clock className="h-5 w-5 animate-pulse" />
          <span>Loading available times...</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-neutral-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="card p-6 text-center">
        <Clock className="mx-auto h-8 w-8 text-neutral-300" />
        <p className="mt-2 text-sm text-neutral-500">
          No available time slots for this date. Please select another date.
        </p>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.available);

  if (availableSlots.length === 0) {
    return (
      <div className="card p-6 text-center">
        <Clock className="mx-auto h-8 w-8 text-neutral-300" />
        <p className="mt-2 text-sm text-neutral-500">
          All slots are fully booked for this date. Please try another date.
        </p>
      </div>
    );
  }

  const groups = {
    morning: slots.filter((s) => getPeriod(s.time) === 'morning'),
    afternoon: slots.filter((s) => getPeriod(s.time) === 'afternoon'),
    evening: slots.filter((s) => getPeriod(s.time) === 'evening'),
  };

  return (
    <div className="space-y-4">
      {(['morning', 'afternoon', 'evening'] as const).map((period) => {
        const periodSlots = groups[period];
        if (periodSlots.length === 0) return null;

        const PeriodIcon = PERIOD_META[period].icon;
        const availableCount = periodSlots.filter((s) => s.available).length;

        return (
          <div key={period} className="card p-4">
            <div className="mb-3 flex items-center gap-2">
              <PeriodIcon className="h-4 w-4 text-brand-600" />
              <h4 className="text-sm font-medium text-neutral-700">
                {PERIOD_META[period].label}
              </h4>
              <span className="text-xs text-neutral-400">
                {availableCount} available
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {periodSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && onChange(slot.time)}
                  disabled={!slot.available}
                  className={cn(
                    'rounded-lg py-2.5 text-sm font-medium transition-colors',
                    !slot.available && 'bg-neutral-100 text-neutral-300 cursor-not-allowed line-through',
                    slot.available && !selectedTime && 'border border-neutral-200 text-neutral-700 hover:border-brand-400 hover:bg-brand-50',
                    slot.available && selectedTime === slot.time && 'bg-brand-600 text-white border border-brand-600',
                    slot.available && selectedTime !== slot.time && 'border border-neutral-200 text-neutral-700 hover:border-brand-400 hover:bg-brand-50'
                  )}
                  aria-pressed={selectedTime === slot.time}
                  aria-label={`${formatTime(slot.time)} ${slot.available ? 'available' : 'booked'}`}
                >
                  {formatTime(slot.time)}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
