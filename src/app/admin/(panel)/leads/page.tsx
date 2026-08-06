import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { Lead } from "@/lib/crm";
import KanbanBoard from "@/components/admin/KanbanBoard";
import LeadCreate from "@/components/admin/LeadCreate";

export const dynamic = "force-dynamic";

async function getLeads(): Promise<Lead[]> {
  if (!supabaseReady()) return [];
  const sb = createServiceClient();
  const { data } = await sb.from("leads").select("*").order("created_at", { ascending: false });
  return (data || []) as Lead[];
}

export default async function LeadsPage() {
  const leads = await getLeads();
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
