"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { requireCustomer } from "@/lib/supabaseServer";
import { sendEmail, emailShell } from "@/lib/email";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string };

async function ownsProject(sb: ReturnType<typeof createServiceClient>, projectId: string, customerId: string) {
  const { data } = await sb.from("projects").select("id").eq("id", projectId).eq("customer_id", customerId).single();
  return Boolean(data);
}

/** Notifikasi kepada staf apabila pelanggan bertindak pada design. */
async function notifyStaff(sb: ReturnType<typeof createServiceClient>, projectId: string, nama: string, mesej: string) {
  const { data: proj } = await sb.from("projects").select("lead_id, tajuk").eq("id", projectId).single();
  if (proj?.lead_id) {
    await sb.from("lead_activity").insert({ lead_id: proj.lead_id, oleh: nama, jenis: "note", mesej });
  }
  const salesEmail = process.env.SALES_NOTIFY_EMAIL;
  if (salesEmail) {
    await sendEmail({ to: salesEmail, subject: `Tindakan pelanggan: ${proj?.tajuk || "Projek"}`, html: emailShell("Notifikasi Design", mesej) });
  }
}

export async function approveDesign(designId: string): Promise<Res> {
  const ctx = await requireCustomer();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { data: d } = await sb.from("project_designs").select("project_id").eq("id", designId).single();
  if (!d || !(await ownsProject(sb, d.project_id, ctx.customerId))) return { ok: false, error: "Tidak dibenarkan." };
  const { error } = await sb.from("project_designs").update({ status: "approved", komen: null }).eq("id", designId);
  if (error) return { ok: false, error: error.message };
  await notifyStaff(sb, d.project_id, ctx.nama, `${ctx.nama} telah MELULUSKAN reka bentuk.`);
  revalidatePath("/portal/design");
  return { ok: true };
}

export async function requestRevision(designId: string, komen: string): Promise<Res> {
  const ctx = await requireCustomer();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!komen.trim()) return { ok: false, error: "Sila nyatakan perubahan yang diminta." };
  const sb = createServiceClient();
  const { data: d } = await sb.from("project_designs").select("project_id").eq("id", designId).single();
  if (!d || !(await ownsProject(sb, d.project_id, ctx.customerId))) return { ok: false, error: "Tidak dibenarkan." };
  const { error } = await sb.from("project_designs").update({ status: "revision", komen: komen.trim() }).eq("id", designId);
  if (error) return { ok: false, error: error.message };
  await notifyStaff(sb, d.project_id, ctx.nama, `${ctx.nama} MINTA UBAH reka bentuk: "${komen.trim()}"`);
  revalidatePath("/portal/design");
  return { ok: true };
}

export async function submitWarranty(projectId: string, keterangan: string, urlGambar?: string): Promise<Res> {
  const ctx = await requireCustomer();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!keterangan.trim()) return { ok: false, error: "Sila terangkan masalah." };
  const sb = createServiceClient();
  if (!(await ownsProject(sb, projectId, ctx.customerId))) return { ok: false, error: "Tidak dibenarkan." };
  const { error } = await sb.from("warranty_claims").insert({
    project_id: projectId,
    keterangan: keterangan.trim(),
    url_gambar: urlGambar || null,
    status: "baru",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/portal/warranti");
  return { ok: true };
}
