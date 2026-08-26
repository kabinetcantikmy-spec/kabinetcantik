import { createSupabaseServer, requireCustomer } from "@/lib/supabaseServer";
import { supabaseReady } from "@/lib/supabase";
import { WarrantyClaim } from "@/lib/portal";
import { fmtDate } from "@/lib/format";
import WarrantyForm, { ProjectOpt } from "@/components/portal/WarrantyForm";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = { baru: "Baru", dalam_proses: "Dalam proses", selesai: "Selesai" };

export default async function WarrantiPage() {
  const cust = await requireCustomer();
  let projects: ProjectOpt[] = [];
  let claims: WarrantyClaim[] = [];
  if (supabaseReady()) {
    const sb = createSupabaseServer();
    const { data: pr } = await sb.from("projects").select("id, tajuk").eq("customer_id", cust.customerId);
    projects = (pr || []) as ProjectOpt[];
    const ids = projects.map((p) => p.id);
    if (ids.length) {
      const { data } = await sb.from("warranty_claims").select("*").in("project_id", ids).order("created_at", { ascending: false });
      claims = (data || []) as WarrantyClaim[];
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div>
        <h1 className="h-display text-2xl">Warranti</h1>
        <p className="mt-1 text-sm text-ink/50">Buat tuntutan jika ada masalah dengan kabinet anda.</p>
        <div className="mt-4">
          <WarrantyForm projects={projects} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Tuntutan anda</h2>
        <div className="mt-3 space-y-3">
          {claims.map((c) => (
            <div key={c.id} className="rounded-xl border border-ink/10 bg-white p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink/40">{fmtDate(c.created_at)}</span>
                <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink/60">{STATUS_LABEL[c.status] || c.status}</span>
              </div>
              <p className="mt-1 text-ink/80">{c.keterangan}</p>
              {c.tindakan && <p className="mt-1 text-xs text-green-700">Tindakan: {c.tindakan}</p>}
            </div>
          ))}
          {claims.length === 0 && <p className="text-sm text-ink/40">Belum ada tuntutan.</p>}
        </div>
      </div>
    </div>
  );
}
