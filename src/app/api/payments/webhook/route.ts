import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { verifyWebhook } from "@/lib/chip";
import { sendEmail, emailShell } from "@/lib/email";
import { waPayment } from "@/lib/whatsapp";
import { rm2 } from "@/lib/format";

export const runtime = "nodejs";

// Peringkat projek selepas milestone dibayar.
const STAGE_AFTER: Record<string, string> = {
  deposit: "Fabrikasi",
  progress: "Pemasangan",
  final: "Siap",
};

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("X-Signature") || req.headers.get("x-signature");

  if (process.env.CHIP_WEBHOOK_PUBLIC_KEY && !verifyWebhook(raw, signature)) {
    return NextResponse.json({ error: "Signature tidak sah." }, { status: 401 });
  }

  let event: { id?: string; reference?: string; status?: string; event_type?: string };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const isPaid = event.status === "paid" || event.event_type === "purchase.paid";
  if (!isPaid) return NextResponse.json({ ok: true });
  if (!supabaseReady()) return NextResponse.json({ ok: true });

  const sb = createServiceClient();
  const purchaseId = event.id;
  const reference = event.reference;
  const q = sb.from("payments").select("id, jenis, jumlah, status, project_id").limit(1);
  const { data: rows } = purchaseId ? await q.eq("gateway_ref", purchaseId) : await q.eq("id", reference || "");
  const pay = rows?.[0];
  if (!pay) return NextResponse.json({ ok: true });
  if (pay.status === "paid") return NextResponse.json({ ok: true }); // idempotent

  const paidAt = new Date().toISOString();
  await sb.from("payments").update({ status: "paid", dibayar_pada: paidAt, gateway_ref: purchaseId || pay.id }).eq("id", pay.id);

  // 1) Auto-jana invois
  const { count } = await sb.from("invoices").select("*", { count: "exact", head: true });
  const noInvois = `INV-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, "0")}`;
  await sb.from("invoices").insert({ project_id: pay.project_id, no_invois: noInvois, jumlah: pay.jumlah, status: "paid" });

  // 2) Advance status projek
  const nextStage = STAGE_AFTER[pay.jenis];
  if (nextStage && pay.project_id) {
    const patch: Record<string, unknown> = { status: nextStage };
    if (pay.jenis === "final") {
      patch.warranty_until = new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().slice(0, 10);
    }
    await sb.from("projects").update(patch).eq("id", pay.project_id);
  }

  // 3) Email + WhatsApp resit ke pelanggan
  const { data: proj } = await sb.from("projects").select("tajuk, customers(nama, emel, telefon)").eq("id", pay.project_id).single();
  const cust = (proj as unknown as { customers?: { nama: string; emel: string | null; telefon: string | null } } | null)?.customers;
  if (cust?.emel) {
    await sendEmail({
      to: cust.emel,
      subject: `Resit bayaran diterima — ${noInvois}`,
      html: emailShell(
        "Bayaran diterima",
        `Terima kasih ${cust.nama || ""}. Kami telah menerima bayaran anda.<br><br>
         <b>Invois:</b> ${noInvois}<br><b>Jumlah:</b> ${rm2(Number(pay.jumlah))}<br><b>Status:</b> Dibayar ✓`
      ),
    });
  }
  if (cust?.telefon) await waPayment(cust.telefon, cust.nama || "", rm2(Number(pay.jumlah)));

  return NextResponse.json({ ok: true });
}
