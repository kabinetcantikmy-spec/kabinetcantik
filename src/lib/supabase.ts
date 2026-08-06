import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/** Client awam (anon) — untuk baca portfolio/settings di laman awam. */
export function createPublicClient() {
  return createClient(url, anonKey);
}

/**
 * Client service-role — HANYA guna dalam server (API route / server action).
 * Pintas RLS. Jangan sekali-kali hantar ke client.
 */
export function createServiceClient() {
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Adakah Supabase dikonfigurasi? (untuk graceful fallback semasa dev tanpa .env) */
export function supabaseReady(): boolean {
  return Boolean(url && serviceKey);
}
