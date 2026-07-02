import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { GalleryManager } from '@/components/admin/GalleryManager';

export const metadata: Metadata = {
  title: 'Gallery Management',
};

async function getGalleryImages() {
  const supabase = createClient();
  const { data } = await supabase
    .from('media_assets')
    .select('*')
    .eq('asset_type', 'gallery')
    .order('uploaded_at', { ascending: false });
  return data || [];
}

export default async function AdminGalleryPage() {
  const images = await getGalleryImages();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-neutral-900">Gallery</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Upload and manage your clinic photos.
      </p>

      <GalleryManager initialImages={images} />
    </div>
  );
}
