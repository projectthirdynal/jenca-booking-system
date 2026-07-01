import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmationEmail(
  to: string,
  booking: {
    client_name: string;
    service_name: string;
    booking_date: string;
    booking_time: string;
    price_php: number;
    booking_token: string;
  }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const manageUrl = `${appUrl}/manage/${booking.booking_token}`;

  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'Jenca Aesthetics <noreply@jencaaesthetics.com>',
    to,
    subject: 'Booking Confirmed — Jenca Aesthetics',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Booking Confirmed</h1>
        <p>Hi ${booking.client_name},</p>
        <p>Your appointment has been booked successfully.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Service:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.service_name}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.booking_date}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Time:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.booking_time}</td></tr>
          <tr><td style="padding: 8px;"><strong>Price:</strong></td><td style="padding: 8px;">₱${booking.price_php}</td></tr>
        </table>
        <p><a href="${manageUrl}" style="display: inline-block; padding: 12px 24px; background: #db2777; color: white; text-decoration: none; border-radius: 8px;">Manage my booking</a></p>
        <p style="color: #666; font-size: 14px;">Use the link above to cancel or reschedule your appointment.</p>
      </div>
    `,
  });
}

export async function sendCancellationEmail(
  to: string,
  booking: { client_name: string; service_name: string; booking_date: string; booking_time: string }
) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'Jenca Aesthetics <noreply@jencaaesthetics.com>',
    to,
    subject: 'Booking Cancelled — Jenca Aesthetics',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Booking Cancelled</h1>
        <p>Hi ${booking.client_name},</p>
        <p>Your appointment for ${booking.service_name} on ${booking.booking_date} at ${booking.booking_time} has been cancelled.</p>
        <p>If you believe this is an error, please contact us directly.</p>
      </div>
    `,
  });
}

export async function sendReminderEmail(
  to: string,
  booking: { client_name: string; service_name: string; booking_date: string; booking_time: string }
) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'Jenca Aesthetics <noreply@jencaaesthetics.com>',
    to,
    subject: 'Appointment Reminder — Jenca Aesthetics',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Appointment Reminder</h1>
        <p>Hi ${booking.client_name},</p>
        <p>This is a reminder for your upcoming appointment:</p>
        <p><strong>${booking.service_name}</strong><br/>${booking.booking_date} at ${booking.booking_time}</p>
        <p>We look forward to seeing you!</p>
      </div>
    `,
  });
}
