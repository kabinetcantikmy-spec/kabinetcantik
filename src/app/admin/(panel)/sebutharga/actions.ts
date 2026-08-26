"use server";
import crypto from "crypto";
import { supabaseReady } from "@/lib/supabase";
import { createSupabaseServer, requireStaff } from "@/lib/supabaseServer";
import { sendEmail, emailShell } from "@/lib/email";
import { tenantBrand } from "@/lib/branding";
import { planForOrg } from "@/lib/planServer";
import { loadPricingConfig } from "@/lib/pricingServer";
import { waLink } from "@/lib/wa";
import { rm2 } from "@/lib/format";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string; id?: string; waLink?: string };

async function sstSettings(sb: ReturnType<typeof createSupabaseServer>) {
  const { data } = await sb.from("settings").select("key, value").in("key", ["sst_enabled", "sst_rate", "deposit_split"]);
  const map: Record<string, unknown> = {};
  (data || []).forEach((r: { key: string; value: unknown }) => (map[r.key] = r.value));
  return {
    sstEnabled: map.sst_enabled === true,
    sstRate: Number(map.sst_rate ?? 6),
    depositPct: Array.isArray(map.deposit_split) ? Number((map.deposit_split as number[])[0]) : 50,
  };
}

async function recalc(sb: ReturnType<typeof createSupabaseServer>, quotationId: string) {
  const { data: items } = await sb.from("quotation_items").select("jumlah").eq("quotation_id", quotationId);
  const subtotal = (items || []).reduce((s: number, i: { jumlah: number }) => s + (Number(i.jumlah) || 0), 0);
  const { data: q } = await sb.from("quotations").select("diskaun").eq("id", quotationId).single();
  const diskaun = Number(q?.diskaun) || 0;
  const { sstEnabled, sstRate } = await sstSettings(sb);
  const taxable = Math.max(0, subtotal - diskaun);
  const cukai = sstEnabled ? (taxable * sstRate) / 100 : 0;
  const jumlah = taxable + cukai;
  await sb.from("quotations").update({ subtotal, cukai, jumlah }).eq("id", quotationId);
}

export async function createQuotationForLead(leadId: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const { count } = await sb.from("quotations").select("*", { count: "exact", head: true });
  const seq = String((count || 0) + 1).padStart(4, "0");
  const noQuote = `SH-${new Date().getFullYear()}-${seq}`;
  const { depositPct } = await sstSettings(sb);
  const { data, error } = await sb
    .from("quotations")
    .insert({ lead_id: leadId, no_quote: noQuote, status: "draft", deposit_pct: depositPct })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  // Pre-isi item dari jawapan wizard lead (jika ada). Harga diambil dari katalog Bahan & Harga.
  try {
    const { data: lead } = await sb.from("leads").select("jawapan_wizard").eq("id", leadId).single();
    const wiz = (lead?.jawapan_wizard || {}) as { tier?: string; qtys?: Record<string, number> };
    if (wiz.qtys && wiz.tier) {
      const cfg = await loadPricingConfig();
      const { data: mats } = await sb.from("materials").select("kategori, tier, unit, harga_unit");
      const materials = (mats || []) as { kategori: string; tier: string; unit: string; harga_unit: number }[];
      const tier = String(wiz.tier);
      const rows: Record<string, unknown>[] = [];
      let urutan = 0;
      for (const [catKey, qtyRaw] of Object.entries(wiz.qtys)) {
        const qty = Number(qtyRaw) || 0;
        if (qty <= 0) continue;
        const cat = cfg.categories.find((c) => c.key === catKey);
        const nama = cat?.name || catKey;
        const unit = cat?.unit || "kaki lari";
        const mat = materials.find((m) => m.kategori === nama && m.tier === tier);
        const harga = mat ? Number(mat.harga_unit) : 0;
        rows.push({
          quotation_id: data.id,
          kategori: nama,
          keterangan: `${nama} — ${tier}`,
          material_tier: tier,
          kuantiti: qty,
          unit: mat?.unit || unit,
          harga_unit: harga,
          jumlah: qty * harga,
          urutan: urutan++,
        });
      }
      if (rows.length) {
        await sb.from("quotation_items").insert(rows);
        await recalc(sb, data.id);
      }
    }
  } catch {
    // pre-isi optional — jangan gagalkan penciptaan sebut harga
  }

  await sb.from("lead_activity").insert({ lead_id: leadId, jenis: "quote", mesej: `Sebut harga ${noQuote} dicipta` });
  revalidatePath("/admin/sebutharga");
  return { ok: true, id: data.id };
}

export async function addItem(quotationId: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const { error } = await sb.from("quotation_items").insert({
    quotation_id: quotationId,
    keterangan: "Item baru",
    kuantiti: 1,
    unit: "kaki lari",
    harga_unit: 0,
    jumlah: 0,
  });
  if (error) return { ok: false, error: error.message };
  await recalc(sb, quotationId);
  revalidatePath(`/admin/sebutharga/${quotationId}`);
  return { ok: true };
}

export async function updateItem(
  itemId: string,
  quotationId: string,
  patch: { keterangan?: string; kategori?: string; material_tier?: string; kuantiti?: number; unit?: string; harga_unit?: number }
): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const { data: cur } = await sb.from("quotation_items").select("kuantiti, harga_unit").eq("id", itemId).single();
  const kuantiti = patch.kuantiti ?? Number(cur?.kuantiti) ?? 1;
  const harga = patch.harga_unit ?? Number(cur?.harga_unit) ?? 0;
  const jumlah = kuantiti * harga;
  const { error } = await sb.from("quotation_items").update({ ...patch, jumlah }).eq("id", itemId);
  if (error) return { ok: false, error: error.message };
  await recalc(sb, quotationId);
  revalidatePath(`/admin/sebutharga/${quotationId}`);
  return { ok: true };
}

export async function removeItem(itemId: string, quotationId: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  await sb.from("quotation_items").delete().eq("id", itemId);
  await recalc(sb, quotationId);
  revalidatePath(`/admin/sebutharga/${quotationId}`);
  return { ok: true };
}

export async function updateQuoteMeta(
  quotationId: string,
  patch: { diskaun?: number; deposit_pct?: number; nota?: string }
): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const { error } = await sb.from("quotations").update(patch).eq("id", quotationId);
  if (error) return { ok: false, error: error.message };
  await recalc(sb, quotationId);
  revalidatePath(`/admin/sebutharga/${quotationId}`);
  return { ok: true };
}

/** Hantar sebut harga: jana share_token, email + WA link ke pelanggan, tanda 'sent'. */
export async function sendQuotation(quotationId: string): Promise<Res> {
  const staff = await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const brand = await tenantBrand(staff.orgId);
  const { features: planFeat } = await planForOrg(staff.orgId);
  if (!planFeat.sendBrandedQuote) return { ok: false, error: "Hantar quote berjenama tersedia untuk pakej Hero ke atas." };
  const { data: q } = await sb
    .from("quotations")
    .select("id, no_quote, jumlah, status, share_token, leads(nama, telefon, emel)")
    .eq("id", quotationId)
    .single();
  if (!q) return { ok: false, error: "Sebut harga tidak dijumpai." };
  const lead = (q as unknown as { leads?: { nama: string; telefon: string; emel: string | null } }).leads;

  const token = q.share_token || crypto.randomUUID();
  await sb.from("quotations").update({ share_token: token, status: q.status === "draft" ? "sent" : q.status }).eq("id", quotationId);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${appUrl}/q/${token}`;
  const msg = `Hai ${lead?.nama || ""}, sebut harga ${q.no_quote} (${rm2(Number(q.jumlah))}) anda sedia. Lihat & terima di sini: ${link}`;

  if (lead?.emel) {
    await sendEmail({
      to: lead.emel,
      fromName: brand.nama,
      subject: `Sebut harga ${q.no_quote} — ${brand.nama}`,
      html: emailShell(
        "Sebut harga anda sedia",
        `Terima kasih atas minat anda. Klik untuk lihat & terima sebut harga:<br><br>
         <a href="${link}" style="background:#AE873B;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Lihat Sebut Harga</a><br><br>Jumlah: <b>${rm2(Number(q.jumlah))}</b>`,
        brand.nama
      ),
    });
  }
  const wa = lead?.telefon ? waLink(lead.telefon, msg) : undefined;
  revalidatePath(`/admin/sebutharga/${quotationId}`);
  return { ok: true, waLink: wa };
}

/** Buat versi baru (semakan) — salin quotation + item, versi+1, status draft. */
export async function reviseQuotation(quotationId: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const { data: q } = await sb.from("quotations").select("*").eq("id", quotationId).single();
  if (!q) return { ok: false, error: "Sebut harga tidak dijumpai." };

  const baseNo = String(q.no_quote).replace(/-R\d+$/, "");
  const newVersi = (Number(q.versi) || 1) + 1;
  const { data: nq, error } = await sb
    .from("quotations")
    .insert({
      lead_id: q.lead_id,
      customer_id: q.customer_id,
      no_quote: `${baseNo}-R${newVersi}`,
      versi: newVersi,
      status: "draft",
      subtotal: q.subtotal,
      diskaun: q.diskaun,
      cukai: q.cukai,
      jumlah: q.jumlah,
      deposit_pct: q.deposit_pct,
      nota: q.nota,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  const { data: items } = await sb.from("quotation_items").select("*").eq("quotation_id", quotationId);
  for (const it of (items || []) as Record<string, unknown>[]) {
    await sb.from("quotation_items").insert({
      quotation_id: nq.id,
      kategori: it.kategori,
      keterangan: it.keterangan,
      material_tier: it.material_tier,
      kuantiti: it.kuantiti,
      unit: it.unit,
      harga_unit: it.harga_unit,
      jumlah: it.jumlah,
      urutan: it.urutan,
    });
  }
  revalidatePath("/admin/sebutharga");
  return { ok: true, id: nq.id };
}

export async function setQuoteStatus(quotationId: string, status: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const patch: Record<string, unknown> = { status };
  if (status === "accepted") patch.accepted_at = new Date().toISOString();
  const { error } = await sb.from("quotations").update(patch).eq("id", quotationId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/sebutharga/${quotationId}`);
  revalidatePath("/admin/sebutharga");
  return { ok: true };
}
