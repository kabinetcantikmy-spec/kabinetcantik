import { supabaseReady } from "@/lib/supabase";
import { requireStaff, createSupabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  await requireStaff();
  if (!supabaseReady()) return new Response("Supabase belum dikonfigurasi.", { status: 500 });
  const sb = createSupabaseServer();
  const { data } = await sb
    .from("quotations")
    .select("no_quote, status, subtotal, diskaun, cukai, jumlah, deposit_pct, created_at")
    .order("created_at", { ascending: false });
  const cols = ["no_quote", "status", "subtotal", "diskaun", "cukai", "jumlah", "deposit_pct", "created_at"];
  const rows = (data || []) as Record<string, unknown>[];
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="quotations.csv"' },
  });
}
