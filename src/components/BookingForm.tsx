'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CreateBookingInput } from '@/types';

interface BookingFormProps {
  serviceId: string;
  selectedDate: string;
  selectedTime: string;
  serviceName: string;
  servicePrice: number;
}

export function BookingForm({
  serviceId,
  selectedDate,
  selectedTime,
  serviceName,
  servicePrice,
}: BookingFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData(e.currentTarget);
    const honeypot = formData.get('website');

    if (honeypot) {
      setIsSubmitting(false);
      return;
    }

    const data: CreateBookingInput = {
      service_id: serviceId,
      booking_date: selectedDate,
      booking_time: selectedTime,
      client_name: formData.get('client_name') as string,
      client_phone: formData.get('client_phone') as string,
      client_email: formData.get('client_email') as string,
    };

    if (!data.client_name?.trim()) {
      setErrors({ client_name: 'Please enter your name' });
      setIsSubmitting(false);
      return;
    }
    if (!data.client_phone?.trim()) {
      setErrors({ client_phone: 'Please enter your phone number' });
      setIsSubmitting(false);
      return;
    }
    if (!data.client_email?.trim() || !data.client_email.includes('@')) {
      setErrors({ client_email: 'Please enter a valid email address' });
      setIsSubmitting(false);
      return;
    }

    setErrors({});

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        if (response.status === 409) {
          setSubmitError('That time slot was just taken. Please select another time above.');
        } else {
          setSubmitError(result.error?.message || 'Failed to create booking. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      router.push(`/book/confirmation?token=${result.booking_token}`);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px]"
        aria-hidden="true"
      />

      <div className="rounded-lg bg-brand-50 border border-brand-100 p-4">
        <p className="text-sm text-brand-800">
          <strong>{serviceName}</strong> on{' '}
          <strong>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-PH', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </strong>{' '}
          at <strong>{selectedTime}</strong>
        </p>
      </div>

      <Input
        name="client_name"
        label="Full name"
        placeholder="Juan Dela Cruz"
        required
        error={errors.client_name}
        autoComplete="name"
      />

      <Input
        name="client_phone"
        label="Phone number"
        placeholder="0917 123 4567"
        type="tel"
        required
        error={errors.client_phone}
        hint="We'll send your booking confirmation via SMS"
        autoComplete="tel"
      />

      <Input
        name="client_email"
        label="Email address"
        placeholder="juan@example.com"
        type="email"
        required
        error={errors.client_email}
        hint="We'll send your booking confirmation and manage-booking link here"
        autoComplete="email"
      />

      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
        <p className="text-xs text-neutral-500">
          By confirming this booking, you agree to Jenca Aesthetics&apos; terms of service and cancellation policy.
          Your personal data is handled in compliance with the Philippine Data Privacy Act of 2012 (RA 10173).
        </p>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Confirming...' : `Confirm booking — ₱${servicePrice.toLocaleString()}`}
      </Button>
    </form>
  );
}
