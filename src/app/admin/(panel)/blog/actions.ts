"use server";
import { supabaseReady } from "@/lib/supabase";
import { createSupabaseServer, requireStaff } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string; id?: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || "artikel";
}

export async function createPost(): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const { count } = await sb.from("blog_posts").select("*", { count: "exact", head: true });
  const slug = `artikel-baru-${(count || 0) + 1}`;
  const { data, error } = await sb
    .from("blog_posts")
    .insert({ slug, tajuk: "Artikel Baru", diterbitkan: false })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/blog");
  return { ok: true, id: data.id };
}

export async function updatePost(
  id: string,
  patch: { tajuk?: string; slug?: string; ringkasan?: string; kandungan?: string; cover_url?: string; diterbitkan?: boolean }
): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const p = { ...patch };
  if (p.slug) p.slug = slugify(p.slug);
  const { error } = await sb.from("blog_posts").update(p).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { ok: true };
}

export async function deletePost(id: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const { error } = await sb.from("blog_posts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/blog");
  return { ok: true };
}
