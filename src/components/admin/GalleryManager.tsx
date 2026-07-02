'use client';

import { useState, useCallback } from 'react';
import { Upload, Trash2, Eye, EyeOff, Loader2, ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  file_path: string;
  asset_type: string;
  alt_text: string | null;
  uploaded_at: string;
}

interface GalleryManagerProps {
  initialImages: MediaItem[];
}

export function GalleryManager({ initialImages }: GalleryManagerProps) {
  const [images, setImages] = useState<MediaItem[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploaded: MediaItem[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('asset_type', 'gallery');

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploaded.push({
            id: crypto.randomUUID(),
            file_path: data.url,
            asset_type: 'gallery',
            alt_text: file.name,
            uploaded_at: new Date().toISOString(),
          });
        }
      }

      setImages([...uploaded, ...images]);
    } catch {
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    if (!confirm('Delete this image? This cannot be undone.')) return;

    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/media?id=${id}&path=${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setImages(images.filter((img) => img.id !== id));
      } else {
        setError('Failed to delete image.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Upload bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-neutral-500">
            {images.length} image{images.length !== 1 ? 's' : ''}
          </p>
        </div>
        <label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleUpload}
            className="sr-only"
            disabled={uploading}
          />
          <span className="btn-primary cursor-pointer inline-flex items-center">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos
              </>
            )}
          </span>
        </label>
      </div>

      {/* Gallery grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
            >
              <img
                src={image.file_path}
                alt={image.alt_text || 'Gallery image'}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleDelete(image.id, image.file_path)}
                  disabled={deletingId === image.id}
                  className="rounded-lg bg-white/90 p-2 text-red-600 hover:bg-white disabled:opacity-50"
                  aria-label="Delete image"
                >
                  {deletingId === image.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-neutral-300" />
          <p className="mt-3 text-sm text-neutral-500">
            No photos yet. Upload some to showcase your clinic.
          </p>
        </div>
      )}
    </div>
  );
}
