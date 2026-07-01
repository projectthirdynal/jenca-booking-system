import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, service:services(*)')
    .eq('booking_token', params.token)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Booking not found' } },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: { token: string } }
) {
  const body = await request.json();
  const supabase = createClient();
  const serviceClient = createServiceClient();

  // Fetch booking by token
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*, service:services(*)')
    .eq('booking_token', params.token)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Booking not found' } },
      { status: 404 }
    );
  }

  // Check if booking is still modifiable
  const isExpired =
    booking.status === 'cancelled' ||
    booking.status === 'completed' ||
    booking.status === 'no_show' ||
    new Date(booking.booking_date + 'T23:59:59') < new Date();

  if (isExpired) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'This booking can no longer be modified' } },
      { status: 403 }
    );
  }

  if (body.action === 'cancel') {
    const { data, error } = await serviceClient
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to cancel booking' } },
        { status: 500 }
      );
    }

    // Send cancellation notifications
    try {
      const { sendCancellationEmail } = await import('@/lib/notifications/email');
      const { sendSMS, formatCancellationSMS } = await import('@/lib/notifications/sms');

      if (booking.service) {
        await Promise.all([
          sendCancellationEmail(booking.client_email, {
            client_name: booking.client_name,
            service_name: booking.service.name,
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
          }),
          sendSMS({
            to: booking.client_phone,
            message: formatCancellationSMS(
              booking.client_name,
              booking.service.name,
              booking.booking_date,
              booking.booking_time
            ),
          }),
        ]);
      }
    } catch {
      // Notification failures logged separately
    }

    return NextResponse.json(data);
  }

  if (body.action === 'reschedule') {
    if (!body.new_date || !body.new_time) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'New date and time are required for rescheduling' } },
        { status: 422 }
      );
    }

    // Check slot availability
    const { data: conflict } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_date', body.new_date)
      .eq('booking_time', body.new_time)
      .neq('status', 'cancelled')
      .neq('id', booking.id)
      .maybeSingle();

    if (conflict) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'The selected time slot is not available' } },
        { status: 409 }
      );
    }

    const { data, error } = await serviceClient
      .from('bookings')
      .update({
        booking_date: body.new_date,
        booking_time: body.new_time,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to reschedule booking' } },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  }

  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message: 'Unknown action' } },
    { status: 422 }
  );
}
