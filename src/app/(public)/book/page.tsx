import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { BookingWizard } from '@/components/BookingWizard';

export const metadata: Metadata = {
  title: 'Book an Appointment',
  description: 'Book your skincare appointment at Jenca Aesthetics.',
};

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
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
      <p className="mt-2 text-neutral-600">
        Select a treatment, pick a date and time, and confirm your booking in minutes.
      </p>

      <BookingWizard
        services={services}
        preselectedServiceId={searchParams.service}
      />

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
