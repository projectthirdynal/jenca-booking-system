import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ServicesManager } from '@/components/admin/ServicesManager';
import { formatPHP } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Services Management',
};

async function getServices() {
  const supabase = createClient();
  const { data } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function AdminServicesPage() {
  const services = await getServices();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-neutral-900">Services</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Add, edit, and manage your treatment offerings.
      </p>

      <ServicesManager initialServices={services} />
    </div>
  );
}
