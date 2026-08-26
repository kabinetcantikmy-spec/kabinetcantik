"use server";
import { supabaseReady } from "@/lib/supabase";
import { createSupabaseServer, requireRole } from "@/lib/supabaseServer";
import { PricingConfig } from "@/lib/pricing";
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
