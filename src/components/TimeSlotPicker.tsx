'use client';

import { Clock } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { TimeSlot } from '@/types';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onChange: (time: string) => void;
  loading?: boolean;
}

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

  return (
    <div className="card p-6">
      <h3 className="text-sm font-medium text-neutral-700 mb-4">
        Available time slots
      </h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => (
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
}
