"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { requireSupplier } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string };

export async function submitClaim(input: { butiran: string; jumlah: number; url_dokumen?: string }): Promise<Res> {
  const ctx = await requireSupplier();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!input.butiran.trim() || !input.jumlah || input.jumlah <= 0) return { ok: false, error: "Butiran & jumlah wajib." };
  const sb = createServiceClient();

  const { data: sup } = await sb.from("suppliers").select("status, profil_lengkap, jenis").eq("id", ctx.supplierId).single();
  if (sup?.profil_lengkap !== true) return { ok: false, error: "Lengkapkan profil KYB dahulu sebelum hantar tuntutan." };
  if (sup?.status !== "diluluskan") return { ok: false, error: "Akaun anda belum diluluskan." };
  if (sup?.jenis === "installer" && !(input.url_dokumen || "").trim()) return { ok: false, error: "Installer wajib lampirkan invois untuk tuntutan progress." };

  const { count } = await sb.from("supplier_claims").select("*", { count: "exact", head: true });
  const noTuntutan = `CLM-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, "0")}`;

  const { error } = await sb.from("supplier_claims").insert({
    supplier_id: ctx.supplierId,
    no_tuntutan: noTuntutan,
    butiran: input.butiran.trim(),
    jumlah: input.jumlah,
    url_dokumen: input.url_dokumen || null,
    status: "baru",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/pembekal");
  return { ok: true };
}

// KYB fields wajib untuk profil dikira "lengkap"
async function recomputeLengkap(sb: ReturnType<typeof createServiceClient>, supplierId: string) {
  const { data: r } = await sb
    .from("suppliers")
    .select("jenis, syarikat, no_ssm, alamat, pemilik, no_ic, bank, no_akaun, dok_ssm_url, dok_bank_url")
    .eq("id", supplierId)
    .single();
  // dok_ssm_url = dokumen identiti (Sijil SSM utk pembekal, salinan IC utk installer).
  const common = !!(r && r.alamat && r.pemilik && r.no_ic && r.bank && r.no_akaun && r.dok_ssm_url && r.dok_bank_url);
  const lengkap = r?.jenis === "installer"
    ? common                                    // installer: IC + bank; SSM/syarikat tak wajib
    : common && !!(r?.syarikat && r?.no_ssm);   // pembekal: + nama syarikat + No. SSM
  await sb.from("suppliers").update({ profil_lengkap: lengkap }).eq("id", supplierId);
  return lengkap;
}

export async function updateSupplierProfile(input: {
  syarikat: string;
  jenis_entiti: string;
  no_ssm: string;
  telefon: string;
  alamat: string;
  pemilik: string;
  no_ic: string;
  bank: string;
  no_akaun: string;
}): Promise<Res & { lengkap?: boolean }> {
  const ctx = await requireSupplier();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { error } = await sb.from("suppliers").update({
    syarikat: input.syarikat.trim() || null,
    jenis_entiti: input.jenis_entiti || null,
    no_ssm: input.no_ssm.trim() || null,
    telefon: input.telefon.trim() || null,
    alamat: input.alamat.trim() || null,
    pemilik: input.pemilik.trim() || null,
    no_ic: input.no_ic.trim() || null,
    bank: input.bank.trim() || null,
    no_akaun: input.no_akaun.trim() || null,
  }).eq("id", ctx.supplierId);
  if (error) return { ok: false, error: error.message };
  const lengkap = await recomputeLengkap(sb, ctx.supplierId);
  revalidatePath("/pembekal");
  return { ok: true, lengkap };
}

export async function uploadSupplierDoc(formData: FormData): Promise<{ ok: boolean; error?: string; lengkap?: boolean }> {
  const ctx = await requireSupplier();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const file = formData.get("file");
  const jenis = String(formData.get("jenis") || ""); // "ssm" | "bank"
  if (jenis !== "ssm" && jenis !== "bank") return { ok: false, error: "Jenis dokumen tidak sah." };
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Tiada fail dipilih." };
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: "Saiz dokumen maksimum 10MB." };
  const okType = file.type.startsWith("image/") || file.type === "application/pdf";
  if (!okType) return { ok: false, error: "Hanya gambar atau PDF dibenarkan." };
  try {
    const ext = (file.name.split(".").pop() || "pdf").toLowerCase().replace(/[^a-z0-9]/g, "") || "pdf";
    const path = `${ctx.supplierId}/${jenis}-${Date.now()}.${ext}`;
    const sb = createServiceClient();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await sb.storage.from("supplier-docs").upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });
    if (error) return { ok: false, error: error.message };
    const col = jenis === "ssm" ? "dok_ssm_url" : "dok_bank_url";
    await sb.from("suppliers").update({ [col]: path }).eq("id", ctx.supplierId);
    const lengkap = await recomputeLengkap(sb, ctx.supplierId);
    revalidatePath("/pembekal");
    return { ok: true, lengkap };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Muat naik gagal." };
  }
}

// Muat naik invois tuntutan (installer/pembekal) ke bucket privat; pulang PATH.
export async function uploadClaimDoc(formData: FormData): Promise<{ ok: boolean; error?: string; path?: string }> {
  const ctx = await requireSupplier();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Tiada fail dipilih." };
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: "Saiz maksimum 10MB." };
  const okType = file.type.startsWith("image/") || file.type === "application/pdf";
  if (!okType) return { ok: false, error: "Hanya gambar atau PDF dibenarkan." };
  try {
    const ext = (file.name.split(".").pop() || "pdf").toLowerCase().replace(/[^a-z0-9]/g, "") || "pdf";
    const path = `${ctx.supplierId}/invois-${Date.now()}.${ext}`;
    const sb = createServiceClient();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await sb.storage.from("supplier-docs").upload(path, bytes, { contentType: file.type || "application/octet-stream", upsert: true });
    if (error) return { ok: false, error: error.message };
    return { ok: true, path };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Muat naik gagal." };
  }
}
