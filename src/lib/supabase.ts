import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export type Booking = {
  id: string;
  room_id: number;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  status: string;
  payment_proof_url: string | null;
  created_at: string;
  rooms?: { name: string; type: string; price: number };
}

export type Room = {
  id: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
  floor: string | null;
  bed_type: string | null;
  description: string | null;
  image_url: string | null;
  amenities: string[] | null;
  available: number;
}