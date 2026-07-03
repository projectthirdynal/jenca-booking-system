export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export type NotificationType = 'confirmation' | 'reminder' | 'cancellation' | 'reschedule';

export type NotificationChannel = 'email' | 'sms';

export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'delivered';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_php: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  created_at: string;
  updated_at: string;
  bookings?: Booking[];
}

export interface Booking {
  id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  status: BookingStatus;
  booking_token: string;
  staff_id: string | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
  service?: Service;
  notifications?: Notification[];
  staff?: Staff | null;
  customer?: Customer | null;
}

export interface Notification {
  id: string;
  booking_id: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  sent_at: string | null;
}

export interface ContentBlock {
  id: string;
  block_key: string;
  content: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  file_path: string;
  asset_type: string;
  alt_text: string | null;
  uploaded_at: string;
}

export interface AvailabilitySettings {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface BlackoutDate {
  id: string;
  blocked_date: string;
  reason: string | null;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface CreateBookingInput {
  service_id: string;
  booking_date: string;
  booking_time: string;
  client_name: string;
  client_phone: string;
  client_email: string;
}

export interface UpdateBookingInput {
  status?: BookingStatus;
  booking_date?: string;
  booking_time?: string;
}
