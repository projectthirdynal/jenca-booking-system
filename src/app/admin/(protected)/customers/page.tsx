import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CustomersManager } from '@/components/admin/CustomersManager';

export const metadata: Metadata = {
  title: 'Customer Database',
};

async function getCustomers() {
  const supabase = createClient();
  const { data } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-neutral-900">Customers</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Search and manage your client database.
      </p>

      <CustomersManager initialCustomers={customers} />
    </div>
  );
}
