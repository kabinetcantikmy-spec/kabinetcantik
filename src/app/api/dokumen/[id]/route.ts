import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { requireCustomer } from "@/lib/supabaseServer";
import { signDocUrl, isStoragePath } from "@/lib/storage";

export const runtime = "nodejs";

/** Pulangkan (redirect) URL dokumen — signed jika ia laluan storage sulit. */
export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const ctx = await requireCustomer();
  if (!supabaseReady()) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 500 });
  const sb = createServiceClient();

  const { data: inv } = await sb
    .from("invoices")
    .select("pdf_url, projects(customer_id)")
    .eq("id", params.id)
    .single();
  const proj = (inv as unknown as { projects?: { customer_id: string } } | null)?.projects;
  if (!inv || !proj || proj.customer_id !== ctx.customerId) {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }
  if (!inv.pdf_url) return NextResponse.json({ error: "Tiada fail." }, { status: 404 });

  const target = isStoragePath(inv.pdf_url) ? await signDocUrl(inv.pdf_url) : inv.pdf_url;
  if (!target) return NextResponse.json({ error: "Gagal jana pautan." }, { status: 500 });
  return NextResponse.redirect(target);
}
