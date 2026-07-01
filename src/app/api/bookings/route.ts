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
    .from('bookings')
    .select('*, service:services(*), notifications(*)')
    .order('booking_date', { ascending: false })
    .order('booking_time', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch bookings' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();

  const supabase = createClient();
  const serviceClient = createServiceClient();

  // Fetch the service to get duration
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', body.service_id)
    .eq('is_active', true)
    .single();

  if (!service) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Service not found or inactive' } },
      { status: 404 }
    );
  }

  // Check for existing booking (app-level guard)
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('service_id', body.service_id)
    .eq('booking_date', body.booking_date)
    .eq('booking_time', body.booking_time)
    .neq('status', 'cancelled')
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: { code: 'CONFLICT', message: 'This time slot is already booked. Please select another time.' } },
      { status: 409 }
    );
  }

  const bookingToken = crypto.randomUUID();

  const { data: booking, error } = await serviceClient
    .from('bookings')
    .insert({
      service_id: body.service_id,
      booking_date: body.booking_date,
      booking_time: body.booking_time,
      client_name: body.client_name,
      client_phone: body.client_phone,
      client_email: body.client_email,
      status: 'confirmed',
      booking_token: bookingToken,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'This time slot was just booked. Please select another time.' } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create booking' } },
      { status: 500 }
    );
  }

  // Send notifications (fire and forget, log failures)
  try {
    const { sendBookingConfirmationEmail } = await import('@/lib/notifications/email');
    const { sendSMS, formatBookingSMS } = await import('@/lib/notifications/sms');

    const emailResult = sendBookingConfirmationEmail(booking.client_email, {
      client_name: booking.client_name,
      service_name: service.name,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      price_php: service.price_php,
      booking_token: booking.booking_token,
    });

    const smsResult = sendSMS({
      to: booking.client_phone,
      message: formatBookingSMS(
        booking.client_name,
        service.name,
        booking.booking_date,
        booking.booking_time
      ),
    });

    const [emailResponse, smsResponse] = await Promise.all([emailResult, smsResult]);

    // Log notification results
    const notifications = [
      {
        booking_id: booking.id,
        type: 'confirmation',
        channel: 'email' as const,
        status: emailResponse.error ? 'failed' : 'sent',
        sent_at: emailResponse.error ? null : new Date().toISOString(),
      },
      {
        booking_id: booking.id,
        type: 'confirmation',
        channel: 'sms' as const,
        status: smsResponse.success ? 'sent' : 'failed',
        sent_at: smsResponse.success ? new Date().toISOString() : null,
      },
    ];

    await serviceClient.from('notifications').insert(notifications);
  } catch {
    // Notification failures are logged via the notifications table
  }

  return NextResponse.json(booking, { status: 201 });
}
