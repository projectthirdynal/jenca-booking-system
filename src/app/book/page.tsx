import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import { formatPHP } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Book an Appointment',
  description: 'Book your skincare appointment at Jenca Aesthetics.',
};

async function getService(serviceId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .eq('is_active', true)
    .single();
  return data;
}

async function getServices() {
  const supabase = createClient();
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name');
  return data || [];
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: { service?: string };
}) {
  const services = await getServices();
  const selectedService = searchParams.service
    ? await getService(searchParams.service)
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/services"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to treatments
      </Link>

      <h1 className="mt-6 font-display text-3xl font-bold text-neutral-900">
        Book an Appointment
      </h1>

      {selectedService ? (
        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-neutral-900">
                {selectedService.name}
              </h2>
              <div className="mt-2 flex items-center gap-4 text-sm text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {selectedService.duration_minutes} minutes
                </span>
                <span className="font-medium text-brand-700">
                  {formatPHP(selectedService.price_php)}
                </span>
              </div>
            </div>
            <Link href="/book">
              <Button variant="secondary" size="sm">
                Change
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-neutral-700">
            Select a treatment to book:
          </h2>
          <div className="mt-4 space-y-3">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/book?service=${service.id}`}
                className="block card p-4 hover:border-brand-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-900">{service.name}</h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      {service.duration_minutes} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-brand-700">
                      {formatPHP(service.price_php)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {selectedService && (
        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs">
              1
            </span>
            Choose a date and time
          </div>
          <p className="mt-2 text-sm text-neutral-500">
            Use the booking interface to select your preferred date and time slot.
            This is where the date picker and time slot selection will appear.
          </p>
          <div className="mt-4 rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center">
            <Calendar className="mx-auto h-10 w-10 text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-400">
              Interactive booking calendar loads here
            </p>
          </div>
        </div>
      )}

      <div className="mt-12 rounded-xl bg-neutral-50 border border-neutral-200 p-6">
        <h3 className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          What happens after you book?
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-neutral-600">
          <li>You&apos;ll receive an email and SMS confirmation instantly</li>
          <li>Your confirmation includes a link to cancel or reschedule if needed</li>
          <li>We&apos;ll send you a reminder 24 hours before your appointment</li>
        </ul>
      </div>
    </div>
  );
}
