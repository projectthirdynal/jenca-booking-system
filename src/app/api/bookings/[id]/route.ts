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

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.status) updateData.status = body.status;
  if (body.booking_date) updateData.booking_date = body.booking_date;
  if (body.booking_time) updateData.booking_time = body.booking_time;
  if (body.staff_id !== undefined) updateData.staff_id = body.staff_id || null;

  const { data, error } = await serviceClient
    .from('bookings')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update booking' } },
      { status: 500 }
    );
  }

  // Send notifications if status changed to cancelled
  if (body.status === 'cancelled') {
    try {
      const { sendCancellationEmail } = await import('@/lib/notifications/email');
      const { sendSMS, formatCancellationSMS } = await import('@/lib/notifications/sms');

      const { data: booking } = await serviceClient
        .from('bookings')
        .select('*, service:services(*)')
        .eq('id', params.id)
        .single();

      if (booking?.service) {
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
  }

  return NextResponse.json(data);
}
