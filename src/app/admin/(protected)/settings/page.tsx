import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SettingsManager } from '@/components/admin/SettingsManager';

export const metadata: Metadata = {
  title: 'Settings',
};

async function getSettings() {
  const supabase = createClient();
  const { data } = await supabase.from('content_blocks').select('*');
  const blocks: Record<string, string> = {};
  data?.forEach((block) => {
    blocks[block.block_key] = block.content;
    blocks[`${block.block_key}_id`] = block.id;
  });
  return blocks;
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-neutral-900">Settings</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Manage your clinic profile, booking rules, and notification preferences.
      </p>

      <SettingsManager initialContent={settings} />
    </div>
  );
}
