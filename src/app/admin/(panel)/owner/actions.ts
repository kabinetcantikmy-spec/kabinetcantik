"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { requireStaff } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export type CreateTenantState =
  | {
      ok: true;
      nama: string;
      slug: string;
      email: string;
      password: string;
      existing: boolean;
    }
  | { ok: false; error: string }
  | null;

async function ensureOwner() {
  const staff = await requireStaff();
  if (!staff.isPlatformAdmin) throw new Error("Akses ditolak.");
  return staff;
}

/** Jana kata laluan sementara — kukuh tapi senang dibaca (elak huruf keliru). */
function genPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const buf = new Uint32Array(9);
  crypto.getRandomValues(buf);
  let out = "";
  for (let i = 0; i < buf.length; i++) out += chars[buf[i] % chars.length];
  // Pastikan ada huruf besar, kecil, nombor & simbol.
  return `Kc-${out}9`;
}

/**
 * Cipta tenant baru + akaun admin syarikat dengan kata laluan (auto-confirmed).
 * Tiada magic-link — pulangkan email + kata laluan supaya owner boleh serahkan
 * kepada pelanggan. Pelanggan terus log masuk di /admin/login.
 */
export async function createTenant(
  _prev: CreateTenantState,
  formData: FormData
): Promise<CreateTenantState> {
  await ensureOwner();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigur." };

  const nama = String(formData.get("nama") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!nama || !slug) return { ok: false, error: "Nama & slug wajib diisi." };
  if (!email)
    return { ok: false, error: "Emel admin wajib — ia akaun log masuk pelanggan." };

  const sb = createServiceClient();

  // 1) Cipta tenant (trial 14 hari).
  const trialEnds = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();
  const { data: t, error: te } = await sb
    .from("tenants")
    .insert({ nama, slug, status: "trial", plan: "trial", trial_ends_at: trialEnds })
    .select("id")
    .single();
  if (te || !t) {
    const dup = te?.code === "23505";
    return {
      ok: false,
      error: dup ? `Slug "${slug}" dah wujud. Guna slug lain.` : "Gagal cipta tenant.",
    };
  }

  // 2) Cipta akaun admin dengan kata laluan (auto-confirmed).
  const password = genPassword();
  let uid: string | undefined;
  let existing = false;

  const { data: created, error: ce } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (created?.user) {
    uid = created.user.id;
  } else if (ce) {
    // Emel mungkin dah wujud → cari & reset kata laluan.
    const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
    const found = list?.users?.find((u) => u.email?.toLowerCase() === email);
    if (found) {
      uid = found.id;
      existing = true;
      await sb.auth.admin.updateUserById(uid, { password, email_confirm: true });
    }
  }

  if (!uid) {
    // Rollback tenant supaya tak tinggal sampah.
    await sb.from("tenants").delete().eq("id", t.id);
    return { ok: false, error: "Gagal cipta akaun admin. Cuba emel lain." };
  }

  // 3) Pautkan profile sebagai admin tenant ni.
  const { error: pe } = await sb.from("profiles").upsert({
    id: uid,
    nama: `${nama} Admin`,
    emel: email,
    role: "admin",
    org_id: t.id,
  });
  if (pe) {
    return {
      ok: false,
      error: "Akaun dicipta tapi gagal pautkan ke tenant. Semak jadual profiles.",
    };
  }

  revalidatePath("/admin/owner");
  return { ok: true, nama, slug, email, password, existing };
}
