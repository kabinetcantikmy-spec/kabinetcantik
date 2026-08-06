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

  const { data: sup } = await sb.from("suppliers").select("status").eq("id", ctx.supplierId).single();
  if (sup?.status !== "diluluskan") return { ok: false, error: "Akaun anda belum diluluskan." };

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
