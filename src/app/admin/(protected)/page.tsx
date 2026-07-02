import { Calendar, Scissors, Clock, AlertCircle, TrendingUp, CalendarDays } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatTime, formatPHP } from '@/lib/utils';

async function getStats() {
  const supabase = createClient();

  const today = new Date().toISOString().split('T')[0];
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const weekFromNowStr = weekFromNow.toISOString().split('T')[0];

  const [
    { count: todayBookings },
    { count: totalServices },
    { count: failedNotifications },
    { data: weekBookings },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_date', today).neq('status', 'cancelled'),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
    supabase
      .from('bookings')
      .select('*, service:services(price_php)')
      .gte('booking_date', today)
      .lte('booking_date', weekFromNowStr)
      .neq('status', 'cancelled'),
  ]);

  const weeklyRevenue = (weekBookings || []).reduce(
    (sum, b) => sum + (b.service?.price_php || 0),
    0
  );

  return {
    todayBookings: todayBookings || 0,
    totalServices: totalServices || 0,
    failedNotifications: failedNotifications || 0,
    upcomingWeekCount: weekBookings?.length || 0,
    weeklyRevenue,
  };
}

async function getUpcomingBookings() {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('bookings')
    .select('*, service:services(*)')
    .gte('booking_date', today)
    .neq('status', 'cancelled')
    .order('booking_date', { ascending: true })
    .order('booking_time', { ascending: true })
    .limit(5);

  return data || [];
}

export default async function AdminDashboardPage() {
  const [stats, upcomingBookings] = await Promise.all([getStats(), getUpcomingBookings()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Overview of your clinic&apos;s bookings and activity.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
              <Calendar className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.todayBookings}</p>
              <p className="text-sm text-neutral-500">Today&apos;s bookings</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.upcomingWeekCount}</p>
              <p className="text-sm text-neutral-500">This week</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{formatPHP(stats.weeklyRevenue)}</p>
              <p className="text-sm text-neutral-500">Week revenue</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Scissors className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalServices}</p>
              <p className="text-sm text-neutral-500">Active services</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.failedNotifications}</p>
              <p className="text-sm text-neutral-500">Failed notifs</p>
            </div>
          </div>
        </div>
      </div>

      {stats.failedNotifications > 0 && (
        <div className="mt-4 rounded-lg bg-orange-50 border border-orange-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                {stats.failedNotifications} notification{stats.failedNotifications !== 1 ? 's' : ''} failed to send
              </p>
              <p className="mt-1 text-sm text-orange-700">
                Please review the affected bookings and follow up with clients manually.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-neutral-900">Upcoming bookings</h2>
          <a href="/admin/bookings" className="text-sm text-brand-600 hover:text-brand-700">
            View all
          </a>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="mt-4 card overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {upcomingBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm text-neutral-900">{booking.client_name}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{booking.service?.name}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{formatDate(booking.booking_date)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{formatTime(booking.booking_time)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 card p-8 text-center">
            <Clock className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-500">No upcoming bookings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
