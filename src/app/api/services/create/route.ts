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

  const body = await request.json();
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('services')
    .insert({
      name: body.name,
      description: body.description,
      duration_minutes: body.duration_minutes,
      price_php: body.price_php,
      is_active: body.is_active,
      image_url: body.image_url,
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
