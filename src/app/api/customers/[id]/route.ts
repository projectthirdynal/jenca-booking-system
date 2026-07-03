import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';

export async function GET(
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

  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !customer) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Customer not found' } },
      { status: 404 }
    );
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, service:services(*), staff:staff(*)')
    .eq('customer_id', params.id)
    .order('booking_date', { ascending: false })
    .order('booking_time', { ascending: false });

  return NextResponse.json({ ...customer, bookings: bookings || [] });
}

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
  if (body.phone !== undefined) updateData.phone = body.phone.trim();
  if (body.email !== undefined) updateData.email = body.email.trim().toLowerCase();
  if (body.notes !== undefined) updateData.notes = body.notes;

  const { data, error } = await serviceClient
    .from('customers')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'A customer with this email already exists' } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update customer' } },
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
    .from('customers')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete customer' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
