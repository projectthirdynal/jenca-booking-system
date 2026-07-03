'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail, Loader2, AlertCircle, Send, ArrowRight, CalendarCheck, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function FindBookingClient() {
  const [query, setQuery] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoverMsg, setRecoverMsg] = useState<string | null>(null);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
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
      {/* Recovery form */}
      <form onSubmit={handleRecover} className="card p-6">
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Email or phone number
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
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
          Enter the email or phone you used when booking. We&apos;ll send your booking links there.
        </p>

        <button
          type="submit"
          disabled={recovering || !query.trim()}
          className={cn(
            'mt-4 flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors',
            recovering || !query.trim()
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              : 'bg-brand-600 text-white hover:bg-brand-700'
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
              Send my booking links
            </>
          )}
        </button>
      </form>

      {/* Privacy note */}
      <div className="flex items-start gap-2 rounded-lg bg-neutral-50 border border-neutral-200 p-4">
        <ShieldCheck className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-neutral-500">
          For your privacy, we don&apos;t display bookings on this page. Your booking links will be sent
          only to the email or phone number on file.
        </p>
      </div>

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
