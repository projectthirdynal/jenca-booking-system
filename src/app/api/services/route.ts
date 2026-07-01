import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch services' } },
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
      { error: { code: 'VALIDATION_ERROR', message: 'Service name is required' } },
      { status: 422 }
    );
  }

  if (!body.duration_minutes || body.duration_minutes <= 0) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Duration must be greater than 0' } },
      { status: 422 }
    );
  }

  if (body.price_php === undefined || body.price_php < 0) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Price must be 0 or greater' } },
      { status: 422 }
    );
  }

  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('services')
    .insert({
      name: body.name.trim(),
      description: body.description?.trim() || null,
      duration_minutes: body.duration_minutes,
      price_php: body.price_php,
      is_active: body.is_active ?? true,
      image_url: body.image_url || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create service' } },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
