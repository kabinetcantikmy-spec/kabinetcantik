import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Auth callback — tukar `code` (PKCE) atau `token_hash` (magic-link/recovery)
 * kepada sesi login, kemudian redirect ke `next`.
 *
 * Nota: onboarding tenant TIDAK guna magic-link lagi — admin dicipta terus
 * dengan kata laluan (lihat owner/actions.ts) & log masuk di /admin/login.
 * Route ni kekal untuk reset kata laluan / magic-link portal pelanggan.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || "/portal";

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(list: { name: string; value: string; options: CookieOptions }[]) {
        list.forEach(({ name, value, options }) => cookieStore.set({ name, value, ...options }));
      },
    },
  });

  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  }

  // Jika gagal: hantar ke pintu login yang betul mengikut destinasi.
  const loginFallback = next.startsWith("/admin") ? "/admin/login" : "/portal/login";
  return NextResponse.redirect(`${origin}${ok ? next : `${loginFallback}?e=pautan`}`);
}
