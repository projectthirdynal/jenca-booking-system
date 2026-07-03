import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch staff' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const body = await request.json();

  if (!body.name || !body.name.trim()) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Staff name is required' } },
      { status: 422 }
    );
  }

  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('staff')
    .insert({
      name: body.name.trim(),
      role: body.role?.trim() || 'Staff',
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create staff member' } },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
