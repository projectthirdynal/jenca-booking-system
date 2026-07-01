import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ContentEditor } from '@/components/admin/ContentEditor';

export const metadata: Metadata = {
  title: 'Content Editor',
};

async function getContentBlocks() {
  const supabase = createClient();
  const { data } = await supabase
    .from('content_blocks')
    .select('*')
    .order('block_key', { ascending: true });
  return data || [];
}

export default async function AdminContentPage() {
  const contentBlocks = await getContentBlocks();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-neutral-900">Content</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Edit the text that appears on your website — homepage, about, promos, contact info.
      </p>

      <ContentEditor initialContentBlocks={contentBlocks} />
    </div>
  );
}
