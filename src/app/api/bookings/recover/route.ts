import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function normalizePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const match = cleaned.match(/^(\+?63|0)9\d{9}$/);
  if (!match) return null;
  return cleaned.replace(/^(\+?63|0)/, '+63');
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again in a minute.' } },
      { status: 429 }
    );
  }

  const body = await request.json();
  const email = body.email;
  const phone = body.phone;

  if (!email && !phone) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Please provide an email or phone number.' } },
      { status: 422 }
    );
  }

  const supabase = createClient();
  let query = supabase
    .from('bookings')
    .select('booking_token, booking_date, booking_time, status, client_name, client_email, client_phone, service:services(name)')
    .order('booking_date', { ascending: false })
    .limit(20);

  let recipientEmail: string | null = null;

  if (email) {
    const normalizedEmail = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Please enter a valid email address.' } },
        { status: 422 }
      );
    }
    query = query.eq('client_email', normalizedEmail);
    recipientEmail = normalizedEmail;
  } else if (phone) {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Please enter a valid PH mobile number.' } },
        { status: 422 }
      );
    }
    query = query.eq('client_phone', normalizedPhone);
  }

  const { data: bookings, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to look up bookings.' } },
      { status: 500 }
    );
  }

  // If lookup was by phone, get email from the most recent booking
  if (!recipientEmail && bookings && bookings.length > 0) {
    recipientEmail = bookings[0].client_email;
  }

  // Always return success to prevent email enumeration
  if (!bookings || bookings.length === 0 || !recipientEmail) {
    return NextResponse.json({ sent: true, count: 0 });
  }

  try {
    const { sendRecoveryEmail } = await import('@/lib/notifications/email');
    await sendRecoveryEmail(
      recipientEmail,
      bookings.map((b: Record<string, unknown>) => {
        const svc = b.service as { name: string }[] | { name: string } | null;
        let serviceName = '';
        if (Array.isArray(svc)) {
          serviceName = svc[0]?.name || '';
        } else if (svc) {
          serviceName = svc.name;
        }
        return {
          client_name: b.client_name as string,
          service_name: serviceName,
          booking_date: b.booking_date as string,
          booking_time: b.booking_time as string,
          booking_token: b.booking_token as string,
          status: b.status as string,
        };
      })
    );
  } catch {
    // Log failure but still return success to prevent enumeration
  }

  return NextResponse.json({ sent: true, count: bookings.length });
}
