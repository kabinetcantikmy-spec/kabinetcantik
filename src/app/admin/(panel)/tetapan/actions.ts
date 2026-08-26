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
