import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { StaffManager } from '@/components/admin/StaffManager';

export const metadata: Metadata = {
  title: 'Staff Management',
};

async function getStaff() {
  const supabase = createClient();
  const { data } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function AdminStaffPage() {
  const staff = await getStaff();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-neutral-900">Staff</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Manage your clinic staff and assign them to bookings.
      </p>

      <StaffManager initialStaff={staff} />
    </div>
  );
}
