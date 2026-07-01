import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'See our clinic and the results we deliver at Jenca Aesthetics.',
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

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-neutral-900">
          Gallery
        </h1>
        <p className="mt-3 text-lg text-neutral-600">
          Take a look at our clinic and our work.
        </p>
      </div>

      {images.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="aspect-square overflow-hidden rounded-2xl bg-neutral-100"
            >
              <img
                src={image.file_path}
                alt={image.alt_text || 'Gallery image'}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-neutral-500">
            Gallery photos are being updated. Please check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
