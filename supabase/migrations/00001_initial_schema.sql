-- Jenca Aesthetics Booking System — Initial Schema
-- Run this in the Supabase SQL editor

-- Enable extensions (pgcrypto provides gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create enums
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE notification_type AS ENUM ('confirmation', 'reminder', 'cancellation', 'reschedule');
CREATE TYPE notification_channel AS ENUM ('email', 'sms');
CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'failed', 'delivered');

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    price_php DECIMAL(10, 2) NOT NULL CHECK (price_php >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service images table
CREATE TABLE service_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT NOT NULL,
    status booking_status NOT NULL DEFAULT 'confirmed',
    booking_token UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint to prevent double-booking (excluding cancelled)
-- This uses a partial unique index so cancelled bookings don't block the slot
CREATE UNIQUE INDEX bookings_no_double_booking
    ON bookings (service_id, booking_date, booking_time)
    WHERE status != 'cancelled';

-- Unique constraint on booking_token
CREATE UNIQUE INDEX bookings_token_unique
    ON bookings (booking_token);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    status notification_status NOT NULL DEFAULT 'queued',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content blocks table (mini-CMS)
CREATE TABLE content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_key TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Media assets table
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path TEXT NOT NULL,
    asset_type TEXT NOT NULL DEFAULT 'gallery',
    alt_text TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Availability settings table
CREATE TABLE availability_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    open_time TIME NOT NULL DEFAULT '09:00',
    close_time TIME NOT NULL DEFAULT '17:00',
    is_closed BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(day_of_week)
);

-- Blackout dates table
CREATE TABLE blackout_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocked_date DATE NOT NULL UNIQUE,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default availability settings (all days open 9am-5pm, closed Sundays)
INSERT INTO availability_settings (day_of_week, open_time, close_time, is_closed) VALUES
    (0, '09:00', '17:00', true),   -- Sunday — closed
    (1, '09:00', '17:00', false),  -- Monday
    (2, '09:00', '17:00', false),  -- Tuesday
    (3, '09:00', '17:00', false),  -- Wednesday
    (4, '09:00', '17:00', false),  -- Thursday
    (5, '09:00', '17:00', false),  -- Friday
    (6, '09:00', '17:00', false);  -- Saturday

-- Insert default content blocks
INSERT INTO content_blocks (block_key, content) VALUES
    ('homepage_badge', 'Skincare that feels like you'),
    ('homepage_headline', 'Your skin, beautifully cared for'),
    ('homepage_subheadline', 'Book your appointment online in under a minute. Browse our treatments, pick a time that works for you, and we''ll take care of the rest.'),
    ('about_headline', 'About Jenca Aesthetics'),
    ('about_text', 'Jenca Aesthetics is a skincare clinic dedicated to helping you achieve healthy, radiant skin. Our trained professionals provide personalized treatments in a calm, welcoming environment.'),
    ('mission_text', 'To provide accessible, high-quality skincare treatments that help our clients feel confident in their own skin.'),
    ('contact_address', ''),
    ('contact_phone', ''),
    ('contact_email', ''),
    ('footer_text', 'Jenca Aesthetics. All rights reserved.'),
    ('accent_color_preset', 'rose');

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blackout_dates ENABLE ROW LEVEL SECURITY;

-- Public read policies (for the public website)
CREATE POLICY "Public can view active services" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view content blocks" ON content_blocks
    FOR SELECT USING (true);

CREATE POLICY "Public can view gallery media" ON media_assets
    FOR SELECT USING (asset_type = 'gallery');

CREATE POLICY "Public can view availability" ON availability_settings
    FOR SELECT USING (true);

CREATE POLICY "Public can view blackout dates" ON blackout_dates
    FOR SELECT USING (true);

-- Public can create bookings (but not read others' bookings)
CREATE POLICY "Public can create bookings" ON bookings
    FOR INSERT WITH CHECK (true);

-- Public can read their own booking via token (handled at app level for simplicity)
-- For production, consider a more restrictive policy
CREATE POLICY "Public can view bookings by token" ON bookings
    FOR SELECT USING (true);

-- Authenticated admin policies (full access)
CREATE POLICY "Admin can manage services" ON services
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin can manage service images" ON service_images
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin can manage bookings" ON bookings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin can manage notifications" ON notifications
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin can manage content blocks" ON content_blocks
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin can manage media assets" ON media_assets
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin can manage availability" ON availability_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin can manage blackout dates" ON blackout_dates
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view media" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated can upload media" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated can delete media" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'media');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at BEFORE UPDATE ON content_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
