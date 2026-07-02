'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { BookingsCalendar } from '@/components/admin/BookingsCalendar';
import { BookingActions } from '@/components/admin/BookingActions';
import { formatDate, formatTime, formatPHP, cn } from '@/lib/utils';

interface Booking {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  booking_date: string;
  booking_time: string;
  status: string;
  service?: { name: string; price_php: number };
  notifications?: { status: string }[];
}

interface BookingsManagerProps {
  bookings: Booking[];
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No-show' },
  { value: 'pending', label: 'Pending' },
];

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  no_show: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

export function BookingsManager({ bookings: initialBookings }: BookingsManagerProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (dateFilter && b.booking_date !== dateFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          b.client_name.toLowerCase().includes(q) ||
          b.client_phone.includes(q) ||
          b.client_email.toLowerCase().includes(q) ||
          b.service?.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bookings, statusFilter, dateFilter, search]);

  return (
    <div>
      <BookingsCalendar bookings={bookings} />

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          All bookings ({filtered.length})
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search name, phone, service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 w-full sm:w-56"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-9 appearance-none pr-8 w-full sm:w-40"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field w-full sm:w-40"
          />

          {(search || statusFilter !== 'all' || dateFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setDateFilter('');
              }}
              className="text-sm text-brand-600 hover:text-brand-700 whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="mt-4 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Notif</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((booking) => {
                  const hasFailedNotif = booking.notifications?.some((n) => n.status === 'failed');
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
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          STATUS_BADGE[booking.status] || 'bg-yellow-100 text-yellow-700'
                        )}>
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
                      <td className="px-4 py-3">
                        <BookingActions
                          bookingId={booking.id}
                          currentStatus={booking.status}
                          onStatusChange={handleStatusChange}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-4 card p-8 text-center">
          <p className="text-sm text-neutral-500">
            {bookings.length === 0 ? 'No bookings yet.' : 'No bookings match your filters.'}
          </p>
        </div>
      )}
    </div>
  );
}
