import { createServiceClient, supabaseReady } from "@/lib/supabase";

const BUCKET = process.env.SUPABASE_DOCS_BUCKET || "dokumen";

/**
 * Hasilkan signed URL untuk dokumen sulit dalam Supabase Storage.
 * `path` = laluan dalam bucket (cth "invois/INV-0001.pdf").
 * Kembali null jika gagal / tak dikonfigurasi.
 */
export async function signDocUrl(path: string, expiresIn = 60 * 10): Promise<string | null> {
  if (!supabaseReady() || !path) return null;
  const sb = createServiceClient();
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl || null;
}

/** Adakah nilai ini laluan storage (bukan URL penuh)? */
export function isStoragePath(v: string | null | undefined): boolean {
  if (!v) return false;
  return !/^https?:\/\//i.test(v);
}
