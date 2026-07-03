'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Download, X, ChevronLeft, ChevronRight, Phone, Mail, Calendar, Clock, Scissors, Tag } from 'lucide-react';
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
  booking_token?: string;
  created_at?: string;
  service?: { name: string; price_php: number; duration_minutes?: number };
  notifications?: { status: string; type: string; channel: string }[];
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

const ITEMS_PER_PAGE = 15;

export function BookingsManager({ bookings: initialBookings }: BookingsManagerProps) {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking((prev) => prev ? { ...prev, status: newStatus } : prev);
    }
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const exportCSV = () => {
    const headers = ['Client', 'Phone', 'Email', 'Service', 'Date', 'Time', 'Price', 'Status'];
    const rows = filtered.map((b) => [
      b.client_name, b.client_phone, b.client_email,
      b.service?.name || '', b.booking_date, b.booking_time,
      b.service ? String(b.service.price_php) : '', b.status,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <BookingsCalendar bookings={bookings} />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          All bookings ({filtered.length})
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-9 appearance-none pr-8 w-full sm:w-40"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field w-full sm:w-40"
          />

          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="btn-secondary flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          {(search || statusFilter !== 'all' || dateFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); setDateFilter(''); }}
              className="text-sm text-brand-600 hover:text-brand-700 whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {paginated.length > 0 ? (
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
                {paginated.map((booking) => {
                  const hasFailedNotif = booking.notifications?.some((n) => n.status === 'failed');
                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-neutral-50 cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
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
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">Failed</span>
                        ) : (
                          <span className="text-xs text-neutral-400">OK</span>
                        )}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3">
              <p className="text-sm text-neutral-500">
                Page {currentPage} of {totalPages} · {filtered.length} bookings
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 card p-8 text-center">
          <p className="text-sm text-neutral-500">
            {bookings.length === 0 ? 'No bookings yet.' : 'No bookings match your filters.'}
          </p>
        </div>
      )}

      {selectedBooking && (
        <BookingDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

function BookingDrawer({
  booking,
  onClose,
  onStatusChange,
}: {
  booking: Booking;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-neutral-900">Booking details</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center gap-3">
            <span className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
              STATUS_BADGE[booking.status] || 'bg-yellow-100 text-yellow-700'
            )}>
              {booking.status.replace('_', ' ')}
            </span>
            <BookingActions
              bookingId={booking.id}
              currentStatus={booking.status}
              onStatusChange={onStatusChange}
            />
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-400">Client</h4>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {booking.client_name[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-neutral-900">{booking.client_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Phone className="h-4 w-4 text-neutral-400" />
                {booking.client_phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Mail className="h-4 w-4 text-neutral-400" />
                {booking.client_email}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-400">Appointment</h4>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Scissors className="h-4 w-4 text-neutral-400" />
                {booking.service?.name || 'Unknown service'}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Calendar className="h-4 w-4 text-neutral-400" />
                {formatDate(booking.booking_date)}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Clock className="h-4 w-4 text-neutral-400" />
                {formatTime(booking.booking_time)}
                {booking.service?.duration_minutes && (
                  <span className="text-neutral-400">({booking.service.duration_minutes} min)</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Tag className="h-4 w-4 text-neutral-400" />
                {booking.service ? formatPHP(booking.service.price_php) : '—'}
              </div>
            </div>
          </div>

          {booking.notifications && booking.notifications.length > 0 && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-400">Notifications</h4>
              <div className="mt-2 space-y-2">
                {booking.notifications.map((n, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2">
                    <span className="text-sm text-neutral-600 capitalize">{n.type} · {n.channel}</span>
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      n.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    )}>
                      {n.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {booking.created_at && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-400">Created</h4>
              <p className="mt-2 text-sm text-neutral-600">
                {new Date(booking.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          )}

          {booking.booking_token && (
            <a
              href={`/manage/${booking.booking_token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-neutral-200 p-3 text-center text-sm text-brand-600 hover:bg-brand-50"
            >
              View client manage page →
            </a>
          )}
        </div>
      </div>
    </>
  );
}
