"use server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { sendEmail, emailShell, emailReady } from "@/lib/email";
import { hostBrand } from "@/lib/branding";
import { tenantBaseUrl } from "@/lib/tenant";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signOutPortal() {
  const supabase = createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/portal/login");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Hantar pautan log masuk portal pelanggan — TENANT-BRANDED via Resend.
 * Guna generateLink (magiclink) + token_hash → /auth/callback (elak emel
 * built-in Supabase yang tak dihantar ke pelanggan). Domain ikut host tenant.
 * Keselamatan: kalau akaun tak wujud, pulang { ok: true } tanpa hantar apa-apa
 * (elak account enumeration).
 */
export async function sendPortalMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
  const e = String(email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return { ok: false, error: "Emel tak sah." };
  if (!supabaseReady() || !emailReady()) return { ok: false, error: "Sistem emel belum sedia. Hubungi sokongan." };

  const host = (await headers()).get("host");
  const brand = await hostBrand(host);
  const baseUrl = await tenantBaseUrl();

  const admin = createServiceClient();
  const { data: gl, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: e });
  const th = gl?.properties?.hashed_token;
  if (error || !th) {
    // Akaun mungkin belum wujud — jangan bocor. Pura-pura berjaya.
    return { ok: true };
  }

  const link = `${baseUrl}/auth/callback?token_hash=${encodeURIComponent(th)}&type=magiclink&next=/portal`;
  const html = emailShell(
    "Pautan log masuk portal",
    `<p>Klik butang di bawah untuk log masuk ke portal pelanggan <b>${escapeHtml(brand.nama)}</b>:</p>
     <p style="margin:20px 0"><a href="${link}" style="background:#AE873B;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;display:inline-block">Log Masuk Portal</a></p>
     <p style="font-size:13px;color:#9a9a9a">Butang tak jadi? Salin pautan ni ke pelayar:<br>${link}</p>
     <p style="font-size:13px;color:#9a9a9a">Jika anda tidak meminta pautan ini, abaikan emel ini.</p>`,
    brand.nama
  );
  const sent = await sendEmail({ to: e, fromName: brand.nama, subject: `Pautan log masuk — ${brand.nama}`, html });
  return sent.ok ? { ok: true } : { ok: false, error: "Gagal hantar emel. Cuba lagi." };
}
