import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ManageBookingClient } from '@/components/ManageBookingClient';
import { formatDate, formatTime, formatPHP } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Manage My Booking',
  description: 'View, cancel, or reschedule your appointment.',
  robots: { index: false, follow: false },
};

async function getBooking(token: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('bookings')
    .select('*, service:services(*)')
    .eq('booking_token', token)
    .single();
  return data;
}

export default async function ManageBookingPage({
  params,
}: {
  params: { token: string };
}) {
  const booking = await getBooking(params.token);

  if (!booking) {
    notFound();
  }

  const isExpired =
    booking.status === 'cancelled' ||
    booking.status === 'completed' ||
    booking.status === 'no_show' ||
    new Date(booking.booking_date + 'T23:59:59') < new Date();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-neutral-900">
        Manage Your Booking
      </h1>
      <p className="mt-2 text-neutral-600">
        View your appointment details below. You can cancel or reschedule using the buttons at the bottom.
      </p>

      <div className="mt-8 card p-6">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          Appointment details
        </h2>
        <dl className="mt-4 space-y-3">
          <div className="flex justify-between border-b border-neutral-100 pb-3">
            <dt className="text-sm text-neutral-500">Service</dt>
            <dd className="text-sm font-medium text-neutral-900">
              {booking.service?.name}
            </dd>
          </div>
          <div className="flex justify-between border-b border-neutral-100 pb-3">
            <dt className="text-sm text-neutral-500">Date</dt>
            <dd className="text-sm font-medium text-neutral-900">
              {formatDate(booking.booking_date)}
            </dd>
          </div>
          <div className="flex justify-between border-b border-neutral-100 pb-3">
            <dt className="text-sm text-neutral-500">Time</dt>
            <dd className="text-sm font-medium text-neutral-900">
              {formatTime(booking.booking_time)}
            </dd>
          </div>
          <div className="flex justify-between border-b border-neutral-100 pb-3">
            <dt className="text-sm text-neutral-500">Duration</dt>
            <dd className="text-sm font-medium text-neutral-900">
              {booking.service?.duration_minutes} minutes
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-neutral-500">Price</dt>
            <dd className="text-sm font-medium text-brand-700">
              {booking.service ? formatPHP(booking.service.price_php) : '—'}
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
            booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
            booking.status === 'no_show' ? 'bg-orange-100 text-orange-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {booking.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {isExpired ? (
        <div className="mt-6 rounded-lg bg-neutral-50 border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600">
            This appointment has already passed or been {booking.status}. No further changes can be made.
          </p>
        </div>
      ) : (
        <ManageBookingClient
          token={params.token}
          bookingDate={booking.booking_date}
          bookingTime={booking.booking_time}
          serviceName={booking.service?.name || ''}
        />
      )}

      <div className="mt-6 rounded-lg bg-neutral-50 border border-neutral-200 p-4">
        <p className="text-xs text-neutral-500">
          Cancellation policy: You can cancel or reschedule up to 2 hours before your appointment time.
          Late cancellations may be subject to a fee at the clinic&apos;s discretion.
        </p>
      </div>
    </div>
  );
}
