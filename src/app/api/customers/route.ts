import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '15', 10);
  const offset = (page - 1) * limit;

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch customers' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data, count, page, limit });
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
      { error: { code: 'VALIDATION_ERROR', message: 'Customer name is required' } },
      { status: 422 }
    );
  }

  if (!body.phone || !body.phone.trim()) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Customer phone is required' } },
      { status: 422 }
    );
  }

  if (!body.email || !body.email.trim()) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Customer email is required' } },
      { status: 422 }
    );
  }

  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('customers')
    .insert({
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email.trim().toLowerCase(),
      notes: body.notes?.trim() || '',
    })
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
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create customer' } },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
