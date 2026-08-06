import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** Supabase client untuk komponen client (login, dsb). */
export function createSupabaseBrowser() {
  return createBrowserClient(url, anon);
}
