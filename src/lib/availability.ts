import { AvailabilitySettings, BlackoutDate, Booking, TimeSlot } from '@/types';

/**
 * Generate available time slots for a given date based on:
 * - Operating hours (availability_settings)
 * - Blackout dates
 * - Existing bookings
 * - Service duration (to calculate slot intervals)
 * - Buffer time between appointments
 */
export function generateTimeSlots(
  date: string,
  serviceDurationMinutes: number,
  availability: AvailabilitySettings | null,
  blackoutDates: BlackoutDate[],
  existingBookings: Booking[],
  bufferMinutes: number = 0,
  minLeadTimeHours: number = 2
): TimeSlot[] {
  // Check if date is blacked out
  if (blackoutDates.some((bd) => bd.blocked_date === date)) {
    return [];
  }

  // Check if there are operating hours for this day
  if (!availability || availability.is_closed) {
    return [];
  }

  const dayOfWeek = new Date(date + 'T00:00:00').getDay();
  if (availability.day_of_week !== dayOfWeek) {
    return [];
  }

  // Check minimum lead time
  const now = new Date();
  const bookingDateTime = new Date(`${date}T${availability.open_time}`);
  const minBookingTime = new Date(now.getTime() + minLeadTimeHours * 60 * 60 * 1000);

  const slots: TimeSlot[] = [];
  const [openHour, openMinute] = availability.open_time.split(':').map(Number);
  const [closeHour, closeMinute] = availability.close_time.split(':').map(Number);

  let currentHour = openHour;
  let currentMinute = openMinute;

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMinute < closeMinute)
  ) {
    const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    const slotDateTime = new Date(`${date}T${timeString}`);

    // Skip past slots
    if (slotDateTime < minBookingTime) {
      currentMinute += serviceDurationMinutes + bufferMinutes;
      while (currentMinute >= 60) {
        currentMinute -= 60;
        currentHour++;
      }
      continue;
    }

    // Check if slot end time exceeds closing time
    const slotEndMinutes = currentHour * 60 + currentMinute + serviceDurationMinutes;
    const closeMinutes = closeHour * 60 + closeMinute;
    if (slotEndMinutes > closeMinutes) {
      break;
    }

    // Check if slot conflicts with existing booking
    const isBooked = existingBookings.some((booking) => {
      if (booking.status === 'cancelled') return false;
      if (booking.booking_date !== date) return false;
      const bookingStartMinutes =
        parseInt(booking.booking_time.split(':')[0]) * 60 +
        parseInt(booking.booking_time.split(':')[1]);
      const bookingEndMinutes = bookingStartMinutes + serviceDurationMinutes;
      const slotStartMinutes = currentHour * 60 + currentMinute;
      const slotEndMinutesCalc = slotStartMinutes + serviceDurationMinutes;

      return (
        slotStartMinutes < bookingEndMinutes && slotEndMinutesCalc > bookingStartMinutes
      );
    });

    slots.push({ time: timeString, available: !isBooked });

    currentMinute += serviceDurationMinutes + bufferMinutes;
    while (currentMinute >= 60) {
      currentMinute -= 60;
      currentHour++;
    }
  }

  return slots;
}

export function isDateBookable(
  date: string,
  blackoutDates: BlackoutDate[],
  availability: AvailabilitySettings | null,
  minLeadTimeHours: number = 2
): boolean {
  if (blackoutDates.some((bd) => bd.blocked_date === date)) {
    return false;
  }

  if (!availability || availability.is_closed) {
    return false;
  }

  const now = new Date();
  const minBookingDate = new Date(now.getTime() + minLeadTimeHours * 60 * 60 * 1000);
  const bookingDate = new Date(date + 'T00:00:00');

  return bookingDate >= minBookingDate;
}
