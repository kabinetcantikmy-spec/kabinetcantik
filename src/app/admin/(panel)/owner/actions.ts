"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { requireStaff } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

async function ensureOwner() {
  const staff = await requireStaff();
  if (!staff.isPlatformAdmin) throw new Error("Akses ditolak.");
  return staff;
}

/** Cipta tenant baru + (optional) jemput admin syarikat. Status: trial 14 hari. */
export async function createTenant(formData: FormData): Promise<void> {
  await ensureOwner();
  if (!supabaseReady()) return;
  const nama = String(formData.get("nama") || "").trim();
  const slug = String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const email = String(formData.get("email") || "").trim();
  if (!nama || !slug) return;

  const sb = createServiceClient();
  const trialEnds = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();
  const { data: t, error } = await sb
    .from("tenants")
    .insert({ nama, slug, status: "trial", plan: "trial", trial_ends_at: trialEnds })
    .select("id")
    .single();
  if (error || !t) return;

  if (email) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const { data: invited, error: invErr } = await sb.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${appUrl}/auth/callback?next=/admin`,
      });
      if (!invErr && invited?.user) {
        await sb.from("profiles").upsert({
          id: invited.user.id,
          nama: `${nama} Admin`,
          emel: email,
          role: "admin",
          org_id: t.id,
        });
      }
    } catch {
      /* jemputan gagal — tenant tetap dicipta */
    }
  }
  revalidatePath("/admin/owner");
}
