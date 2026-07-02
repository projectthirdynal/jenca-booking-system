import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ServiceCard } from '@/components/ServiceCard';

export const metadata: Metadata = {
  title: 'Treatments & Services',
  description: 'Browse all skincare treatments available at Jenca Aesthetics.',
};

export default async function ServicesPage() {
  const supabase = createClient();
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-neutral-900">
          Our Treatments
        </h1>
        <p className="mt-3 text-lg text-neutral-600">
          Browse our services and book the one that&apos;s right for you.
        </p>
      </div>

      {services && services.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-neutral-500">
            Services are being updated. Please check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
