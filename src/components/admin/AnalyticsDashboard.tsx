'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, UserPlus, UserCheck, Clock, Scissors, BarChart3, Loader2 } from 'lucide-react';
import { formatPHP, cn } from '@/lib/utils';

interface AnalyticsData {
  range: string;
  daily: { date: string; label: string; count: number; revenue: number }[];
  statusBreakdown: { confirmed: number; completed: number; cancelled: number; no_show: number };
  peakHours: { hour: string; count: number }[];
  topServices: { id: string; name: string; count: number }[];
  customerInsights: { new: number; returning: number; totalUnique: number };
  summary: { totalBookings: number; totalRevenue: number; noShowRate: number; avgPerDay: number };
}

const RANGE_OPTIONS = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

export function AnalyticsDashboard() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics?range=${range}`);
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  if (loading || !data) {
    return (
      <div className="mt-8 flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  const maxCount = Math.max(...data.daily.map((d) => d.count), 1);
  const maxRevenue = Math.max(...data.daily.map((d) => d.revenue), 1);
  const maxHourCount = Math.max(...data.peakHours.map((h) => h.count), 1);
  const maxServiceCount = Math.max(...data.topServices.map((s) => s.count), 1);

  return (
    <div className="mt-8">
      {/* Range selector */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-neutral-900">Analytics</h2>
        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                range === opt.value
                  ? 'bg-brand-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
              <BarChart3 className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{data.summary.totalBookings}</p>
              <p className="text-sm text-neutral-500">Bookings ({data.range})</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{formatPHP(data.summary.totalRevenue)}</p>
              <p className="text-sm text-neutral-500">Revenue</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{data.summary.avgPerDay}</p>
              <p className="text-sm text-neutral-500">Avg / day</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <TrendingDown className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{data.summary.noShowRate}%</p>
              <p className="text-sm text-neutral-500">No-show rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 1: Booking trends + Revenue */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Booking trends */}
        <div className="card p-6">
          <h3 className="font-display text-sm font-semibold text-neutral-900">Booking trends</h3>
          <div className="mt-6 flex items-end justify-between gap-1 h-40">
            {data.daily.map((day) => {
              const heightPct = (day.count / maxCount) * 100;
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-brand-500 transition-all hover:bg-brand-600 relative group"
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.count} bookings
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 truncate w-full text-center">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue trends */}
        <div className="card p-6">
          <h3 className="font-display text-sm font-semibold text-neutral-900">Revenue trends</h3>
          <div className="mt-6 flex items-end justify-between gap-1 h-40">
            {data.daily.map((day) => {
              const heightPct = (day.revenue / maxRevenue) * 100;
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-green-500 transition-all hover:bg-green-600 relative group"
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatPHP(day.revenue)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 truncate w-full text-center">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts row 2: Peak hours + Top services */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Peak hours */}
        <div className="card p-6">
          <h3 className="font-display text-sm font-semibold text-neutral-900">Peak hours</h3>
          <p className="mt-1 text-xs text-neutral-500">Booking distribution by hour of day</p>
          <div className="mt-6 flex items-end justify-between gap-1 h-40">
            {data.peakHours.map((h) => {
              const heightPct = (h.count / maxHourCount) * 100;
              return (
                <div key={h.hour} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-blue-500 transition-all hover:bg-blue-600 relative group"
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {h.count} bookings
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400">{h.hour.split(':')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top services */}
        <div className="card p-6">
          <h3 className="font-display text-sm font-semibold text-neutral-900">Top services</h3>
          <p className="mt-1 text-xs text-neutral-500">Most booked in selected period</p>
          {data.topServices.length > 0 ? (
            <div className="mt-6 space-y-3">
              {data.topServices.map((service, i) => (
                <div key={service.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-neutral-700">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                        {i + 1}
                      </span>
                      <Scissors className="h-3 w-3 text-neutral-400" />
                      {service.name}
                    </span>
                    <span className="font-medium text-neutral-900">{service.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${(service.count / maxServiceCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 flex items-center justify-center py-8">
              <p className="text-sm text-neutral-400">No bookings in this period.</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer insights */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{data.customerInsights.totalUnique}</p>
              <p className="text-sm text-neutral-500">Total customers</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <UserPlus className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{data.customerInsights.new}</p>
              <p className="text-sm text-neutral-500">New customers</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
              <UserCheck className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{data.customerInsights.returning}</p>
              <p className="text-sm text-neutral-500">Returning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
