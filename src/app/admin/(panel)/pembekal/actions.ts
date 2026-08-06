"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { requireRole } from "@/lib/supabaseServer";
import { sendEmail, emailShell } from "@/lib/email";
import { rm2 } from "@/lib/format";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string };

export async function setSupplierStatus(supplierId: string, status: "diluluskan" | "ditolak"): Promise<Res> {
  await requireRole(["admin", "finance"]);
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { data: sup } = await sb.from("suppliers").select("nama, emel").eq("id", supplierId).single();
  const { error } = await sb.from("suppliers").update({ status }).eq("id", supplierId);
  if (error) return { ok: false, error: error.message };
  if (sup?.emel) {
    await sendEmail({
      to: sup.emel,
      subject: `Status pendaftaran pembekal — ${status === "diluluskan" ? "Diluluskan" : "Ditolak"}`,
      html: emailShell(
        status === "diluluskan" ? "Akaun anda diluluskan" : "Permohonan tidak diluluskan",
        status === "diluluskan"
          ? `Tahniah ${sup.nama || ""}! Anda kini boleh log masuk & hantar tuntutan di portal pembekal.`
          : `Maaf, permohonan anda tidak dapat diluluskan buat masa ini. Sila hubungi kami untuk maklumat lanjut.`
      ),
    });
  }
  revalidatePath("/admin/pembekal");
  return { ok: true };
}

/** Luluskan tuntutan → auto-jana baucer bayaran. */
export async function approveClaim(claimId: string): Promise<Res> {
  await requireRole(["admin", "finance"]);
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { data: claim } = await sb.from("supplier_claims").select("id, supplier_id, jumlah, status").eq("id", claimId).single();
  if (!claim) return { ok: false, error: "Tuntutan tidak dijumpai." };
  if (claim.status !== "baru") return { ok: false, error: "Tuntutan telah diproses." };

  const { count } = await sb.from("vouchers").select("*", { count: "exact", head: true });
  const noBaucer = `VCR-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, "0")}`;
  const { data: voucher, error: vErr } = await sb
    .from("vouchers")
    .insert({ claim_id: claim.id, supplier_id: claim.supplier_id, no_baucer: noBaucer, jumlah: claim.jumlah, status: "pending" })
    .select("id")
    .single();
  if (vErr) return { ok: false, error: vErr.message };

  await sb.from("supplier_claims").update({ status: "diluluskan", voucher_id: voucher.id }).eq("id", claimId);
  revalidatePath("/admin/pembekal");
  return { ok: true };
}

export async function rejectClaim(claimId: string): Promise<Res> {
  await requireRole(["admin", "finance"]);
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { error } = await sb.from("supplier_claims").update({ status: "ditolak" }).eq("id", claimId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/pembekal");
  return { ok: true };
}

export async function markVoucherPaid(voucherId: string): Promise<Res> {
  await requireRole(["admin", "finance"]);
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createServiceClient();
  const { data: v } = await sb.from("vouchers").select("id, claim_id, supplier_id, jumlah, no_baucer").eq("id", voucherId).single();
  if (!v) return { ok: false, error: "Baucer tidak dijumpai." };
  await sb.from("vouchers").update({ status: "dibayar", dibayar_pada: new Date().toISOString() }).eq("id", voucherId);
  if (v.claim_id) await sb.from("supplier_claims").update({ status: "dibayar" }).eq("id", v.claim_id);

  const { data: sup } = await sb.from("suppliers").select("emel, nama").eq("id", v.supplier_id).single();
  if (sup?.emel) {
    await sendEmail({
      to: sup.emel,
      subject: `Bayaran dibuat — ${v.no_baucer}`,
      html: emailShell("Bayaran dibuat", `Hai ${sup.nama || ""}, baucer <b>${v.no_baucer}</b> sebanyak <b>${rm2(Number(v.jumlah))}</b> telah dibayar. Terima kasih atas kerjasama anda.`),
    });
  }
  revalidatePath("/admin/pembekal");
  return { ok: true };
}
