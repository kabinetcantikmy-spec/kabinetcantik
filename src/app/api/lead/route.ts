import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { waSalesLink } from "@/lib/wa";
import { waLeadWelcome } from "@/lib/whatsapp";

export const runtime = "nodejs";

interface LeadPayload {
  nama?: string;
  telefon?: string;
  emel?: string;
  kategori?: string[];
  jawapan_wizard?: Record<string, unknown>;
  estimate?: { low: number; high: number } | null;
  photos?: string[];
  // honeypot anti-spam
  company?: string;
}

export async function POST(req: NextRequest) {
  let body: LeadPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // Honeypot: bot isi field tersembunyi → senyap terima tapi buang.
  if (body.company) return NextResponse.json({ ok: true });

  const nama = (body.nama || "").trim();
  const telefon = (body.telefon || "").trim();
  const emel = (body.emel || "").trim();
  if (!nama || !telefon || !emel) {
    return NextResponse.json({ error: "Nama, telefon & emel wajib." }, { status: 422 });
  }

  const est = body.estimate;
  const budgetMin = est?.low ?? null;
  const budgetMax = est?.high ?? null;

  // Simpan ke Supabase (jika dikonfigurasi). Kalau tak, teruskan supaya dev boleh test.
  if (supabaseReady()) {
    try {
      const sb = createServiceClient();
      const { data: inserted, error } = await sb
        .from("leads")
        .insert({
          nama,
          telefon,
          emel,
          source: "website",
          kategori: body.kategori || [],
          jawapan_wizard: body.jawapan_wizard || {},
          budget_min: budgetMin,
          budget_max: budgetMax,
          stage: "Baru",
        })
        .select("id")
        .single();
      if (error) throw error;

      // Duplicate guard: telefon sama dalam 30 hari
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await sb
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("telefon", telefon)
        .gte("created_at", since)
        .neq("id", inserted.id);
      if ((count || 0) > 0) {
        await sb.from("lead_activity").insert({
          lead_id: inserted.id,
          jenis: "note",
          mesej: `⚠️ Kemungkinan duplikasi — ${count} lead lain dengan telefon sama dalam 30 hari.`,
        });
      }

      // Simpan gambar ruang (jika ada) ke lead_files
      if (Array.isArray(body.photos) && body.photos.length) {
        await sb.from("lead_files").insert(
          body.photos.slice(0, 5).map((url) => ({ lead_id: inserted.id, url, jenis: "gambar_ruang" }))
        );
      }

      // WhatsApp sapaan automatik (jika automasi on)
      await waLeadWelcome(telefon, nama, inserted.id);
    } catch (e) {
      console.error("Lead insert failed:", e);
      // Jangan gagalkan UX pelanggan — tetap pulangkan wa link.
    }
  }

  // Mesej WhatsApp untuk sales follow-up (satu-klik).
  const estText = est ? ` Anggaran: RM${est.low.toLocaleString()}–RM${est.high.toLocaleString()}.` : "";
  const waLink = waSalesLink(
    `Lead baru KabinetCantik:\nNama: ${nama}\nTel: ${telefon}\nKategori: ${(body.kategori || []).join(", ")}.${estText}`
  );

  return NextResponse.json({ ok: true, waLink });
}
