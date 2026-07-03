import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '30d';

  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;

  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - days + 1);
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = today.toISOString().split('T')[0];

  // Daily booking counts and revenue
  const dailyData: { date: string; label: string; count: number; revenue: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });

    const { count, data: dayBookings } = await supabase
      .from('bookings')
      .select('*, service:services(price_php)', { count: 'exact' })
      .eq('booking_date', dateStr)
      .neq('status', 'cancelled');

    const revenue = (dayBookings || []).reduce(
      (sum, b) => sum + (b.service?.price_php || 0),
      0
    );

    dailyData.push({ date: dateStr, label, count: count || 0, revenue });
  }

  // Status breakdown (all-time)
  const [
    { count: confirmedCount },
    { count: completedCount },
    { count: cancelledCount },
    { count: noShowCount },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'no_show'),
  ]);

  // Peak hours distribution
  const { data: rangeBookings } = await supabase
    .from('bookings')
    .select('booking_time')
    .gte('booking_date', startDateStr)
    .lte('booking_date', endDateStr)
    .neq('status', 'cancelled');

  const hourBuckets: { hour: string; count: number }[] = [];
  for (let h = 8; h <= 18; h++) {
    const hourLabel = `${String(h).padStart(2, '0')}:00`;
    const count = (rangeBookings || []).filter((b) => {
      const hour = parseInt(b.booking_time.split(':')[0], 10);
      return hour === h;
    }).length;
    hourBuckets.push({ hour: hourLabel, count });
  }

  // Service popularity (top 5 by booking count in range)
  const { data: serviceBookings } = await supabase
    .from('bookings')
    .select('service:services(id, name)')
    .gte('booking_date', startDateStr)
    .lte('booking_date', endDateStr)
    .neq('status', 'cancelled');

  const serviceCounts: Record<string, { name: string; count: number }> = {};
  (serviceBookings || []).forEach((b) => {
    const svc = b.service as unknown as { id: string; name: string } | null;
    if (svc) {
      const key = svc.id;
      if (!serviceCounts[key]) {
        serviceCounts[key] = { name: svc.name, count: 0 };
      }
      serviceCounts[key].count++;
    }
  });

  const topServices = Object.entries(serviceCounts)
    .map(([id, { name, count }]) => ({ id, name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // New vs returning customers in range
  const { data: rangeCustomerBookings } = await supabase
    .from('bookings')
    .select('client_email')
    .gte('booking_date', startDateStr)
    .lte('booking_date', endDateStr)
    .neq('status', 'cancelled');

  const emailSet = new Set<string>();
  let newCustomers = 0;
  let returningCustomers = 0;

  for (const b of rangeCustomerBookings || []) {
    const email = b.client_email;
    if (emailSet.has(email)) {
      returningCustomers++;
    } else {
      emailSet.add(email);
      newCustomers++;
    }
  }

  // Total unique customers
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  // Total bookings in range
  const totalInRange = dailyData.reduce((sum, d) => sum + d.count, 0);
  const totalRevenueInRange = dailyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalStatusCount = (confirmedCount || 0) + (completedCount || 0) + (noShowCount || 0);
  const noShowInRange = totalStatusCount > 0
    ? Math.round(((noShowCount || 0) / totalStatusCount) * 100)
    : 0;

  return NextResponse.json({
    range,
    daily: dailyData,
    statusBreakdown: {
      confirmed: confirmedCount || 0,
      completed: completedCount || 0,
      cancelled: cancelledCount || 0,
      no_show: noShowCount || 0,
    },
    peakHours: hourBuckets,
    topServices,
    customerInsights: {
      new: newCustomers,
      returning: returningCustomers,
      totalUnique: totalCustomers || 0,
    },
    summary: {
      totalBookings: totalInRange,
      totalRevenue: totalRevenueInRange,
      noShowRate: noShowInRange,
      avgPerDay: Math.round((totalInRange / days) * 10) / 10,
    },
  });
}
