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
    .select('*, service:services(*), notifications(*), staff:staff(*), customer:customers(*)')
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

function normalizePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const match = cleaned.match(/^(\+?63|0)9\d{9}$/);
  if (!match) return null;
  return cleaned.replace(/^(\+?63|0)/, '+63');
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  const body = await request.json();

  // --- Field validation ---
  if (!body.client_name || !body.client_name.trim() || body.client_name.trim().length < 2) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Please enter your full name (at least 2 characters).' } },
      { status: 422 }
    );
  }

  const normalizedPhone = normalizePhone(body.client_phone || '');
  if (!normalizedPhone) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Please enter a valid PH mobile number (e.g., 09171234567).' } },
      { status: 422 }
    );
  }

  const normalizedEmail = normalizeEmail(body.client_email || '');
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Please enter a valid email address.' } },
      { status: 422 }
    );
  }

  if (!body.booking_date || !body.booking_time) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Date and time are required.' } },
      { status: 422 }
    );
  }

  const supabase = createClient();
  const serviceClient = createServiceClient();

  // --- Fetch the service ---
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

  // --- Lead time check ---
  const minLeadTime = parseInt(process.env.MIN_LEAD_TIME_HOURS || '2', 10);
  const slotDateTime = new Date(`${body.booking_date}T${body.booking_time}`);
  const minBookingTime = new Date(Date.now() + minLeadTime * 60 * 60 * 1000);

  if (slotDateTime < minBookingTime) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: `Bookings require at least ${minLeadTime} hours advance notice.` } },
      { status: 422 }
    );
  }

  // --- Blackout date check ---
  const { data: blackout } = await supabase
    .from('blackout_dates')
    .select('id')
    .eq('blocked_date', body.booking_date)
    .maybeSingle();

  if (blackout) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'This date is not available for booking.' } },
      { status: 422 }
    );
  }

  // --- Availability hours check ---
  const dayOfWeek = new Date(body.booking_date + 'T00:00:00').getDay();
  const { data: availability } = await supabase
    .from('availability_settings')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .maybeSingle();

  if (!availability || availability.is_closed) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'The clinic is closed on this day.' } },
      { status: 422 }
    );
  }

  const slotEndMinutes =
    parseInt(body.booking_time.split(':')[0]) * 60 +
    parseInt(body.booking_time.split(':')[1]) +
    service.duration_minutes;
  const closeMinutes =
    parseInt(availability.close_time.split(':')[0]) * 60 +
    parseInt(availability.close_time.split(':')[1]);
  const openMinutes =
    parseInt(availability.open_time.split(':')[0]) * 60 +
    parseInt(availability.open_time.split(':')[1]);
  const slotStartMinutes =
    parseInt(body.booking_time.split(':')[0]) * 60 +
    parseInt(body.booking_time.split(':')[1]);

  if (slotStartMinutes < openMinutes || slotEndMinutes > closeMinutes) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'This time slot is outside operating hours.' } },
      { status: 422 }
    );
  }

  // --- Check for existing booking (app-level guard) ---
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
      client_name: body.client_name.trim(),
      client_phone: normalizedPhone,
      client_email: normalizedEmail,
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

  // Upsert customer record by email
  try {
    const { data: existingCustomer } = await serviceClient
      .from('customers')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    let customerId: string | null = null;

    if (existingCustomer) {
      customerId = existingCustomer.id;
      await serviceClient
        .from('customers')
        .update({
          name: booking.client_name,
          phone: normalizedPhone,
        })
        .eq('id', customerId);
    } else {
      const { data: newCustomer } = await serviceClient
        .from('customers')
        .insert({
          name: booking.client_name,
          phone: normalizedPhone,
          email: normalizedEmail,
        })
        .select()
        .single();
      customerId = newCustomer?.id || null;
    }

    if (customerId) {
      await serviceClient
        .from('bookings')
        .update({ customer_id: customerId })
        .eq('id', booking.id);
    }
  } catch {
    // Customer upsert failure should not block booking creation
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
