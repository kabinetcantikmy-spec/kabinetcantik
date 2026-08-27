"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";

type Res = { ok: boolean; error?: string };

/** Borang awam (kabinetcantik.com) → kolam lead pusat marketplace_leads. Tiada org. */
export async function submitMarketplaceLead(input: {
  nama: string; telefon: string; emel?: string; poskod: string; kawasan?: string;
  kategori: string; bajet?: string; timeline?: string; keterangan?: string; consent: boolean;
}): Promise<Res> {
  if (!supabaseReady()) return { ok: false, error: "Sistem tidak tersedia buat masa ini." };
  const nama = (input.nama || "").trim();
  const telefon = (input.telefon || "").trim();
  const poskod = (input.poskod || "").trim();
  const kategori = (input.kategori || "").trim();
  if (!nama || !telefon) return { ok: false, error: "Nama & nombor telefon wajib diisi." };
  if (!/^[0-9+\-\s]{8,15}$/.test(telefon)) return { ok: false, error: "Nombor telefon tak sah. Cth: 012-345 6789." };
  if (!/^\d{5}$/.test(poskod)) return { ok: false, error: "Poskod perlu 5 digit. Cth: 40150." };
  if (!kategori) return { ok: false, error: "Sila pilih jenis kerja." };
  if (!input.consent) return { ok: false, error: "Sila tanda persetujuan untuk kami hubungkan anda dengan kontraktor." };

  const sb = createServiceClient();

  // Dedup lembut: telefon sama & masih 'available' dalam 14 hari → jangan gandakan.
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await sb
    .from("marketplace_leads")
    .select("id", { count: "exact", head: true })
    .eq("telefon", telefon)
    .eq("status", "available")
    .gte("created_at", since);
  if ((count || 0) > 0) return { ok: true }; // sudah ada — anggap berjaya, elak duplikat

  const { error } = await sb.from("marketplace_leads").insert({
    nama,
    telefon,
    emel: (input.emel || "").trim() || null,
    poskod,
    kawasan: (input.kawasan || "").trim() || null,
    kategori,
    bajet: (input.bajet || "").trim() || null,
    timeline: (input.timeline || "").trim() || null,
    keterangan: (input.keterangan || "").trim() || null,
    status: "available",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
