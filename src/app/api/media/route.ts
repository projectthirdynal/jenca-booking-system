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

export async function DELETE(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const path = searchParams.get('path');

  if (!id) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Media ID is required' } },
      { status: 422 }
    );
  }

  const serviceClient = createServiceClient();

  // Delete from storage if path provided
  if (path) {
    try {
      const filePath = path.replace(/^.*\/media\//, '');
      await serviceClient.storage.from('media').remove([filePath]);
    } catch {
      // File may already be deleted; continue with table cleanup
    }
  }

  // Delete from media_assets table
  const { error } = await serviceClient
    .from('media_assets')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete media' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
