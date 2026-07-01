'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface ManageBookingClientProps {
  token: string;
  bookingDate: string;
  bookingTime: string;
  serviceName: string;
}

export function ManageBookingClient({
  token,
  bookingDate,
  bookingTime,
  serviceName,
}: ManageBookingClientProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    setIsCancelling(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/token/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error?.message || 'Failed to cancel booking.');
        setIsCancelling(false);
        return;
      }

      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setIsCancelling(false);
    }
  };

  const handleReschedule = async () => {
    setIsRescheduling(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/token/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reschedule' }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error?.message || 'Failed to reschedule booking.');
        setIsRescheduling(false);
        return;
      }

      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setIsRescheduling(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="danger"
          onClick={handleCancel}
          disabled={isCancelling || isRescheduling}
          className="flex-1"
        >
          {isCancelling ? 'Cancelling...' : 'Cancel appointment'}
        </Button>
        <Button
          variant="secondary"
          onClick={handleReschedule}
          disabled={isCancelling || isRescheduling}
          className="flex-1"
        >
          {isRescheduling ? 'Processing...' : 'Reschedule'}
        </Button>
      </div>
    </div>
  );
}
