import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateTimeSlots } from '@/lib/availability';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('serviceId');
  const date = searchParams.get('date');

  if (!serviceId || !date) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'serviceId and date are required' } },
      { status: 422 }
    );
  }

  const supabase = createClient();

  // Get service
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .eq('is_active', true)
    .single();

  if (!service) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Service not found' } },
      { status: 404 }
    );
  }

  // Get day of week for the selected date
  const dayOfWeek = new Date(date + 'T00:00:00').getDay();

  // Get availability settings for this day
  const { data: availability } = await supabase
    .from('availability_settings')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .maybeSingle();

  // Get blackout dates
  const { data: blackoutDates } = await supabase
    .from('blackout_dates')
    .select('*');

  // Get existing bookings for this date
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_date', date)
    .neq('status', 'cancelled');

  const minLeadTime = parseInt(process.env.MIN_LEAD_TIME_HOURS || '2', 10);

  const slots = generateTimeSlots(
    date,
    service.duration_minutes,
    availability || null,
    blackoutDates || [],
    existingBookings || [],
    0,
    minLeadTime
  );

  return NextResponse.json({ data: slots });
}
