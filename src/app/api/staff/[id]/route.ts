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
  const serviceClient = createServiceClient();

  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name.trim();
  if (body.role !== undefined) updateData.role = body.role.trim();
  if (body.phone !== undefined) updateData.phone = body.phone?.trim() || null;
  if (body.email !== undefined) updateData.email = body.email?.trim() || null;
  if (body.is_active !== undefined) updateData.is_active = body.is_active;

  const { data, error } = await serviceClient
    .from('staff')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update staff member' } },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
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

  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from('staff')
    .update({ is_active: false })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to deactivate staff member' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
