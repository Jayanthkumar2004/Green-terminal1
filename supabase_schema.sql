-- =========================================================
-- HOTEL GREEN TERMINAL DATABASE SCHEMA FOR SUPABASE
-- =========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. ROOMS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(20) NOT NULL UNIQUE,
    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('AC', 'NON_AC', 'SUITE')),
    rate DECIMAL(10, 2) NOT NULL DEFAULT 1425.00,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BOOKED', 'CHECKED_IN', 'CHECK_OUT', 'OUT_FOR_CLEANING', 'YET_TO_CLEAN', 'MAINTENANCE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update constraint for existing rooms table
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_status_check;
ALTER TABLE rooms ADD CONSTRAINT rooms_status_check CHECK (status IN ('AVAILABLE', 'BOOKED', 'CHECKED_IN', 'CHECK_OUT', 'OUT_FOR_CLEANING', 'YET_TO_CLEAN', 'MAINTENANCE'));

-- ---------------------------------------------------------
-- 2. BOOKINGS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    guest_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    company_name VARCHAR(150),
    gst_number VARCHAR(50),
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_checkout TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------
-- 3. STAYS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS stays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    guest_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    company_name VARCHAR(150),
    gst_number VARCHAR(50),
    check_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    check_out TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'CHECKED_IN' CHECK (status IN ('CHECKED_IN', 'CHECKED_OUT')),
    billable_days INT DEFAULT 1,
    room_rate DECIMAL(10, 2) NOT NULL,
    dismissed_checkout_cycle INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration for existing stays table
ALTER TABLE stays ADD COLUMN IF NOT EXISTS dismissed_checkout_cycle INT DEFAULT 0;

-- ---------------------------------------------------------
-- 4. BILLS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    stay_id UUID REFERENCES stays(id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    room_number VARCHAR(20) NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150),
    gst_number VARCHAR(50),
    pax VARCHAR(10) DEFAULT '01',
    reg_number VARCHAR(50) DEFAULT '7732',
    nationality VARCHAR(50) DEFAULT 'IND',
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out TIMESTAMP WITH TIME ZONE NOT NULL,
    room_rate DECIMAL(10, 2) NOT NULL,
    billable_days INT NOT NULL DEFAULT 1,
    cgst_rate DECIMAL(5, 2) DEFAULT 2.50,
    cgst_amount DECIMAL(10, 2) NOT NULL,
    sgst_rate DECIMAL(5, 2) DEFAULT 2.50,
    sgst_amount DECIMAL(10, 2) NOT NULL,
    grand_total DECIMAL(10, 2) NOT NULL,
    payment_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'CARD PAID',
    balance DECIMAL(10, 2) DEFAULT 0.00,
    amount_in_words TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------
-- 5. USER PROFILES TABLE (Stores Register Credentials Metadata)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'manager',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow public write access to rooms" ON rooms FOR ALL USING (true);

CREATE POLICY "Allow public read access to bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public write access to bookings" ON bookings FOR ALL USING (true);

CREATE POLICY "Allow public read access to stays" ON stays FOR SELECT USING (true);
CREATE POLICY "Allow public write access to stays" ON stays FOR ALL USING (true);

CREATE POLICY "Allow public read access to bills" ON bills FOR SELECT USING (true);
CREATE POLICY "Allow public write access to bills" ON bills FOR ALL USING (true);

CREATE POLICY "Allow public read access to profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public write access to profiles" ON profiles FOR ALL USING (true);

-- Enable Supabase Realtime WebSocket Subscriptions for Tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'rooms') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'stays') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE stays;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'bookings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'bills') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bills;
  END IF;
END $$;

-- ---------------------------------------------------------
-- SEED INITIAL DATA
-- ---------------------------------------------------------
INSERT INTO rooms (room_number, room_type, rate, status) VALUES
-- First Floor (101-107)
('101', 'AC', 1425.00, 'CHECKED_IN'),
('102', 'AC', 1425.00, 'CHECKED_IN'),
('103', 'AC', 1425.00, 'CHECKED_IN'),
('104', 'NON_AC', 1000.00, 'CHECKED_IN'),
('105', 'AC', 1425.00, 'AVAILABLE'),
('106', 'AC', 1425.00, 'CHECKED_IN'),
('107', 'AC', 1425.00, 'CHECKED_IN'),

-- Second Floor (201-207)
('201', 'NON_AC', 1000.00, 'CHECKED_IN'),
('202', 'AC', 1425.00, 'CHECKED_IN'),
('203', 'AC', 1425.00, 'CHECKED_IN'),
('204', 'AC', 1425.00, 'CHECKED_IN'),
('205', 'AC', 1425.00, 'CHECKED_IN'),
('206', 'AC', 1425.00, 'CHECKED_IN'),
('207', 'AC', 1425.00, 'CHECKED_IN'),

-- Third Floor (301-307)
('301', 'NON_AC', 1000.00, 'CHECKED_IN'),
('302', 'AC', 1425.00, 'CHECKED_IN'),
('303', 'AC', 1425.00, 'CHECKED_IN'),
('304', 'AC', 1425.00, 'CHECKED_IN'),
('305', 'AC', 1425.00, 'CHECKED_IN'),
('306', 'AC', 1425.00, 'CHECKED_IN'),
('307', 'AC', 1425.00, 'CHECKED_IN'),

-- Fourth Floor (401-407)
('401', 'NON_AC', 1000.00, 'AVAILABLE'),
('402', 'AC', 1425.00, 'CHECKED_IN'),
('403', 'AC', 1425.00, 'AVAILABLE'),
('404', 'AC', 1425.00, 'CHECKED_IN'),
('405', 'AC', 1425.00, 'CHECKED_IN'),
('406', 'AC', 1425.00, 'AVAILABLE'),
('407', 'AC', 1425.00, 'CHECKED_IN'),

-- Suite Room (5001)
('5001', 'SUITE', 2500.00, 'AVAILABLE')
ON CONFLICT (room_number) DO NOTHING;
