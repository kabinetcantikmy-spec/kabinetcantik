import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { requireCustomer } from "@/lib/supabaseServer";
import { createPurchase, chipReady } from "@/lib/chip";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ctx = await requireCustomer(); // redirect jika tidak log masuk
  if (!supabaseReady()) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 500 });
  if (!chipReady()) return NextResponse.json({ error: "CHIP belum dikonfigurasi." }, { status: 500 });

  let body: { paymentId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  if (!body.paymentId) return NextResponse.json({ error: "paymentId wajib." }, { status: 422 });

  const sb = createServiceClient();
  const { data: pay } = await sb
    .from("payments")
    .select("id, jenis, jumlah, status, project_id, projects(tajuk, customer_id, customers(nama, emel))")
    .eq("id", body.paymentId)
    .single();

  if (!pay) return NextResponse.json({ error: "Bayaran tidak dijumpai." }, { status: 404 });
  const project = (pay as unknown as { projects?: { tajuk: string; customer_id: string; customers?: { nama: string; emel: string } } }).projects;
  if (!project || project.customer_id !== ctx.customerId) {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }
  if (pay.status === "paid") return NextResponse.json({ error: "Sudah dibayar." }, { status: 409 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const result = await createPurchase({
    amount: Number(pay.jumlah),
    email: project.customers?.emel || ctx.emel,
    fullName: project.customers?.nama || ctx.nama,
    reference: pay.id,
    title: `${project.tajuk} — ${pay.jenis}`,
    successUrl: `${appUrl}/portal/bayaran?status=berjaya`,
    failureUrl: `${appUrl}/portal/bayaran?status=gagal`,
    callbackUrl: `${appUrl}/api/payments/webhook`,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });

  await sb.from("payments").update({ gateway_ref: result.id }).eq("id", pay.id);
  return NextResponse.json({ checkoutUrl: result.checkoutUrl });
}
