import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { PLAN_FEATURES, Plan } from "@/lib/plan";

// ============================================================
// Lead Marketplace — helper server (service-role sahaja).
// Kolam pusat marketplace_leads → tuntutan eksklusif via lead_claims.
// ============================================================

/** Papar nama SEBAHAGIAN sahaja sebelum lead dibuka. "Ahmad Rizal" → "Ahmad R." */
export function maskName(n: string | null | undefined): string {
  const parts = (n || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Pelanggan";
  if (parts.length > 1) return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
  const w = parts[0];
  return w.length <= 3 ? w : `${w.slice(0, 3)}●●`;
}

export interface BoardLead {
  id: string;
  namaMasked: string;
  poskod: string | null;
  kawasan: string | null;
  kategori: string | null;
  bajet: string | null;
  timeline: string | null;
  keterangan: string | null;
  createdAt: string;
}

interface RawLead {
  id: string; nama: string; poskod: string | null; kawasan: string | null;
  kategori: string | null; bajet: string | null; timeline: string | null;
  keterangan: string | null; created_at: string;
}

/** Senarai lead 'available' untuk papan tuntut. Telefon/emel/nama penuh TAK dihantar. */
export async function listAvailableLeads(limit = 60): Promise<BoardLead[]> {
  if (!supabaseReady()) return [];
  const sb = createServiceClient();
  const { data } = await sb
    .from("marketplace_leads")
    .select("id, nama, poskod, kawasan, kategori, bajet, timeline, keterangan, created_at")
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = (data || []) as RawLead[];
  return rows.map((r) => ({
    id: r.id,
    namaMasked: maskName(r.nama),
    poskod: r.poskod,
    kawasan: r.kawasan,
    kategori: r.kategori,
    bajet: r.bajet,
    timeline: r.timeline,
    keterangan: r.keterangan,
    createdAt: r.created_at,
  }));
}

export interface LeadUsage { used: number; limit: number; left: number }

/** Kiraan lead dibuka bulan kalendar semasa vs kuota pakej. */
export async function leadUsage(orgId: string | null | undefined, plan: Plan): Promise<LeadUsage> {
  const limit = PLAN_FEATURES[plan]?.leadQuota ?? 0;
  if (!orgId || !supabaseReady()) return { used: 0, limit, left: limit };
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const sb = createServiceClient();
  const { count } = await sb
    .from("lead_claims")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gte("claimed_at", monthStart)
    .in("source", ["free", "quota"]);
  const used = count || 0;
  return { used, limit, left: Math.max(0, limit - used) };
}

export interface ClaimResult {
  ok: boolean;
  error?: string;
  taken?: boolean; // lead sudah dibuka orang lain
  quotaHabis?: boolean;
  lead?: { nama: string; telefon: string; emel: string | null; poskod: string | null; kawasan: string | null };
  crmLeadId?: string;
}

/** Tuntut satu lead — atomik & eksklusif. Salin ke CRM tenant + dedah contact. */
export async function claimLead(opts: {
  orgId: string; userId: string; staffName: string; leadId: string; plan: Plan;
}): Promise<ClaimResult> {
  const { orgId, userId, staffName, leadId, plan } = opts;
  if (!supabaseReady()) return { ok: false, error: "Sistem tidak tersedia." };
  const sb = createServiceClient();

  // 1) Kuota (had lembut)
  const usage = await leadUsage(orgId, plan);
  if (usage.left <= 0) return { ok: false, quotaHabis: true, error: "Kuota lead bulan ini sudah habis." };

  // 2) Lead mesti masih 'available'
  const { data: lead } = await sb
    .from("marketplace_leads")
    .select("id, nama, telefon, emel, poskod, kawasan, kategori, bajet, timeline, keterangan, status")
    .eq("id", leadId)
    .maybeSingle();
  if (!lead) return { ok: false, error: "Lead tidak dijumpai." };
  if ((lead.status as string) !== "available") return { ok: false, taken: true, error: "Lead ini sudah dibuka." };

  // 3) Rekod tuntutan DULU (UNIQUE marketplace_lead_id → jamin eksklusif walau race)
  const { error: claimErr } = await sb.from("lead_claims").insert({
    marketplace_lead_id: leadId,
    org_id: orgId,
    claimed_by: userId,
    source: "free",
  });
  if (claimErr) {
    // 23505 = unique violation → sudah dibuka kontraktor lain
    if ((claimErr as { code?: string }).code === "23505") return { ok: false, taken: true, error: "Lead ini baru sahaja dibuka orang lain." };
    return { ok: false, error: claimErr.message };
  }

  // 4) Tanda lead 'claimed'
  await sb.from("marketplace_leads").update({ status: "claimed" }).eq("id", leadId);

  // 5) Salin ke CRM tenant (leads)
  const { data: crm } = await sb
    .from("leads")
    .insert({
      org_id: orgId,
      nama: lead.nama,
      telefon: lead.telefon,
      emel: lead.emel || null,
      kategori: lead.kategori ? [lead.kategori] : [],
      timeline: lead.timeline || null,
      source: "marketplace",
      stage: "Baru",
    })
    .select("id")
    .single();
  const crmLeadId = crm?.id as string | undefined;
  if (crmLeadId) {
    await sb.from("lead_claims").update({ crm_lead_id: crmLeadId }).eq("marketplace_lead_id", leadId);
    const nota = [
      "🎯 Lead dari Leads Pasaran (KabinetCantik).",
      lead.poskod ? `Poskod: ${lead.poskod}${lead.kawasan ? " · " + lead.kawasan : ""}` : (lead.kawasan ? `Kawasan: ${lead.kawasan}` : ""),
      lead.bajet ? `Bajet: ${lead.bajet}` : "",
      lead.keterangan ? `Nota pelanggan: ${lead.keterangan}` : "",
    ].filter(Boolean).join("\n");
    await sb.from("lead_activity").insert({ lead_id: crmLeadId, oleh: staffName, jenis: "note", mesej: nota });
  }

  return {
    ok: true,
    crmLeadId,
    lead: { nama: lead.nama, telefon: lead.telefon, emel: lead.emel || null, poskod: lead.poskod, kawasan: lead.kawasan },
  };
}
