import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { BrandingCustomizer } from '@/components/admin/BrandingCustomizer';

export const metadata: Metadata = {
  title: 'Branding',
};

async function getBrandingContent() {
  const supabase = createClient();
  const { data } = await supabase
    .from('content_blocks')
    .select('*')
    .in('block_key', ['logo_url', 'accent_color_preset', 'banner_url']);
  return data || [];
}

export default async function AdminBrandingPage() {
  const contentBlocks = await getBrandingContent();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-neutral-900">Branding</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Upload your logo, choose brand colors, and update your banner image.
      </p>

      <BrandingCustomizer initialContentBlocks={contentBlocks} />
    </div>
  );
}
