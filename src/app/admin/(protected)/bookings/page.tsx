import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { BookingsManager } from '@/components/admin/BookingsManager';

export const metadata: Metadata = {
  title: 'Bookings Management',
};

async function getBookings() {
  const supabase = createClient();
  const { data } = await supabase
    .from('bookings')
    .select('*, service:services(*), notifications(*)')
    .order('booking_date', { ascending: false })
    .order('booking_time', { ascending: false });
  return data || [];
}

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-neutral-900">Bookings</h1>
      <p className="mt-1 text-sm text-neutral-500">
        View and manage all client appointments.
      </p>

      <BookingsManager bookings={bookings} />
    </div>
  );
}
