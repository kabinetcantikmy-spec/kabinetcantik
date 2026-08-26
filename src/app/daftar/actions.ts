"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { sendEmail, emailShell, emailReady } from "@/lib/email";

/**
 * Pendaftaran SENDIRI (self-serve) untuk syarikat baru — trial 14 hari.
 *
 * REQUIRE_VERIFY=true  → hantar emel pengesahan (Resend). Akaun tak boleh log
 *   masuk sampai emel disahkan. Pautan sahkan tuju ke /auth/callback kita guna
 *   `token_hash` (server baca terus — ELAK bug hash-fragment magic-link lama).
 * REQUIRE_VERIFY=false → akaun terus aktif, auto log masuk (tiada emel).
 */
const REQUIRE_VERIFY = true;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kabinetcantik.com";

// Slug yang tak boleh diambil (subdomain sistem / terpelihara).
const RESERVED = new Set([
  "", "www", "app", "admin", "api", "auth", "demo", "mail", "smtp", "ftp",
  "portal", "pembekal", "daftar", "login", "blog", "static", "assets", "cdn",
  "status", "help", "support", "kabinetcantik", "os", "owner", "platform",
]);

export type RegisterState =
  | { ok: true; mode: "instant"; slug: string; email: string }
  | { ok: true; mode: "verify"; email: string }
  | { ok: false; error: string };

export interface RegisterInput {
  nama: string;
  slug: string;
  email: string;
  password: string;
  hp?: string; // honeypot — kalau diisi, ia bot
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function registerTenant(input: RegisterInput): Promise<RegisterState> {
  // Honeypot: bot selalu isi medan tersembunyi. Pura-pura ok, jangan cipta apa-apa.
  if (input.hp && input.hp.trim() !== "") {
    return { ok: true, mode: "verify", email: "" };
  }
  if (!supabaseReady()) return { ok: false, error: "Sistem belum sedia. Cuba sebentar lagi." };

  const nama = String(input.nama || "").trim();
  const slug = String(input.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "");

  if (!nama || nama.length < 2) return { ok: false, error: "Nama syarikat terlalu pendek." };
  if (!/^[a-z0-9-]{2,32}$/.test(slug))
    return { ok: false, error: "Slug: 2-32 aksara, huruf kecil/nombor/sengkang sahaja." };
  if (RESERVED.has(slug)) return { ok: false, error: `Slug "${slug}" tak boleh digunakan. Pilih lain.` };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Emel tak sah." };
  if (password.length < 8) return { ok: false, error: "Kata laluan mesti sekurang-kurangnya 8 aksara." };
  if (REQUIRE_VERIFY && !emailReady())
    return { ok: false, error: "Penghantar emel belum dikonfigur. Hubungi sokongan." };

  const sb = createServiceClient();

  // 1) Slug mesti unik.
  const { data: taken } = await sb.from("tenants").select("id").eq("slug", slug).maybeSingle();
  if (taken) return { ok: false, error: `Slug "${slug}" dah diambil. Pilih lain.` };

  // 2) Cipta tenant (trial 14 hari).
  const trialEnds = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();
  const { data: t, error: te } = await sb
    .from("tenants")
    .insert({ nama, slug, status: "trial", plan: "trial", trial_ends_at: trialEnds })
    .select("id")
    .single();
  if (te || !t) {
    const dup = te?.code === "23505";
    return { ok: false, error: dup ? `Slug "${slug}" dah diambil. Pilih lain.` : "Gagal cipta akaun. Cuba lagi." };
  }

  // Pautkan profile sebagai admin tenant ni.
  async function linkAdmin(uid: string): Promise<boolean> {
    const { error } = await sb.from("profiles").upsert({
      id: uid,
      nama: `${nama} Admin`,
      emel: email,
      role: "admin",
      org_id: t!.id,
    });
    return !error;
  }

  // Buang tenant (rollback) supaya tak tinggal sampah.
  async function rollbackTenant() {
    await sb.from("tenants").delete().eq("id", t!.id);
  }

  if (REQUIRE_VERIFY) {
    // 3a) Jana akaun (belum sah) + pautan pengesahan.
    const { data: gl, error: ge } = await sb.auth.admin.generateLink({
      type: "signup",
      email,
      password,
    });
    const uid = gl?.user?.id;
    const tokenHash = gl?.properties?.hashed_token;
    if (ge || !uid || !tokenHash) {
      await rollbackTenant();
      const msg = (ge?.message || "").toLowerCase();
      const exists = msg.includes("already") || msg.includes("registered");
      return {
        ok: false,
        error: exists ? "Emel ni dah ada akaun. Sila log masuk di /admin/login." : "Gagal cipta akaun. Cuba lagi.",
      };
    }

    if (!(await linkAdmin(uid))) {
      await sb.auth.admin.deleteUser(uid).catch(() => {});
      await rollbackTenant();
      return { ok: false, error: "Gagal pautkan akaun. Cuba lagi." };
    }

    // 4a) Pautan sahkan → callback kita (token_hash, bukan hash-fragment Supabase).
    const confirmUrl = `${APP_URL}/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=signup&next=/admin`;
    const html = emailShell(
      "Sahkan emel anda",
      `<p>Terima kasih daftar <b>${escapeHtml(nama)}</b> di KabinetCantik.</p>
       <p>Klik butang di bawah untuk sahkan emel & terus masuk panel anda:</p>
       <p style="margin:20px 0"><a href="${confirmUrl}" style="background:#AE873B;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;display:inline-block">Sahkan &amp; Masuk</a></p>
       <p style="font-size:13px;color:#9a9a9a">Butang tak jadi? Salin pautan ni ke pelayar:<br>${confirmUrl}</p>
       <p style="font-size:13px;color:#9a9a9a">Trial percuma 14 hari bermula bila anda sahkan.</p>`
    );
    const sent = await sendEmail({ to: email, subject: "Sahkan emel — KabinetCantik", html });
    if (!sent.ok) {
      await sb.auth.admin.deleteUser(uid).catch(() => {});
      await rollbackTenant();
      return { ok: false, error: `Emel pengesahan gagal: ${sent.error || "punca tidak diketahui"}` };
    }
    return { ok: true, mode: "verify", email };
  }

  // 3b) Mod terus (tiada verify): cipta akaun aktif → auto log masuk di client.
  const { data: created, error: ce } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (ce || !created?.user) {
    await rollbackTenant();
    const exists = (ce?.message || "").toLowerCase().includes("already");
    return {
      ok: false,
      error: exists ? "Emel ni dah ada akaun. Sila log masuk di /admin/login." : "Gagal cipta akaun admin. Cuba emel lain.",
    };
  }
  if (!(await linkAdmin(created.user.id))) {
    return { ok: false, error: "Akaun dicipta tapi gagal pautkan. Hubungi sokongan." };
  }
  return { ok: true, mode: "instant", slug, email };
}
