import Link from 'next/link';
import { CheckCircle2, Mail, Phone, Calendar, Clock, Scissors, Tag, CalendarPlus, ArrowRight, ExternalLink } from 'lucide-react';
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

function buildGoogleCalendarLink(booking: {
  booking_date: string;
  booking_time: string;
  service?: { name: string; duration_minutes: number };
}): string {
  const start = new Date(`${booking.booking_date}T${booking.booking_time}`);
  const end = new Date(start.getTime() + (booking.service?.duration_minutes || 30) * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const text = encodeURIComponent(`Jenca Aesthetics — ${booking.service?.name || 'Appointment'}`);
  const details = encodeURIComponent('Booked via Jenca Aesthetics online booking system.');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${fmt(start)}/${fmt(end)}&details=${details}`;
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

  const bookingRef = booking.booking_token.substring(0, 8).toUpperCase();
  const calendarLink = buildGoogleCalendarLink(booking);

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
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2">
          <span className="text-xs text-neutral-500">Booking reference</span>
          <span className="font-mono text-sm font-bold text-neutral-900">{bookingRef}</span>
        </div>
      </div>

      <div className="mt-8 card p-6">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          Appointment details
        </h2>
        <dl className="mt-4 space-y-3">
          <div className="flex justify-between border-b border-neutral-100 pb-3">
            <dt className="text-sm text-neutral-500 flex items-center gap-1.5">
              <Scissors className="h-4 w-4" /> Service
            </dt>
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
            <dt className="text-sm text-neutral-500 flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Time
            </dt>
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
            <dt className="text-sm text-neutral-500 flex items-center gap-1.5">
              <Tag className="h-4 w-4" /> Price
            </dt>
            <dd className="text-sm font-medium text-brand-700">
              {booking.service ? formatPHP(booking.service.price_php) : '—'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Action buttons */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href={calendarLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <CalendarPlus className="h-4 w-4" />
          Add to Calendar
        </a>
        <Link
          href={`/manage/${booking.booking_token}`}
          className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Manage booking
        </Link>
      </div>

      <Link
        href="/book"
        className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
      >
        Book another appointment
        <ArrowRight className="h-4 w-4" />
      </Link>

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
