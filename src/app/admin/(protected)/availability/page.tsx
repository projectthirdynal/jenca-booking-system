import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AvailabilityManager } from '@/components/admin/AvailabilityManager';

export const metadata: Metadata = {
  title: 'Availability Settings',
};

async function getAvailability() {
  const supabase = createClient();
  const { data } = await supabase
    .from('availability_settings')
    .select('*')
    .order('day_of_week', { ascending: true });
  return data || [];
}

async function getBlackoutDates() {
  const supabase = createClient();
  const { data } = await supabase
    .from('blackout_dates')
    .select('*')
    .order('blocked_date', { ascending: true });
  return data || [];
}

export default async function AdminAvailabilityPage() {
  const [availability, blackoutDates] = await Promise.all([
    getAvailability(),
    getBlackoutDates(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-neutral-900">Availability</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Set operating hours, block off holidays, and manage booking rules.
      </p>

      <AvailabilityManager
        initialAvailability={availability}
        initialBlackoutDates={blackoutDates}
      />
    </div>
  );
}
