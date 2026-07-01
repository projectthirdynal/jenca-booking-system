import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const assetType = formData.get('asset_type') as string || 'gallery';

  if (!file) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'No file provided' } },
      { status: 422 }
    );
  }

  const serviceClient = createServiceClient();

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${assetType}/${fileName}`;

  const { error: uploadError } = await serviceClient.storage
    .from('media')
    .upload(filePath, file, {
      contentType: file.type,
      cacheControl: '3600',
    });

  if (uploadError) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to upload file' } },
      { status: 500 }
    );
  }

  const { data: urlData } = serviceClient.storage
    .from('media')
    .getPublicUrl(filePath);

  // Save to media_assets table
  await serviceClient.from('media_assets').insert({
    file_path: urlData.publicUrl,
    asset_type: assetType,
    alt_text: file.name,
  });

  return NextResponse.json({ url: urlData.publicUrl, path: filePath });
}
