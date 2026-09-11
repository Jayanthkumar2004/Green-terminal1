import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

/**
 * Initial Default Seed Data for local fallback state matching prompt reference
 */
export const INITIAL_ROOMS_SEED = [
  // First Floor (101-107)
  { id: 'room-101', room_number: '101', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-102', room_number: '102', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-103', room_number: '103', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-104', room_number: '104', room_type: 'NON_AC', rate: 1000, status: 'CHECKED_IN' },
  { id: 'room-105', room_number: '105', room_type: 'AC', rate: 1425, status: 'AVAILABLE' },
  { id: 'room-106', room_number: '106', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-107', room_number: '107', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },

  // Second Floor (201-207)
  { id: 'room-201', room_number: '201', room_type: 'NON_AC', rate: 1000, status: 'CHECKED_IN' },
  { id: 'room-202', room_number: '202', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-203', room_number: '203', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-204', room_number: '204', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-205', room_number: '205', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-206', room_number: '206', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-207', room_number: '207', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },

  // Third Floor (301-307)
  { id: 'room-301', room_number: '301', room_type: 'NON_AC', rate: 1000, status: 'CHECKED_IN' },
  { id: 'room-302', room_number: '302', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-303', room_number: '303', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-304', room_number: '304', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-305', room_number: '305', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-306', room_number: '306', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-307', room_number: '307', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },

  // Fourth Floor (401-407)
  { id: 'room-401', room_number: '401', room_type: 'NON_AC', rate: 1000, status: 'AVAILABLE' },
  { id: 'room-402', room_number: '402', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-403', room_number: '403', room_type: 'AC', rate: 1425, status: 'AVAILABLE' },
  { id: 'room-404', room_number: '404', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-405', room_number: '405', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },
  { id: 'room-406', room_number: '406', room_type: 'AC', rate: 1425, status: 'AVAILABLE' },
  { id: 'room-407', room_number: '407', room_type: 'AC', rate: 1425, status: 'CHECKED_IN' },

  // Suite Room (5001)
  { id: 'room-5001', room_number: '5001', room_type: 'SUITE', rate: 2500, status: 'AVAILABLE' },
];

// Initial Stays / Active Guests matching the exact visual prompt example
const baseCheckInTime = new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(); // 5 hours 30 mins ago

export const INITIAL_STAYS_SEED = [
  { id: 'stay-101', room_id: 'room-101', guest_name: 'BHANU PRASAD', phone: '9848022338', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-102', room_id: 'room-102', guest_name: 'SURENDAR', phone: '9848011223', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-103', room_id: 'room-103', guest_name: 'GOPAL KANDHA', phone: '9440112233', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-104', room_id: 'room-104', guest_name: 'AHMED', phone: '9988776655', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-106', room_id: 'room-106', guest_name: 'THARUN', phone: '9876543210', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-107', room_id: 'room-107', guest_name: 'ROHIT', phone: '9123456789', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },

  { id: 'stay-201', room_id: 'room-201', guest_name: 'MEERAVALI', phone: '9849988776', company_name: 'CARD-0', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-202', room_id: 'room-202', guest_name: 'KIRAN KUMAR', phone: '9440998877', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-203', room_id: 'room-203', guest_name: 'SOMU NAIK', phone: '9848123456', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-204', room_id: 'room-204', guest_name: 'CHANDRA SEKHAR', phone: '9955112233', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-205', room_id: 'room-205', guest_name: 'JOJI', phone: '9848554433', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-206', room_id: 'room-206', guest_name: 'VAMSI', phone: '9988112233', company_name: 'CARD-0/-', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-207', room_id: 'room-207', guest_name: 'CHANDRA SEKHAR', phone: '9955112233', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },

  { id: 'stay-301', room_id: 'room-301', guest_name: 'SRINIVAS RAO', phone: '9848223344', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-302', room_id: 'room-302', guest_name: 'VENU GOPAL', phone: '9848334455', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-303', room_id: 'room-303', guest_name: 'SHYAM KUMAR', phone: '9848445566', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-304', room_id: 'room-304', guest_name: 'VINAY', phone: '9848556677', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-305', room_id: 'room-305', guest_name: 'P ESWAR KRISHNA KANTH', phone: '9848667788', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-306', room_id: 'room-306', guest_name: 'VARA PRASAD', phone: '9848778899', company_name: 'CARD-0/-', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-307', room_id: 'room-307', guest_name: 'P RAJEEV', phone: '9848889900', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },

  { id: 'stay-402', room_id: 'room-402', guest_name: 'DURGARAO', phone: '9848990011', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-404', room_id: 'room-404', guest_name: 'ADARSH', phone: '9848001122', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-405', room_id: 'room-405', guest_name: 'SAI NATH', phone: '9848112233', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
  { id: 'stay-407', room_id: 'room-407', guest_name: 'MURALIDHAR', phone: '9848223355', company_name: '', gst_number: '', check_in: baseCheckInTime, status: 'CHECKED_IN' },
];

export const INITIAL_BOOKINGS_SEED = [
  // Sample booking if any
];

export const INITIAL_BILLS_SEED = [
  {
    id: 'bill-5089',
    bill_number: '5089',
    stay_id: 'stay-3003',
    room_id: 'room-303',
    room_number: '3003',
    guest_name: 'RAKESH DASHRATH BAYAL',
    company_name: 'AUTO MECH ENGINEERING INDIA PVT LTD',
    gst_number: '27AATCA4196R1ZJ',
    pax: '01',
    reg_number: '7730',
    nationality: 'IND',
    check_in: '2026-05-05T06:35:00Z',
    check_out: '2026-05-06T06:10:00Z',
    room_rate: 1425.00,
    billable_days: 1,
    cgst_rate: 2.50,
    cgst_amount: 37.50,
    sgst_rate: 2.50,
    sgst_amount: 37.50,
    grand_total: 1500.00,
    payment_amount: 1500.00,
    payment_method: 'CAS PAID',
    balance: 0.00,
    amount_in_words: 'FIFTEEN HUNDRED RUPEES ONLY',
    created_at: '2026-05-06T06:10:00Z'
  }
];
