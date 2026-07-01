import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { BookingsCalendar } from '@/components/admin/BookingsCalendar';
import { formatDate, formatTime, formatPHP } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Bookings Management',
};

async function getBookings() {
  const supabase = createClient();
  const { data } = await supabase
    .from('bookings')
    .select('*, service:services(*), notifications(*)')
    .order('booking_date', { ascending: false })
    .order('booking_time', { ascending: false });
  return data || [];
}

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-neutral-900">Bookings</h1>
      <p className="mt-1 text-sm text-neutral-500">
        View and manage all client appointments.
      </p>

      <BookingsCalendar bookings={bookings} />

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-neutral-900">All bookings</h2>

        {bookings.length > 0 ? (
          <div className="mt-4 card overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Notifications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {bookings.map((booking) => {
                  const hasFailedNotif = booking.notifications?.some((n: { status: string }) => n.status === 'failed');
                  return (
                    <tr key={booking.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-neutral-900">{booking.client_name}</div>
                        <div className="text-xs text-neutral-500">{booking.client_phone}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">{booking.service?.name}</td>
                      <td className="px-4 py-3 text-sm text-neutral-600">{formatDate(booking.booking_date)}</td>
                      <td className="px-4 py-3 text-sm text-neutral-600">{formatTime(booking.booking_time)}</td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {booking.service ? formatPHP(booking.service.price_php) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'no_show' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {hasFailedNotif ? (
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                            Failed
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 card p-8 text-center">
            <p className="text-sm text-neutral-500">No bookings yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
