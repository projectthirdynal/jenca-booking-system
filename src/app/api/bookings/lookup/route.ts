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
const RATE_LIMIT_MAX = 10;
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

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again in a minute.' } },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');

  if (!email && !phone) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Please provide an email or phone number.' } },
      { status: 422 }
    );
  }

  const supabase = createClient();
  let query = supabase
    .from('bookings')
    .select('booking_token, booking_date, booking_time, status, created_at, client_name, client_phone, service:services(name)')
    .order('booking_date', { ascending: false })
    .order('booking_time', { ascending: false })
    .limit(20);

  if (email) {
    const normalizedEmail = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Please enter a valid email address.' } },
        { status: 422 }
      );
    }
    query = query.eq('client_email', normalizedEmail);
  } else if (phone) {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Please enter a valid PH mobile number (e.g., 09171234567).' } },
        { status: 422 }
      );
    }
    query = query.eq('client_phone', normalizedPhone);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to look up bookings.' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data || [] });
}
