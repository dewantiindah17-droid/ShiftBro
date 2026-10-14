import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client Supabase khusus SERVER (memakai Service Role Key).
// Jangan pernah mengimpor file ini dari komponen client ("use client").
let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Bila belum dikonfigurasi, kembalikan null -> sistem otomatis pakai mode demo.
  if (!url || !serviceRoleKey) return null;

  if (!cachedClient) {
    cachedClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return cachedClient;
}
