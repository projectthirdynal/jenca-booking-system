import type { Metadata } from 'next';
import { FindBookingClient } from '@/components/FindBookingClient';

export const metadata: Metadata = {
  title: 'Find My Bookings — Jenca Aesthetics',
  description: 'Look up your appointments by email or phone number.',
  robots: { index: false, follow: false },
};

export default function FindBookingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-neutral-900">
        Find My Bookings
      </h1>
      <p className="mt-2 text-neutral-600">
        Enter your email or phone number to see all your appointments and manage them.
      </p>
      <FindBookingClient />
    </div>
  );
}
