'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/DatePicker';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { AlertCircle, Loader2, Calendar, Clock } from 'lucide-react';

interface ManageBookingClientProps {
  token: string;
  bookingDate: string;
  bookingTime: string;
  serviceName: string;
  serviceId: string;
}

export function ManageBookingClient({
  token,
  bookingDate,
  bookingTime,
  serviceName,
  serviceId,
}: ManageBookingClientProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reschedule state
  const [newDate, setNewDate] = useState<string | null>(null);
  const [newTime, setNewTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setSlotError(null);
    setNewTime(null);

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
  }, [serviceId]);

  useEffect(() => {
    if (newDate) {
      fetchSlots(newDate);
    } else {
      setSlots([]);
      setNewTime(null);
    }
  }, [newDate, fetchSlots]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) return;

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

      setSuccessMsg('Your booking has been cancelled. You can book a new appointment anytime.');
      setShowReschedule(false);
      setIsCancelling(false);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setIsCancelling(false);
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      setRescheduleError('Please select a new date and time.');
      return;
    }

    setIsRescheduling(true);
    setRescheduleError(null);

    try {
      const response = await fetch(`/api/bookings/token/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reschedule',
          new_date: newDate,
          new_time: newTime,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setRescheduleError(data.error?.message || 'Failed to reschedule booking.');
        setIsRescheduling(false);
        return;
      }

      setSuccessMsg('Your booking has been rescheduled successfully.');
      setShowReschedule(false);
      setIsRescheduling(false);
      router.refresh();
    } catch {
      setRescheduleError('Something went wrong. Please try again.');
      setIsRescheduling(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4">
          <Calendar className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700">{successMsg}</p>
        </div>
      )}

      {!showReschedule && !successMsg && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="danger"
            onClick={handleCancel}
            disabled={isCancelling}
            className="flex-1"
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : 'Cancel appointment'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowReschedule(true)}
            disabled={isCancelling}
            className="flex-1"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Reschedule
          </Button>
        </div>
      )}

      {showReschedule && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-neutral-900">
              Reschedule appointment
            </h3>
            <button
              onClick={() => {
                setShowReschedule(false);
                setNewDate(null);
                setNewTime(null);
                setRescheduleError(null);
              }}
              className="text-sm text-neutral-500 hover:text-neutral-700"
            >
              Cancel
            </button>
          </div>

          <p className="text-sm text-neutral-500 mb-4">
            Current: {serviceName} on{' '}
            <strong>{new Date(bookingDate + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>{' '}
            at <strong>{new Date(`2000-01-01T${bookingTime}`).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}</strong>
          </p>

          <div className="max-w-md">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
              <Calendar className="h-4 w-4 text-brand-600" />
              Select a new date
            </div>
            <DatePicker
              selectedDate={newDate}
              onChange={setNewDate}
              minDate={today}
              maxDate={maxDateStr}
            />
          </div>

          {newDate && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                <Clock className="h-4 w-4 text-brand-600" />
                Select a new time
              </div>
              {slotError ? (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-700">{slotError}</p>
                </div>
              ) : (
                <TimeSlotPicker
                  slots={slots}
                  selectedTime={newTime}
                  onChange={setNewTime}
                  loading={loadingSlots}
                />
              )}
            </div>
          )}

          {rescheduleError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{rescheduleError}</p>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <Button
              onClick={handleReschedule}
              disabled={isRescheduling || !newDate || !newTime}
            >
              {isRescheduling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rescheduling...
                </>
              ) : 'Confirm reschedule'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowReschedule(false);
                setNewDate(null);
                setNewTime(null);
                setRescheduleError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
