import { supabaseReady, createServiceClient } from "@/lib/supabase";
import { createSupabaseServer, requireStaff } from "@/lib/supabaseServer";
import { Lead } from "@/lib/crm";
import KanbanBoard from "@/components/admin/KanbanBoard";
import LeadCreate from "@/components/admin/LeadCreate";

export const dynamic = "force-dynamic";

type LeadRow = Lead & { org_id?: string | null };

async function getLeads(): Promise<LeadRow[]> {
  if (!supabaseReady()) return [];
  const sb = createSupabaseServer();
  const { data } = await sb.from("leads").select("*").order("created_at", { ascending: false });
  return (data || []) as LeadRow[];
}

export default async function LeadsPage() {
  const me = await requireStaff();
  const rows = await getLeads();

  // Untuk platform admin (god-view merentas tenant), labelkan setiap lead
  // dengan nama tenant asalnya. Tenant biasa tak perlu — semua lead org sendiri.
  let leads: (Lead & { tenantName?: string | null })[] = rows;
  if (me.isPlatformAdmin && rows.length && supabaseReady()) {
    const svc = createServiceClient();
    const { data: tenants } = await svc.from("tenants").select("id, nama");
    const nameByOrg = new Map<string, string>((tenants || []).map((t) => [t.id as string, (t.nama as string) || ""]));
    leads = rows.map((l) => ({ ...l, tenantName: l.org_id ? nameByOrg.get(l.org_id) || null : null }));
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h-display text-2xl">Leads / Pipeline</h1>
          <p className="mt-1 text-sm text-ink/50">Seret kad untuk tukar peringkat.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink/40">{leads.length} lead</span>
          <a href="/api/export/leads" className="text-sm text-brass hover:underline">Export CSV</a>
        </div>
      </div>

      {supabaseReady() && (
        <div className="mt-4">
          <LeadCreate />
        </div>
      )}

      {!supabaseReady() ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
          Supabase belum dikonfigurasi. Lead dari Quote Wizard akan muncul di sini bila <code>.env.local</code> diisi.
        </div>
      ) : leads.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
          Belum ada lead. Lead baru dari borang awam akan masuk automatik.
        </div>
      ) : (
        <div className="mt-6">
          <KanbanBoard leads={leads} />
        </div>
      )}
    </div>
  );
}
