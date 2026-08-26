"use server";
import { supabaseReady } from "@/lib/supabase";
import { createSupabaseServer, requireStaff } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string; id?: string };

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "projek";
}

export async function createPortfolio(): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const { count } = await sb.from("portfolio").select("*", { count: "exact", head: true });
  const { data, error } = await sb
    .from("portfolio")
    .insert({ slug: `projek-baru-${(count || 0) + 1}`, tajuk: "Projek Baru", kategori: "dapur", diterbitkan: false })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/portfolio");
  return { ok: true, id: data.id };
}

export async function updatePortfolio(
  id: string,
  patch: { tajuk?: string; slug?: string; kategori?: string; gaya?: string[]; cover_url?: string; kawasan?: string; bahan?: string[]; keterangan?: string; featured?: boolean; diterbitkan?: boolean }
): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const p = { ...patch };
  if (p.slug) p.slug = slugify(p.slug);
  const { error } = await sb.from("portfolio").update(p).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  return { ok: true };
}

export async function deletePortfolio(id: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const { error } = await sb.from("portfolio").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/portfolio");
  return { ok: true };
}

export async function addPortfolioImage(portfolioId: string, url: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!url.trim()) return { ok: false, error: "URL kosong." };
  const sb = createSupabaseServer();
  const { count } = await sb.from("portfolio_images").select("*", { count: "exact", head: true }).eq("portfolio_id", portfolioId);
  const { error } = await sb.from("portfolio_images").insert({ portfolio_id: portfolioId, url: url.trim(), urutan: count || 0 });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/portfolio");
  return { ok: true };
}

export async function removePortfolioImage(imageId: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  await sb.from("portfolio_images").delete().eq("id", imageId);
  revalidatePath("/admin/portfolio");
  return { ok: true };
}
