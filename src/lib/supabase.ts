import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

export type DiscountSetting = {
  active: boolean;
  percent: 10 | 20 | 30;
};

export async function getDiscountSetting(): Promise<DiscountSetting> {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "discount")
    .maybeSingle();
  if (data?.value && typeof data.value === "object") {
    return {
      active: Boolean(data.value.active),
      percent: (data.value.percent as 10 | 20 | 30) || 10,
    };
  }
  return { active: false, percent: 10 };
}