"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { requireStaff } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string };

export async function addReview(nama: string, rating: number, ulasan: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!nama.trim()) return { ok: false, error: "Nama wajib." };
  const sb = createServiceClient();
  const { error } = await sb.from("reviews").insert({ nama: nama.trim(), rating, ulasan: ulasan.trim() || null, diterbitkan: false });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/ulasan");
  return { ok: true };
}

export async function togglePublishReview(id: string, diterbitkan: boolean): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { error } = await sb.from("reviews").update({ diterbitkan }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/ulasan");
  revalidatePath("/ulasan");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteReview(id: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { error } = await sb.from("reviews").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/ulasan");
  return { ok: true };
}
