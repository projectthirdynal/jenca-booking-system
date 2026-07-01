'use client';

import { useState } from 'react';
import { Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ContentBlock } from '@/types';

interface BrandingCustomizerProps {
  initialContentBlocks: ContentBlock[];
}

const COLOR_PRESETS = [
  { name: 'Rose', value: 'rose', color: '#ec4899', classes: 'bg-brand-600' },
  { name: 'Sage', value: 'sage', color: '#84cc16', classes: 'bg-lime-600' },
  { name: 'Ocean', value: 'ocean', color: '#0ea5e9', classes: 'bg-sky-600' },
  { name: 'Lavender', value: 'lavender', color: '#a855f7', classes: 'bg-purple-600' },
  { name: 'Amber', value: 'amber', color: '#f59e0b', classes: 'bg-amber-600' },
  { name: 'Coral', value: 'coral', color: '#f97316', classes: 'bg-orange-600' },
];

export function BrandingCustomizer({ initialContentBlocks }: BrandingCustomizerProps) {
  const [blocks, setBlocks] = useState(initialContentBlocks);
  const [selectedPreset, setSelectedPreset] = useState(
    blocks.find((b) => b.block_key === 'accent_color_preset')?.content || 'rose'
  );
  const [saving, setSaving] = useState(false);

  const getBlock = (key: string) => blocks.find((b) => b.block_key === key);

  const updateBlock = async (key: string, content: string) => {
    setSaving(true);
    const existing = getBlock(key);
    if (existing) {
      await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: existing.id, content }),
      });
      setBlocks(blocks.map((b) => (b.id === existing.id ? { ...b, content } : b)));
    } else {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block_key: key, content }),
      });
      if (response.ok) {
        const saved = await response.json();
        setBlocks([...blocks, saved]);
      }
    }
    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('asset_type', 'logo');

    const response = await fetch('/api/media', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const { url } = await response.json();
      updateBlock('logo_url', url);
    }
  };

  const handlePresetSelect = (value: string) => {
    setSelectedPreset(value);
    updateBlock('accent_color_preset', value);
  };

  const logoUrl = getBlock('logo_url')?.content;

  return (
    <div className="mt-6 space-y-8">
      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold text-neutral-900">Logo</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Upload your clinic logo. PNG or SVG recommended, at least 200px wide.
        </p>

        <div className="mt-4 flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs text-neutral-400">No logo</span>
            )}
          </div>
          <label>
            <input
              type="file"
              accept="image/png,image/svg+xml,image/jpeg"
              onChange={handleLogoUpload}
              className="sr-only"
            />
            <span className="btn-secondary cursor-pointer inline-flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              Upload logo
            </span>
          </label>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold text-neutral-900">Accent color</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Choose a color preset that will be applied across your website.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetSelect(preset.value)}
              className={`relative rounded-xl border-2 p-4 transition-all ${
                selectedPreset === preset.value
                  ? 'border-neutral-900 ring-2 ring-neutral-900 ring-offset-2'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              aria-label={preset.name}
              aria-pressed={selectedPreset === preset.value}
            >
              <div
                className="mx-auto h-10 w-10 rounded-full"
                style={{ backgroundColor: preset.color }}
              />
              <p className="mt-2 text-sm font-medium text-neutral-700">{preset.name}</p>
              {selectedPreset === preset.value && (
                <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-neutral-400">
          A full color picker with live preview is coming in a future update.
        </p>
      </div>

      {saving && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg">
          Saving...
        </div>
      )}
    </div>
  );
}
