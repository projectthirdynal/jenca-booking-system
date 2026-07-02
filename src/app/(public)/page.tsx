import Link from 'next/link';
import { ArrowRight, Sparkles, Calendar, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';

async function getServices() {
  const supabase = createClient();
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name');
  return data || [];
}

async function getContent() {
  const supabase = createClient();
  const { data } = await supabase.from('content_blocks').select('*');
  const blocks: Record<string, string> = {};
  data?.forEach((block) => {
    blocks[block.block_key] = block.content;
  });
  return blocks;
}

export default async function HomePage() {
  const services = await getServices();
  const content = await getContent();

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
              <Sparkles className="h-4 w-4" />
              {content['homepage_badge'] || 'Skincare that feels like you'}
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
              {content['homepage_headline'] || 'Your skin, beautifully cared for'}
            </h1>
            <p className="mt-6 text-lg text-neutral-600">
              {content['homepage_subheadline'] ||
                'Book your appointment online in under a minute. Browse our treatments, pick a time that works for you, and we\'ll take care of the rest.'}
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/book">
                <Button size="lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book an appointment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="secondary" size="lg">
                  Browse treatments
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
              <Calendar className="h-6 w-6 text-brand-600" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">Easy online booking</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Pick a treatment, choose a time, confirm. No phone calls needed.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
              <ShieldCheck className="h-6 w-6 text-brand-600" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">Automated reminders</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Get instant confirmation and a reminder before your appointment.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
              <Sparkles className="h-6 w-6 text-brand-600" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">Self-service reschedule</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Need to change your appointment? Manage it online with your booking link.
            </p>
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section className="bg-neutral-100 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
              <h2 className="font-display text-3xl font-bold text-neutral-900">
                Popular treatments
              </h2>
              <p className="mt-2 text-neutral-600">
                Explore our most-requested services
              </p>
              </div>
              <Link href="/services" className="hidden sm:block">
                <Button variant="secondary">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 3).map((service) => (
                <div key={service.id} className="card overflow-hidden p-0">
                  {service.image_url && (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold">{service.name}</h3>
                    <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                      {service.description}
                    </p>
                    <p className="mt-3 font-medium text-brand-700">
                      ₱{service.price_php.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold text-neutral-900">
          {content['about_headline'] || 'About Jenca Aesthetics'}
        </h2>
        <p className="mt-4 text-neutral-600">
          {content['about_text'] ||
            'Jenca Aesthetics is a skincare clinic dedicated to helping you achieve healthy, radiant skin. Our trained professionals provide personalized treatments in a calm, welcoming environment.'}
        </p>
        <Link href="/about" className="mt-6 inline-block">
          <Button variant="secondary">
            Learn more about us
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
