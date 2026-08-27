import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/supabaseServer";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import CreateTenantForm from "./CreateTenantForm";
import { setTenantPlan } from "./actions";

export const dynamic = "force-dynamic";

interface TenantRow {
  id: string;
  nama: string;
  slug: string;
  plan: string;
  status: string;
  trial_ends_at: string | null;
  created_at: string;
}

function daysLeft(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 3600 * 1000));
}

export default async function OwnerPage() {
  const staff = await requireStaff();
  if (!staff.isPlatformAdmin) redirect("/admin?e=owner");

  let tenants: TenantRow[] = [];
  const stats: Record<string, { leads: number; leadsMonth: number; projek: number; nilai: number }> = {};
  if (supabaseReady()) {
    const sb = createServiceClient();
    const { data } = await sb
      .from("tenants")
      .select("id, nama, slug, plan, status, trial_ends_at, created_at")
      .order("created_at", { ascending: false });
    tenants = (data || []) as TenantRow[];

    // Aggregate lead + nilai projek per tenant (dari data sedia ada, tiada duplicate)
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const [{ data: leadRows }, { data: projRows }] = await Promise.all([
      sb.from("leads").select("org_id, created_at"),
      sb.from("projects").select("org_id, nilai_kontrak"),
    ]);
    for (const r of (leadRows || []) as { org_id: string | null; created_at: string }[]) {
      if (!r.org_id) continue;
      const a = (stats[r.org_id] ||= { leads: 0, leadsMonth: 0, projek: 0, nilai: 0 });
      a.leads++;
      if (r.created_at >= monthStart) a.leadsMonth++;
    }
    for (const r of (projRows || []) as { org_id: string | null; nilai_kontrak: number | null }[]) {
      if (!r.org_id) continue;
      const a = (stats[r.org_id] ||= { leads: 0, leadsMonth: 0, projek: 0, nilai: 0 });
      a.projek++;
      a.nilai += Number(r.nilai_kontrak) || 0;
    }
  }
  const totalLeads = Object.values(stats).reduce((n, a) => n + a.leads, 0);
  const totalNilai = Object.values(stats).reduce((n, a) => n + a.nilai, 0);
  const ranked = [...tenants].sort((x, y) => (stats[y.id]?.leads || 0) - (stats[x.id]?.leads || 0));
  const trialCount = tenants.filter((t) => t.status === "trial").length;
  const activeCount = tenants.filter((t) => t.status === "active").length;

  return (
    <div>
      <h1 className="h-display text-2xl">Kawalan Platform</h1>
      <p className="mt-1 text-sm text-ink/50">Panel owner — cipta & urus semua tenant.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-ink/10 bg-white p-4"><div className="text-xs uppercase tracking-wider text-ink/50">Jumlah tenant</div><div className="mt-1 font-display text-2xl font-semibold">{tenants.length}</div></div>
        <div className="rounded-xl border border-ink/10 bg-white p-4"><div className="text-xs uppercase tracking-wider text-ink/50">Trial aktif</div><div className="mt-1 font-display text-2xl font-semibold">{trialCount}</div></div>
        <div className="rounded-xl border border-ink/10 bg-white p-4"><div className="text-xs uppercase tracking-wider text-ink/50">Berbayar</div><div className="mt-1 font-display text-2xl font-semibold">{activeCount}</div></div>
        <div className="rounded-xl border border-ink/10 bg-white p-4"><div className="text-xs uppercase tracking-wider text-ink/50">Jumlah lead</div><div className="mt-1 font-display text-2xl font-semibold">{totalLeads}</div></div>
        <div className="rounded-xl border border-ink/10 bg-white p-4"><div className="text-xs uppercase tracking-wider text-ink/50">Nilai projek</div><div className="mt-1 font-display text-2xl font-semibold">RM{Math.round(totalNilai).toLocaleString("en-MY")}</div></div>
      </div>

      <CreateTenantForm />

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-ink/40">
            <th className="px-4 py-3">Syarikat</th><th className="px-4 py-3">Leads</th><th className="px-4 py-3">Bln ini</th><th className="px-4 py-3">Projek</th><th className="px-4 py-3">Nilai projek</th><th className="px-4 py-3">Pelan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Trial</th>
          </tr></thead>
          <tbody>
            {ranked.map((t) => {
              const a = stats[t.id] || { leads: 0, leadsMonth: 0, projek: 0, nilai: 0 };
              const dl = daysLeft(t.trial_ends_at);
              return (
                <tr key={t.id} className="border-t border-ink/10">
                  <td className="px-4 py-3"><div className="font-medium">{t.nama}</div><div className="font-mono text-[11px] text-ink/40">{t.slug}</div></td>
                  <td className="px-4 py-3 font-semibold">{a.leads}</td>
                  <td className="px-4 py-3 text-ink/60">{a.leadsMonth}</td>
                  <td className="px-4 py-3 text-ink/60">{a.projek}</td>
                  <td className="px-4 py-3 font-medium">RM{Math.round(a.nilai).toLocaleString("en-MY")}</td>
                  <td className="px-4 py-3">
                    <form action={setTenantPlan.bind(null, t.id)} className="flex items-center gap-1">
                      <select name="plan" defaultValue={t.plan} className="rounded border border-ink/15 bg-paper px-2 py-1 text-xs">
                        <option value="trial">Trial</option>
                        <option value="freemium">Freemium</option>
                        <option value="hero">Hero</option>
                        <option value="pro">Pro</option>
                        <option value="launch">Percuma (launch)</option>
                      </select>
                      <button className="rounded bg-ink px-2 py-1 text-xs text-off-white">Set</button>
                    </form>
                  </td>
                  <td className="px-4 py-3">{t.status}</td>
                  <td className="px-4 py-3 text-ink/60">{t.status === "trial" && dl !== null ? `${dl} hari` : "—"}</td>
                </tr>
              );
            })}
            {tenants.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-ink/40">Belum ada tenant. Cipta yang pertama di atas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
