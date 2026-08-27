"use server";
import { supabaseReady, createServiceClient } from "@/lib/supabase";
import { createSupabaseServer, requireRole, requireStaff } from "@/lib/supabaseServer";
import { PricingConfig } from "@/lib/pricing";
import { planForOrg } from "@/lib/planServer";
import { HomepageConfig } from "@/lib/homepage";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string };

export async function savePricingConfig(config: PricingConfig): Promise<Res> {
  await requireRole(["admin"]);
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const rows = [
    { key: "pricing", value: config },
    { key: "public_range_pct", value: config.publicRangePct },
    { key: "deposit_split", value: config.depositSplit },
    { key: "sst_enabled", value: config.sstEnabled },
    { key: "sst_rate", value: config.sstRate },
  ];
  const { error } = await sb.from("settings").upsert(rows, { onConflict: "org_id,key" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/tetapan");
  revalidatePath("/sebut-harga");
  return { ok: true };
}

export async function setWaAutomation(enabled: boolean): Promise<Res> {
  await requireRole(["admin"]);
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const staff = await requireStaff();
  const { features } = await planForOrg(staff.orgId);
  if (enabled && !features.waAutomation) return { ok: false, error: "Automasi WhatsApp tersedia untuk pakej Hero ke atas." };
  const sb = createSupabaseServer();
  const { error } = await sb.from("settings").upsert({ key: "wa_automation_enabled", value: enabled }, { onConflict: "org_id,key" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/tetapan");
  return { ok: true };
}

export async function updateUserRole(userId: string, role: string): Promise<Res> {
  await requireRole(["admin"]);
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const { error } = await sb.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/tetapan");
  return { ok: true };
}

export async function saveHomepageConfig(config: HomepageConfig): Promise<Res> {
  await requireRole(["admin"]);
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const { error } = await sb.from("settings").upsert({ key: "homepage", value: config }, { onConflict: "org_id,key" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/tetapan");
  revalidatePath("/");
  revalidatePath("/hubungi");
  return { ok: true };
}

export async function saveBranding(input: { nama: string; logoUrl: string }): Promise<Res> {
  await requireRole(["admin"]);
  const staff = await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!staff.orgId) return { ok: false, error: "Tiada org untuk akaun ini." };
  const nama = (input.nama || "").trim();
  if (!nama) return { ok: false, error: "Nama syarikat wajib." };
  const sb = createServiceClient();
  // Kekalkan kunci branding sedia ada (cth warna), cuma kemas kini logo_url.
  const { data: cur } = await sb.from("tenants").select("branding").eq("id", staff.orgId).maybeSingle();
  const merged = { ...((cur?.branding as Record<string, unknown>) || {}), logo_url: input.logoUrl || "" };
  const { error } = await sb.from("tenants").update({ nama, branding: merged }).eq("id", staff.orgId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/tetapan");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function uploadBrandingLogo(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  const staff = await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!staff.orgId) return { ok: false, error: "Tiada org untuk akaun ini." };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Tiada fail dipilih." };
  if (file.size > 3 * 1024 * 1024) return { ok: false, error: "Saiz logo maksimum 3MB." };
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `branding/${staff.orgId}/logo-${Date.now()}.${ext}`;
  // Service-role — pintas storage RLS (admin authenticated tak diblok).
  const sb = createServiceClient();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await sb.storage.from("lead-photos").upload(path, bytes, {
    contentType: file.type || "image/png",
    upsert: true,
  });
  if (error) return { ok: false, error: error.message };
  const { data } = sb.storage.from("lead-photos").getPublicUrl(path);
  return { ok: true, url: data?.publicUrl };
}


export async function uploadHomepageImage(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  const staff = await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!staff.orgId) return { ok: false, error: "Tiada org untuk akaun ini." };
  const file = formData.get("file");
  const slotRaw = String(formData.get("slot") || "hero");
  const slot = slotRaw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 24) || "hero";
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Tiada fail dipilih." };
  if (file.size > 8 * 1024 * 1024) return { ok: false, error: "Saiz imej maksimum 8MB." };
  try {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `homepage/${staff.orgId}/${slot}-${Date.now()}.${ext}`;
    // Service-role — pintas storage RLS.
    const sb = createServiceClient();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await sb.storage.from("lead-photos").upload(path, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });
    if (error) return { ok: false, error: error.message };
    const { data } = sb.storage.from("lead-photos").getPublicUrl(path);
    return { ok: true, url: data?.publicUrl };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Muat naik imej gagal. Cuba imej lebih kecil." };
  }
}
