import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/supabaseServer";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import CreateTenantForm from "./CreateTenantForm";

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
  if (supabaseReady()) {
    const sb = createServiceClient();
    const { data } = await sb
      .from("tenants")
      .select("id, nama, slug, plan, status, trial_ends_at, created_at")
      .order("created_at", { ascending: false });
    tenants = (data || []) as TenantRow[];
  }
  const trialCount = tenants.filter((t) => t.status === "trial").length;
  const activeCount = tenants.filter((t) => t.status === "active").length;

  return (
    <div>
      <h1 className="h-display text-2xl">Kawalan Platform</h1>
      <p className="mt-1 text-sm text-ink/50">Panel owner — cipta & urus semua tenant.</p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-ink/10 bg-white p-4"><div className="text-xs uppercase tracking-wider text-ink/50">Jumlah tenant</div><div className="mt-1 font-display text-2xl font-semibold">{tenants.length}</div></div>
        <div className="rounded-xl border border-ink/10 bg-white p-4"><div className="text-xs uppercase tracking-wider text-ink/50">Trial aktif</div><div className="mt-1 font-display text-2xl font-semibold">{trialCount}</div></div>
        <div className="rounded-xl border border-ink/10 bg-white p-4"><div className="text-xs uppercase tracking-wider text-ink/50">Berbayar</div><div className="mt-1 font-display text-2xl font-semibold">{activeCount}</div></div>
      </div>

      <CreateTenantForm />

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-ink/40">
            <th className="px-4 py-3">Syarikat</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Pelan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Trial</th>
          </tr></thead>
          <tbody>
            {tenants.map((t) => {
              const dl = daysLeft(t.trial_ends_at);
              return (
                <tr key={t.id} className="border-t border-ink/10">
                  <td className="px-4 py-3 font-medium">{t.nama}</td>
                  <td className="px-4 py-3 font-mono text-ink/60">{t.slug}</td>
                  <td className="px-4 py-3 uppercase text-ink/60">{t.plan}</td>
                  <td className="px-4 py-3">{t.status}</td>
                  <td className="px-4 py-3 text-ink/60">{t.status === "trial" && dl !== null ? `${dl} hari` : "—"}</td>
                </tr>
              );
            })}
            {tenants.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-ink/40">Belum ada tenant. Cipta yang pertama di atas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
