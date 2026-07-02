import { CheckCircle2, Mail, Phone, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatTime, formatPHP } from '@/lib/utils';

async function getBooking(token: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('bookings')
    .select('*, service:services(*)')
    .eq('booking_token', token)
    .single();
  return data;
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  if (!searchParams.token) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-neutral-900">
          Booking not found
        </h1>
        <p className="mt-2 text-neutral-600">
          We couldn&apos;t find your booking. Please check your confirmation link.
        </p>
      </div>
    );
  }

  const booking = await getBooking(searchParams.token);

  if (!booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-neutral-900">
          Booking not found
        </h1>
        <p className="mt-2 text-neutral-600">
          This booking may have been removed or the link is incorrect.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-neutral-900">
          Booking Confirmed!
        </h1>
        <p className="mt-2 text-neutral-600">
          We&apos;ve sent a confirmation to your email and phone.
        </p>
      </div>

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
            <dt className="text-sm text-neutral-500 flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Date
            </dt>
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
      </div>

      <div className="mt-6 rounded-lg bg-brand-50 border border-brand-100 p-4">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-brand-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-brand-800">Check your inbox</p>
            <p className="mt-1 text-sm text-brand-700">
              We&apos;ve sent a confirmation email with a link to manage your booking.
              You can cancel or reschedule anytime using that link.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-neutral-50 border border-neutral-200 p-4">
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-neutral-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-neutral-700">SMS confirmation sent</p>
            <p className="mt-1 text-sm text-neutral-500">
              A text message has been sent to {booking.client_phone}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
