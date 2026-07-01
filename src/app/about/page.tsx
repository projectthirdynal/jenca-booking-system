import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatTime } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Jenca Aesthetics — our story, our mission, and our commitment to your skin.',
};

async function getContent() {
  const supabase = createClient();
  const { data } = await supabase.from('content_blocks').select('*');
  const blocks: Record<string, string> = {};
  data?.forEach((block) => {
    blocks[block.block_key] = block.content;
  });
  return blocks;
}

export default async function AboutPage() {
  const content = await getContent();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-neutral-900">
        {content['about_headline'] || 'About Jenca Aesthetics'}
      </h1>

      <div className="mt-6 prose prose-neutral max-w-none">
        <p className="text-lg text-neutral-600">
          {content['about_text'] ||
            'Jenca Aesthetics is a skincare clinic dedicated to helping you achieve healthy, radiant skin. Our trained professionals provide personalized treatments in a calm, welcoming environment.'}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold">Our Mission</h2>
          <p className="mt-2 text-sm text-neutral-600">
            {content['mission_text'] ||
              'To provide accessible, high-quality skincare treatments that help our clients feel confident in their own skin.'}
          </p>
        </div>
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold">Visit Us</h2>
          <p className="mt-2 text-sm text-neutral-600">
            {content['contact_address'] || 'Address to be updated'}
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            {content['contact_phone'] || 'Phone to be updated'}
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            {content['contact_email'] || 'Email to be updated'}
          </p>
        </div>
      </div>
    </div>
  );
}
