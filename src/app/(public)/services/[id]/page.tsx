import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Calendar, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { formatPHP } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Treatment Details',
};

interface ServiceDetailPageProps {
  params: { id: string };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const supabase = createClient();
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single();

  if (!service) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all treatments
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {service.image_url && (
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
            <img
              src={service.image_url}
              alt={service.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col">
          <h1 className="font-display text-3xl font-bold text-neutral-900">
            {service.name}
          </h1>

          <div className="mt-4 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-neutral-600">
              <Clock className="h-5 w-5 text-brand-600" />
              {service.duration_minutes} minutes
            </span>
            <span className="text-2xl font-bold text-brand-700">
              {formatPHP(service.price_php)}
            </span>
          </div>

          {service.description && (
            <p className="mt-6 text-neutral-600 leading-relaxed">
              {service.description}
            </p>
          )}

          <div className="mt-6 space-y-2">
            <p className="flex items-center gap-2 text-sm text-neutral-600">
              <Check className="h-4 w-4 text-green-600" />
              Instant email &amp; SMS confirmation
            </p>
            <p className="flex items-center gap-2 text-sm text-neutral-600">
              <Check className="h-4 w-4 text-green-600" />
              Free cancellation up to 2 hours before
            </p>
            <p className="flex items-center gap-2 text-sm text-neutral-600">
              <Check className="h-4 w-4 text-green-600" />
              Reminder sent 24 hours before your appointment
            </p>
          </div>

          <div className="mt-8">
            <Link href={`/book?service=${service.id}`}>
              <Button size="lg" className="w-full sm:w-auto">
                <Calendar className="mr-2 h-5 w-5" />
                Book this treatment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
