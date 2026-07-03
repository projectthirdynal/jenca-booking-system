'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Download, X, ChevronLeft, ChevronRight, Phone, Mail, Calendar, Clock, Scissors, Tag, Loader2, CheckCircle2, XCircle, UserX } from 'lucide-react';
import { formatDate, formatTime, formatPHP, cn } from '@/lib/utils';
import { Customer } from '@/types';

interface CustomersManagerProps {
  initialCustomers: Customer[];
}

const ITEMS_PER_PAGE = 15;

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  no_show: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

export function CustomersManager({ initialCustomers }: CustomersManagerProps) {
  const [customers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }, [customers, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Notes', 'Created'];
    const rows = filtered.map((c) => [
      c.name, c.phone, c.email, c.notes || '', c.created_at.split('T')[0],
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          All customers ({filtered.length})
        </h2>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 w-full sm:w-64"
            />
          </div>

          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="btn-secondary flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          {search && (
            <button
              onClick={() => setSearch('')}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Since</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {paginated.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-neutral-50 cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {customer.name[0]?.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-neutral-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{customer.phone}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{customer.email}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{formatDate(customer.created_at.split('T')[0])}</td>
                    <td className="px-4 py-3 text-sm text-brand-600">
                      View →
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3">
              <p className="text-sm text-neutral-500">
                Page {currentPage} of {totalPages} · {filtered.length} customers
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
            {customers.length === 0 ? 'No customers yet.' : 'No customers match your search.'}
          </p>
        </div>
      )}

      {selectedCustomer && (
        <CustomerDrawer
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

interface CustomerBooking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  service?: { name: string; price_php: number; duration_minutes?: number };
  staff?: { name: string; role: string } | null;
}

function CustomerDrawer({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(customer.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`/api/customers/${customer.id}`);
        if (response.ok) {
          const data = await response.json();
          setBookings(data.bookings || []);
        }
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [customer.id]);

  const handleSaveNotes = async () => {
    if (notes === customer.notes) return;
    setSavingNotes(true);
    try {
      await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const noShowCount = bookings.filter((b) => b.status === 'no_show').length;
  const lastBooking = bookings[0];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-neutral-900">Customer details</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Contact info */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-400">Contact</h4>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {customer.name[0]?.toUpperCase()}
                </div>
                <span className="text-base font-medium text-neutral-900">{customer.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Phone className="h-4 w-4 text-neutral-400" />
                {customer.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Mail className="h-4 w-4 text-neutral-400" />
                {customer.email}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-neutral-50 p-3 text-center">
              <p className="text-xl font-bold text-neutral-900">{bookings.length}</p>
              <p className="text-xs text-neutral-500">Total</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <p className="text-xl font-bold text-green-700">{completedCount}</p>
              <p className="text-xs text-green-600">Completed</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3 text-center">
              <p className="text-xl font-bold text-orange-700">{noShowCount}</p>
              <p className="text-xs text-orange-600">No-show</p>
            </div>
          </div>

          {lastBooking && (
            <div className="rounded-lg border border-neutral-200 p-3">
              <p className="text-xs text-neutral-500">Last visit</p>
              <p className="mt-1 text-sm font-medium text-neutral-900">
                {formatDate(lastBooking.booking_date)} at {formatTime(lastBooking.booking_time)}
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-400">Notes</h4>
            <textarea
              className="input-field mt-2"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="Add notes about this customer..."
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-neutral-400">Auto-saves on blur</span>
              {savingNotes && (
                <span className="flex items-center gap-1 text-xs text-brand-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              )}
            </div>
          </div>

          {/* Booking history */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Booking history ({bookings.length})
            </h4>
            {loadingBookings ? (
              <div className="mt-3 flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
              </div>
            ) : bookings.length > 0 ? (
              <div className="mt-3 space-y-2">
                {bookings.map((b) => (
                  <div key={b.id} className="rounded-lg border border-neutral-200 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-900">{b.service?.name || 'Unknown'}</span>
                      </div>
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        STATUS_BADGE[b.status] || 'bg-yellow-100 text-yellow-700'
                      )}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(b.booking_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(b.booking_time)}
                      </span>
                      {b.service && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {formatPHP(b.service.price_php)}
                        </span>
                      )}
                      {b.staff && (
                        <span>· {b.staff.name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-neutral-400">No bookings yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
