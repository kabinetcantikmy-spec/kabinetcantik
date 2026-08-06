"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string };

/** Submit ulasan awam melalui token (tiada auth). Guna service client + sahkan token. */
export async function submitPublicReview(token: string, nama: string, rating: number, ulasan: string): Promise<Res> {
  if (!supabaseReady()) return { ok: false, error: "Sistem tidak tersedia." };
  if (!token) return { ok: false, error: "Token tidak sah." };
  if (!nama.trim()) return { ok: false, error: "Sila isi nama." };
  const sb = createServiceClient();
  const { data: proj } = await sb.from("projects").select("id, review_done").eq("review_token", token).single();
  if (!proj) return { ok: false, error: "Pautan tidak sah atau telah tamat." };
  if (proj.review_done) return { ok: false, error: "Ulasan telah dihantar sebelum ini. Terima kasih!" };

  const r = Math.max(1, Math.min(5, Math.round(rating) || 5));
  const { error } = await sb.from("reviews").insert({
    project_id: proj.id,
    nama: nama.trim(),
    rating: r,
    ulasan: ulasan.trim() || null,
    diterbitkan: false, // moderasi dulu sebelum terbit
  });
  if (error) return { ok: false, error: error.message };
  await sb.from("projects").update({ review_done: true }).eq("id", proj.id);
  revalidatePath("/admin/ulasan");
  return { ok: true };
}
