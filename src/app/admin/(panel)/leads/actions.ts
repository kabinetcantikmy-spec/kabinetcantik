"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { requireStaff } from "@/lib/supabaseServer";
import { waStageUpdate } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

/** Cari lead lain dengan telefon sama dalam 30 hari (duplicate guard). */
async function findDuplicate(sb: ReturnType<typeof createServiceClient>, telefon: string, excludeId?: string): Promise<number> {
  if (!telefon) return 0;
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  let q = sb.from("leads").select("id", { count: "exact", head: true }).eq("telefon", telefon).gte("created_at", since);
  if (excludeId) q = q.neq("id", excludeId);
  const { count } = await q;
  return count || 0;
}

export async function createLead(input: { nama: string; telefon: string; emel?: string; kategori?: string[] }) {
  const staff = await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!input.nama.trim() || !input.telefon.trim()) return { ok: false, error: "Nama & telefon wajib." };
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("leads")
    .insert({
      nama: input.nama.trim(),
      telefon: input.telefon.trim(),
      emel: input.emel?.trim() || null,
      kategori: input.kategori || [],
      source: "manual",
      stage: "Baru",
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  const dup = await findDuplicate(sb, input.telefon.trim(), data.id);
  if (dup > 0) {
    await sb.from("lead_activity").insert({ lead_id: data.id, oleh: staff.nama, jenis: "note", mesej: `⚠️ Kemungkinan duplikasi — ${dup} lead lain dengan telefon sama dalam 30 hari.` });
  }
  revalidatePath("/admin/leads");
  return { ok: true, id: data.id };
}

export async function assignLead(leadId: string, assigneeId: string) {
  const staff = await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { error } = await sb.from("leads").update({ assignee_id: assigneeId || null }).eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  await sb.from("lead_activity").insert({ lead_id: leadId, oleh: staff.nama, jenis: "note", mesej: assigneeId ? "Lead ditugaskan." : "Tugasan dibuang." });
  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true };
}

export async function updateStage(leadId: string, stage: string) {
  const staff = await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { error } = await sb.from("leads").update({ stage }).eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  await sb.from("lead_activity").insert({
    lead_id: leadId,
    oleh: staff.nama,
    jenis: "status",
    mesej: `Tukar peringkat → ${stage}`,
  });
  // WhatsApp notifikasi peringkat (jika automasi on)
  const { data: lead } = await sb.from("leads").select("nama, telefon").eq("id", leadId).single();
  if (lead?.telefon) await waStageUpdate(lead.telefon, lead.nama || "", stage, leadId);
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true };
}

export async function addActivity(leadId: string, jenis: string, mesej: string) {
  const staff = await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!mesej.trim()) return { ok: false, error: "Mesej kosong." };
  const sb = createServiceClient();
  const { error } = await sb.from("lead_activity").insert({
    lead_id: leadId,
    oleh: staff.nama,
    jenis,
    mesej: mesej.trim(),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true };
}

export async function setFollowup(leadId: string, date: string) {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { error } = await sb.from("leads").update({ next_followup: date || null }).eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true };
}

export async function markLost(leadId: string, reason: string) {
  const staff = await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { error } = await sb
    .from("leads")
    .update({ stage: "Batal/Lost", lost_reason: reason || null })
    .eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  await sb.from("lead_activity").insert({
    lead_id: leadId,
    oleh: staff.nama,
    jenis: "status",
    mesej: `Ditanda Batal/Lost${reason ? ` — ${reason}` : ""}`,
  });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true };
}
