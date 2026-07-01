'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ContentBlock } from '@/types';

interface ContentEditorProps {
  initialContentBlocks: ContentBlock[];
}

const BLOCK_LABELS: Record<string, string> = {
  homepage_badge: 'Homepage badge text',
  homepage_headline: 'Homepage headline',
  homepage_subheadline: 'Homepage subheadline',
  about_headline: 'About page headline',
  about_text: 'About page text',
  mission_text: 'Mission statement',
  contact_address: 'Clinic address',
  contact_phone: 'Contact phone',
  contact_email: 'Contact email',
  footer_text: 'Footer text',
};

export function ContentEditor({ initialContentBlocks }: ContentEditorProps) {
  const [blocks, setBlocks] = useState(initialContentBlocks);
  const [saving, setSaving] = useState<string | null>(null);

  const handleSave = async (id: string, content: string) => {
    setSaving(id);
    await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, content }),
    });
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
    setSaving(null);
  };

  return (
    <div className="mt-6 space-y-4">
      {blocks.map((block) => (
        <div key={block.id} className="card p-5">
          <label className="label">
            {BLOCK_LABELS[block.block_key] || block.block_key}
          </label>
          <textarea
            className="input-field mt-1.5"
            rows={block.content.length > 100 ? 4 : 2}
            defaultValue={block.content}
            onBlur={(e) => {
              if (e.target.value !== block.content) {
                handleSave(block.id, e.target.value);
              }
            }}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-mono">{block.block_key}</span>
            {saving === block.id && (
              <span className="text-xs text-brand-600 flex items-center gap-1">
                <Save className="h-3 w-3" />
                Saving...
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
