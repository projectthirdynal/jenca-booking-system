'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { DatePicker } from '@/components/DatePicker';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { BookingForm } from '@/components/BookingForm';
import { Service } from '@/types';
import { formatPHP } from '@/lib/utils';

interface BookingWizardProps {
  services: Service[];
  preselectedServiceId?: string;
}

export function BookingWizard({ services, preselectedServiceId }: BookingWizardProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    preselectedServiceId || null
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const fetchSlots = useCallback(async (serviceId: string, date: string) => {
    setLoadingSlots(true);
    setSlotError(null);
    setSelectedTime(null);

    try {
      const response = await fetch(
        `/api/availability?serviceId=${serviceId}&date=${date}`
      );
      if (response.ok) {
        const { data } = await response.json();
        setSlots(data || []);
      } else {
        const data = await response.json();
        setSlotError(data?.error?.message || 'Failed to load time slots');
        setSlots([]);
      }
    } catch {
      setSlotError('Network error. Please try again.');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedServiceId && selectedDate) {
      fetchSlots(selectedServiceId, selectedDate);
    } else {
      setSlots([]);
      setSelectedTime(null);
    }
  }, [selectedServiceId, selectedDate, fetchSlots]);

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceId(e.target.value || null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSlots([]);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  if (services.length === 0) {
    return (
      <div className="mt-8 card p-8 text-center">
        <p className="text-sm text-neutral-500">
          No services are currently available for booking. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Step 1: Service Selection */}
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
            selectedServiceId ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'
          }`}>
            {selectedServiceId ? '✓' : '1'}
          </span>
          Choose a treatment
        </div>
        <div className="mt-3">
          <select
            value={selectedServiceId || ''}
            onChange={handleServiceChange}
            className="input-field"
            aria-label="Select a treatment"
          >
            <option value="">— Select a treatment —</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} — {service.duration_minutes} min — {formatPHP(service.price_php)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step 2: Date Selection */}
      {selectedService && (
        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
              selectedDate ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'
            }`}>
              {selectedDate ? '✓' : '2'}
            </span>
            Pick a date
          </div>
          <div className="mt-3 max-w-md">
            <DatePicker
              selectedDate={selectedDate}
              onChange={handleDateChange}
              minDate={today}
              maxDate={maxDateStr}
            />
          </div>
        </div>
      )}

      {/* Step 3: Time Slot Selection */}
      {selectedService && selectedDate && (
        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
              selectedTime ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'
            }`}>
              {selectedTime ? '✓' : '3'}
            </span>
            Choose a time
          </div>
          {slotError ? (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{slotError}</p>
            </div>
          ) : (
            <div className="mt-3">
              <TimeSlotPicker
                slots={slots}
                selectedTime={selectedTime}
                onChange={setSelectedTime}
                loading={loadingSlots}
              />
            </div>
          )}
        </div>
      )}

      {/* Step 4: Contact Details + Summary */}
      {selectedService && selectedDate && selectedTime && (
        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs">
              4
            </span>
            Your details
          </div>

          <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <BookingForm
                serviceId={selectedService.id}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                serviceName={selectedService.name}
                servicePrice={selectedService.price_php}
              />
            </div>

            {/* Summary sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-5 lg:sticky lg:top-6">
                <h3 className="font-display text-sm font-semibold text-neutral-900">
                  Booking summary
                </h3>
                <dl className="mt-4 space-y-3">
                  <div>
                    <dt className="text-xs text-neutral-500">Treatment</dt>
                    <dd className="text-sm font-medium text-neutral-900">
                      {selectedService.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Date
                    </dt>
                    <dd className="text-sm font-medium text-neutral-900">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-PH', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Time
                    </dt>
                    <dd className="text-sm font-medium text-neutral-900">
                      {new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-PH', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Duration</dt>
                    <dd className="text-sm font-medium text-neutral-900">
                      {selectedService.duration_minutes} minutes
                    </dd>
                  </div>
                  <div className="border-t border-neutral-100 pt-3">
                    <dt className="text-xs text-neutral-500">Total</dt>
                    <dd className="text-lg font-bold text-brand-700">
                      {formatPHP(selectedService.price_php)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-neutral-50 p-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-neutral-500">
                    Instant email &amp; SMS confirmation. Free cancellation up to 2 hours before.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
