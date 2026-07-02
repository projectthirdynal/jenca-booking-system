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

  if (!body.blocked_date) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Date is required' } },
      { status: 422 }
    );
  }

  const today = new Date().toISOString().split('T')[0];
  if (body.blocked_date < today) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Cannot block a past date' } },
      { status: 422 }
    );
  }

  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('blackout_dates')
    .insert({
      blocked_date: body.blocked_date,
      reason: body.reason || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'This date is already blocked' } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to add blackout date' } },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
