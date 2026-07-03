import type { Metadata } from 'next';
import { FindBookingClient } from '@/components/FindBookingClient';

export const metadata: Metadata = {
  title: 'Recover My Bookings — Jenca Aesthetics',
  description: 'Get your booking links sent to your email or phone.',
  robots: { index: false, follow: false },
};

export default function FindBookingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-neutral-900">
        Recover My Bookings
      </h1>
      <p className="mt-2 text-neutral-600">
        Lost your booking link? Enter your email or phone number and we&apos;ll send your booking links to you.
      </p>
      <FindBookingClient />
    </div>
  );
}
