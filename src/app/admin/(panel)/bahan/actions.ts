"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { requireStaff } from "@/lib/supabaseServer";
import { PRICING } from "@/lib/pricing";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string };

export async function addMaterial(): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { error } = await sb.from("materials").insert({
    kategori: "Kabinet Dapur",
    nama: "Bahan baru",
    tier: "standard",
    unit: "kaki lari",
    harga_unit: 0,
    aktif: true,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/bahan");
  return { ok: true };
}

export async function updateMaterial(
  id: string,
  patch: { kategori?: string; nama?: string; tier?: string; unit?: string; harga_unit?: number; aktif?: boolean }
): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { error } = await sb.from("materials").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/bahan");
  return { ok: true };
}

export async function deleteMaterial(id: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { error } = await sb.from("materials").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/bahan");
  return { ok: true };
}

/** Isi katalog dari config placeholder (pricing.ts) — 1 baris per kategori×tier. */
export async function seedFromConfig(): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const rows = PRICING.categories.flatMap((c) =>
    (["economy", "standard", "premium"] as const).map((t) => ({
      kategori: c.name,
      nama: `${c.name} — ${t}`,
      tier: t,
      unit: c.unit,
      harga_unit: c[t],
      aktif: true,
    }))
  );
  const { error } = await sb.from("materials").insert(rows);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/bahan");
  return { ok: true };
}
