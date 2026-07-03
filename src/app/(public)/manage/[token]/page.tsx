import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarPlus, Mail, Phone, Clock, Scissors, Tag } from 'lucide-react';
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
    .select('*, service:services(*), notifications(*)')
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

  const bookingRef = booking.booking_token.substring(0, 8).toUpperCase();
  const calendarLink = buildGoogleCalendarLink(booking);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-neutral-900">
          Manage Your Booking
        </h1>
        <span className="font-mono text-sm font-bold text-neutral-400">{bookingRef}</span>
      </div>
      <p className="mt-2 text-neutral-600">
        View your appointment details below. You can cancel or reschedule using the buttons at the bottom.
      </p>

      <div className="mt-8 card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-neutral-900">
            Appointment details
          </h2>
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
              <CalendarPlus className="h-4 w-4" /> Date
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

        {!isExpired && (
          <div className="mt-4">
            <a
              href={calendarLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <CalendarPlus className="h-4 w-4" />
              Add to Calendar
            </a>
          </div>
        )}
      </div>

      {/* Notification history */}
      {booking.notifications && booking.notifications.length > 0 && (
        <div className="mt-6 card p-6">
          <h3 className="font-display text-sm font-semibold text-neutral-900">
            Notification history
          </h3>
          <div className="mt-3 space-y-2">
            {booking.notifications.map((n: { id: string; type: string; channel: string; status: string }) => (
              <div key={n.id} className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2">
                <div className="flex items-center gap-2">
                  {n.channel === 'email' ? (
                    <Mail className="h-4 w-4 text-neutral-400" />
                  ) : (
                    <Phone className="h-4 w-4 text-neutral-400" />
                  )}
                  <span className="text-sm text-neutral-600 capitalize">
                    {n.type} · {n.channel}
                  </span>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  n.status === 'sent' || n.status === 'delivered'
                    ? 'bg-green-100 text-green-700'
                    : n.status === 'failed'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {n.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
          serviceId={booking.service?.id || ''}
        />
      )}

      <div className="mt-6 rounded-lg bg-neutral-50 border border-neutral-200 p-4">
        <p className="text-xs text-neutral-500">
          Cancellation policy: You can cancel or reschedule up to 2 hours before your appointment time.
          Late cancellations may be subject to a fee at the clinic&apos;s discretion.
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link href="/book" className="text-sm text-brand-600 hover:text-brand-700">
          Book another appointment →
        </Link>
      </div>
    </div>
  );
}
