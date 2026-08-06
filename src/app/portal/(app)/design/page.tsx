import { requireCustomer } from "@/lib/supabaseServer";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { Design } from "@/lib/portal";
import DesignCard from "@/components/portal/DesignCard";

export const dynamic = "force-dynamic";

export default async function DesignPage() {
  const cust = await requireCustomer();
  let designs: Design[] = [];
  if (supabaseReady()) {
    const sb = createServiceClient();
    const { data: projects } = await sb.from("projects").select("id").eq("customer_id", cust.customerId);
    const ids = (projects || []).map((p: { id: string }) => p.id);
    if (ids.length) {
      const { data } = await sb.from("project_designs").select("*").in("project_id", ids).order("created_at", { ascending: false });
      designs = (data || []) as Design[];
    }
  }

  return (
    <div>
      <h1 className="h-display text-2xl">Reka Bentuk</h1>
      <p className="mt-1 text-sm text-ink/50">Semak render, luluskan atau minta perubahan.</p>
      {designs.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
          Belum ada reka bentuk untuk disemak.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {designs.map((d) => <DesignCard key={d.id} d={d} />)}
        </div>
      )}
    </div>
  );
}
