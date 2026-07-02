import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' } },
      { status: 401 }
    );
  }

  const serviceClient = createServiceClient();

  // Find confirmed bookings for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const { data: bookings, error } = await serviceClient
    .from('bookings')
    .select('*, service:services(*)')
    .eq('booking_date', tomorrowStr)
    .eq('status', 'confirmed');

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch bookings' } },
      { status: 500 }
    );
  }

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No bookings for tomorrow' });
  }

  // Check which bookings already have a reminder notification
  const { data: existingReminders } = await serviceClient
    .from('notifications')
    .select('booking_id')
    .eq('type', 'reminder')
    .in('booking_id', bookings.map((b) => b.id));

  const alreadyReminded = new Set(existingReminders?.map((r) => r.booking_id) || []);

  const bookingsToRemind = bookings.filter((b) => !alreadyReminded.has(b.id));

  if (bookingsToRemind.length === 0) {
    return NextResponse.json({ sent: 0, message: 'All reminders already sent' });
  }

  const { sendReminderEmail } = await import('@/lib/notifications/email');
  const { sendSMS, formatReminderSMS } = await import('@/lib/notifications/sms');

  const results: { bookingId: string; emailSent: boolean; smsSent: boolean }[] = [];
  const notifications: {
    booking_id: string;
    type: 'reminder';
    channel: 'email' | 'sms';
    status: 'sent' | 'failed';
    sent_at: string | null;
  }[] = [];

  for (const booking of bookingsToRemind) {
    if (!booking.service) continue;

    const emailPromise = sendReminderEmail(booking.client_email, {
      client_name: booking.client_name,
      service_name: booking.service.name,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
    });

    const smsPromise = sendSMS({
      to: booking.client_phone,
      message: formatReminderSMS(
        booking.client_name,
        booking.service.name,
        booking.booking_date,
        booking.booking_time
      ),
    });

    const [emailResult, smsResult] = await Promise.all([emailPromise, smsPromise]);

    const emailSent = !emailResult.error;
    const smsSent = smsResult.success;

    results.push({ bookingId: booking.id, emailSent, smsSent });

    notifications.push({
      booking_id: booking.id,
      type: 'reminder',
      channel: 'email',
      status: emailSent ? 'sent' : 'failed',
      sent_at: emailSent ? new Date().toISOString() : null,
    });

    notifications.push({
      booking_id: booking.id,
      type: 'reminder',
      channel: 'sms',
      status: smsSent ? 'sent' : 'failed',
      sent_at: smsSent ? new Date().toISOString() : null,
    });
  }

  // Log all notifications
  if (notifications.length > 0) {
    await serviceClient.from('notifications').insert(notifications);
  }

  return NextResponse.json({
    sent: results.length,
    results,
  });
}
