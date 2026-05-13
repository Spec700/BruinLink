import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function isConfigured(): boolean {
  try {
    new URL(supabaseUrl);
    return supabaseAnonKey.length > 0;
  } catch {
    return false;
  }
}

export const supabaseConfigured = isConfigured();

export const supabase: SupabaseClient = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient);
