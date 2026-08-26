import { supabaseReady } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabaseServer";
import PortfolioEditor, { PortfolioRow } from "@/components/admin/PortfolioEditor";

export const dynamic = "force-dynamic";

export default async function PortfolioAdminPage() {
  let items: PortfolioRow[] = [];
  if (supabaseReady()) {
    const sb = createSupabaseServer();
    const { data } = await sb.from("portfolio").select("*, portfolio_images(id, url)").order("created_at", { ascending: false });
    items = (data || []) as PortfolioRow[];
  }
  return (
    <div>
      <h1 className="h-display text-2xl">Portfolio CMS</h1>
      <p className="mt-1 text-sm text-ink/50">Urus projek yang dipaparkan di gallery awam & case study.</p>
      {!supabaseReady() ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">Supabase belum dikonfigurasi.</div>
      ) : (
        <div className="mt-6"><PortfolioEditor items={items} /></div>
      )}
    </div>
  );
}
