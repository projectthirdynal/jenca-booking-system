'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, Mail, Phone, Loader2, AlertCircle, Calendar,
  Clock, ExternalLink, Send, ArrowRight, CalendarCheck,
} from 'lucide-react';
import { formatDate, formatTime, cn } from '@/lib/utils';

interface BookingResult {
  booking_token: string;
  booking_date: string;
  booking_time: string;
  status: string;
  created_at: string;
  service: { name: string } | { name: string }[] | null;
}

function getServiceName(service: BookingResult['service']): string {
  if (!service) return '';
  if (Array.isArray(service)) return service[0]?.name || '';
  return service.name;
}

export function FindBookingClient() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [results, setResults] = useState<BookingResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recoverMsg, setRecoverMsg] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError(null);
    setResults(null);
    setRecoverMsg(null);

    const value = query.trim();
    const isEmail = value.includes('@');
    const params = isEmail
      ? `email=${encodeURIComponent(value.toLowerCase())}`
      : `phone=${encodeURIComponent(value)}`;

    try {
      const res = await fetch(`/api/bookings/lookup?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Failed to search bookings.');
        setSearching(false);
        return;
      }

      setResults(data.data || []);
      setSearching(false);
    } catch {
      setError('Network error. Please try again.');
      setSearching(false);
    }
  };

  const handleRecover = async () => {
    if (!query.trim()) return;

    setRecovering(true);
    setRecoverMsg(null);
    setError(null);

    const value = query.trim();
    const isEmail = value.includes('@');
    const body = isEmail
      ? { email: value.toLowerCase() }
      : { phone: value };

    try {
      const res = await fetch('/api/bookings/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Failed to send recovery email.');
        setRecovering(false);
        return;
      }

      setRecoverMsg(
        'If we found any bookings for your contact info, we\'ve sent them to your email.'
      );
      setRecovering(false);
    } catch {
      setError('Network error. Please try again.');
      setRecovering(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Search form */}
      <form onSubmit={handleSearch} className="card p-6">
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Email or phone number
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="juan@example.com or 09171234567"
            className="input-field pl-9"
            autoComplete="off"
          />
        </div>
        <p className="mt-1.5 text-xs text-neutral-400">
          Enter the email or phone you used when booking.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors',
              searching || !query.trim()
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-brand-600 text-white hover:bg-brand-700'
            )}
          >
            {searching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Find my bookings
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleRecover}
            disabled={recovering || !query.trim()}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium transition-colors',
              recovering || !query.trim()
                ? 'text-neutral-300 cursor-not-allowed'
                : 'text-neutral-700 hover:bg-neutral-50'
            )}
          >
            {recovering ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Email me my bookings
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Recovery message */}
      {recoverMsg && (
        <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 p-4">
          <Mail className="h-4 w-4 text-green-600 mt-0.5" />
          <p className="text-sm text-green-700">{recoverMsg}</p>
        </div>
      )}

      {/* Results */}
      {results !== null && (
        <div>
          {results.length === 0 ? (
            <div className="card p-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-neutral-300" />
              <p className="mt-2 text-sm text-neutral-500">
                No bookings found. Check your email or phone number, or{' '}
                <Link href="/book" className="text-brand-600 hover:text-brand-700">
                  book a new appointment
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm text-neutral-600">
                Found <strong>{results.length}</strong> booking{results.length > 1 ? 's' : ''}:
              </p>
              <div className="space-y-3">
                {results.map((booking) => (
                  <div key={booking.booking_token} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-neutral-900">
                          {getServiceName(booking.service)}
                        </h3>
                        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(booking.booking_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(booking.booking_time)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'no_show' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        )}>
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <Link
                          href={`/manage/${booking.booking_token}`}
                          className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Book another */}
      <div className="text-center">
        <Link
          href="/book"
          className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
        >
          <CalendarCheck className="h-4 w-4" />
          Book a new appointment
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
