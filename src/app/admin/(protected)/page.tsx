import { Calendar, Scissors, Clock, AlertCircle, TrendingUp, CalendarDays, CheckCircle2, XCircle, UserX } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatTime, formatPHP } from '@/lib/utils';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';

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
    { count: confirmedCount },
    { count: completedCount },
    { count: cancelledCount },
    { count: noShowCount },
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
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'no_show'),
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
    statusBreakdown: {
      confirmed: confirmedCount || 0,
      completed: completedCount || 0,
      cancelled: cancelledCount || 0,
      no_show: noShowCount || 0,
    },
  };
}

async function getRevenueChart() {
  const supabase = createClient();
  const days: { date: string; label: string; revenue: number; count: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-PH', { weekday: 'short' });

    const { data } = await supabase
      .from('bookings')
      .select('*, service:services(price_php)')
      .eq('booking_date', dateStr)
      .neq('status', 'cancelled');

    const revenue = (data || []).reduce((sum, b) => sum + (b.service?.price_php || 0), 0);
    days.push({ date: dateStr, label, revenue, count: data?.length || 0 });
  }

  return days;
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

async function getRecentActivity() {
  const supabase = createClient();
  const { data } = await supabase
    .from('bookings')
    .select('*, service:services(name)')
    .order('created_at', { ascending: false })
    .limit(8);

  return data || [];
}

export default async function AdminDashboardPage() {
  const [stats, upcomingBookings, revenueChart, recentActivity] = await Promise.all([
    getStats(),
    getUpcomingBookings(),
    getRevenueChart(),
    getRecentActivity(),
  ]);

  const maxRevenue = Math.max(...revenueChart.map((d) => d.revenue), 1);
  const totalAllBookings = stats.statusBreakdown.confirmed + stats.statusBreakdown.completed + stats.statusBreakdown.cancelled + stats.statusBreakdown.no_show;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Overview of your clinic&apos;s bookings and activity.</p>

      {/* Stat cards */}
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

      {/* Revenue chart + Status breakdown */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-neutral-900">Revenue (last 7 days)</h2>
          <div className="mt-6 flex items-end justify-between gap-2 h-48">
            {revenueChart.map((day) => {
              const heightPct = (day.revenue / maxRevenue) * 100;
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-lg bg-brand-500 transition-all hover:bg-brand-600 relative group"
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatPHP(day.revenue)} · {day.count} booking{day.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-500">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-neutral-900">All-time status</h2>
          <div className="mt-4 space-y-4">
            <StatusBar
              icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
              label="Confirmed"
              count={stats.statusBreakdown.confirmed}
              total={totalAllBookings}
              color="bg-green-500"
            />
            <StatusBar
              icon={<CheckCircle2 className="h-4 w-4 text-blue-600" />}
              label="Completed"
              count={stats.statusBreakdown.completed}
              total={totalAllBookings}
              color="bg-blue-500"
            />
            <StatusBar
              icon={<XCircle className="h-4 w-4 text-red-600" />}
              label="Cancelled"
              count={stats.statusBreakdown.cancelled}
              total={totalAllBookings}
              color="bg-red-500"
            />
            <StatusBar
              icon={<UserX className="h-4 w-4 text-orange-600" />}
              label="No-show"
              count={stats.statusBreakdown.no_show}
              total={totalAllBookings}
              color="bg-orange-500"
            />
          </div>
          <div className="mt-4 border-t border-neutral-100 pt-3">
            <p className="text-sm text-neutral-500">Total bookings: <span className="font-semibold text-neutral-900">{totalAllBookings}</span></p>
          </div>
        </div>
      </div>

      {/* Upcoming bookings + Recent activity */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming bookings */}
        <div>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {upcomingBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm text-neutral-900">{booking.client_name}</td>
                      <td className="px-4 py-3 text-sm text-neutral-600">{booking.service?.name}</td>
                      <td className="px-4 py-3 text-sm text-neutral-600">{formatDate(booking.booking_date)}</td>
                      <td className="px-4 py-3 text-sm text-neutral-600">{formatTime(booking.booking_time)}</td>
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

        {/* Recent activity */}
        <div>
          <h2 className="font-display text-lg font-semibold text-neutral-900">Recent activity</h2>
          <div className="mt-4 card divide-y divide-neutral-100">
            {recentActivity.length > 0 ? (
              recentActivity.map((booking) => (
                <div key={booking.id} className="flex items-center gap-3 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                    {booking.client_name[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {booking.client_name}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {booking.service?.name} · {formatDate(booking.booking_date)} at {formatTime(booking.booking_time)}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    booking.status === 'no_show' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-neutral-500">No recent activity.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Analytics */}
      <AnalyticsDashboard />
    </div>
  );
}

function StatusBar({ icon, label, count, total, color }: {
  icon: React.ReactNode;
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-neutral-700">
          {icon}
          {label}
        </span>
        <span className="font-medium text-neutral-900">{count}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
