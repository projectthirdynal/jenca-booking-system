-- Jenca Aesthetics Booking System — Staff & Customers tables
-- Run this in the Supabase SQL editor after 00001_initial_schema.sql

-- Staff table
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Staff',
    phone TEXT,
    email TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(email)
);

-- Add foreign keys to bookings (nullable for backward compatibility)
ALTER TABLE bookings
    ADD COLUMN staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Admin policies for staff (full access)
CREATE POLICY "Admin can manage staff" ON staff
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Admin policies for customers (full access)
CREATE POLICY "Admin can manage customers" ON customers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public cannot access staff or customers tables (no policy = denied by RLS)

-- Updated_at triggers
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for customer search
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Index for staff lookup on bookings
CREATE INDEX idx_bookings_staff_id ON bookings(staff_id) WHERE staff_id IS NOT NULL;
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id) WHERE customer_id IS NOT NULL;
