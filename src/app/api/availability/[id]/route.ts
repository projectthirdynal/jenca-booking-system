import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const body = await request.json();

  if (body.open_time && body.close_time && body.open_time >= body.close_time) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Open time must be before close time' } },
      { status: 422 }
    );
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.open_time !== undefined) updateData.open_time = body.open_time;
  if (body.close_time !== undefined) updateData.close_time = body.close_time;
  if (body.is_closed !== undefined) updateData.is_closed = body.is_closed;

  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('availability_settings')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update availability' } },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
