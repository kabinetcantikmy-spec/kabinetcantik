import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { STAGES, STAGE_ACCENT, LOST } from "@/lib/crm";
import { rm } from "@/lib/format";

export const dynamic = "force-dynamic";

interface LeadRow {
  stage: string;
  budget_max: number | null;
  created_at: string;
  kategori: string[] | null;
}

async function getStats() {
  if (!supabaseReady()) return null;
  const sb = createServiceClient();
  const { data } = await sb.from("leads").select("stage, budget_max, created_at, kategori");
  const leads = (data || []) as LeadRow[];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const byStage: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let pipelineValue = 0;
  let newThisMonth = 0;
  let reachedDeposit = 0;
  const closedStages = ["Deposit", "Fabrikasi", "Pemasangan", "Siap"];

  // 6 bulan terakhir
  const months: { key: string; label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("ms-MY", { month: "short" }), count: 0 });
  }

  for (const l of leads) {
    byStage[l.stage] = (byStage[l.stage] || 0) + 1;
    if (l.stage !== "Siap" && l.stage !== LOST) pipelineValue += Number(l.budget_max) || 0;
    if (new Date(l.created_at) >= monthStart) newThisMonth++;
    if (closedStages.includes(l.stage)) reachedDeposit++;
    for (const k of l.kategori || []) byCategory[k] = (byCategory[k] || 0) + 1;
    const d = new Date(l.created_at);
    const mk = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((x) => x.key === mk);
    if (m) m.count++;
  }
  const total = leads.length;
  const conversion = total ? Math.round((reachedDeposit / total) * 100) : 0;

  return { total, newThisMonth, pipelineValue, conversion, byStage, byCategory, months };
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <div className="text-xs uppercase tracking-wider text-ink/50">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold text-ink">{value}</div>
      {sub && <div className="mt-1 text-xs text-ink/45">{sub}</div>}
    </div>
  );
}

export default async function Dashboard() {
  const stats = await getStats();

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="h-display text-2xl">Dashboard</h1>
          <p className="mt-1 text-sm text-ink/50">Gambaran keseluruhan saluran jualan.</p>
        </div>
        <div className="flex gap-3 text-sm">
          <a href="/api/export/leads" className="text-brass hover:underline">Leads CSV</a>
          <a href="/api/export/quotations" className="text-brass hover:underline">Quotes CSV</a>
        </div>
      </div>

      {!stats ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
          Supabase belum dikonfigurasi. Isi <code>.env.local</code> untuk lihat data langsung.
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile label="Jumlah Lead" value={String(stats.total)} />
            <Tile label="Lead Baru (bulan ini)" value={String(stats.newThisMonth)} />
            <Tile label="Nilai Pipeline" value={rm(stats.pipelineValue)} sub="Anggaran (budget_max) stage aktif" />
            <Tile label="Kadar Tukar → Deposit" value={`${stats.conversion}%`} />
          </div>

          <h2 className="mt-10 font-display text-lg font-semibold text-ink">Lead ikut peringkat</h2>
          <div className="mt-4 space-y-2">
            {[...STAGES, LOST].map((s) => {
              const n = stats.byStage[s] || 0;
              const max = Math.max(1, ...Object.values(stats.byStage));
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-ink/70">{s}</div>
                  <div className="h-6 flex-1 overflow-hidden rounded bg-ink/5">
                    <div
                      className="h-full rounded"
                      style={{ width: `${(n / max) * 100}%`, background: STAGE_ACCENT[s] || "#AE873B" }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm font-semibold text-ink">{n}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {/* Lead sebulan */}
            <div className="rounded-xl border border-ink/10 bg-white p-5">
              <h3 className="font-display font-semibold text-ink">Lead 6 bulan terakhir</h3>
              <div className="mt-4 flex h-40 items-end gap-2">
                {stats.months.map((m) => {
                  const max = Math.max(1, ...stats.months.map((x) => x.count));
                  return (
                    <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex w-full items-end justify-center" style={{ height: "120px" }}>
                        <div className="w-full rounded-t bg-brass" style={{ height: `${(m.count / max) * 100}%` }} title={String(m.count)} />
                      </div>
                      <span className="text-[11px] text-ink/50">{m.label}</span>
                      <span className="text-[11px] font-semibold text-ink">{m.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lead ikut kategori */}
            <div className="rounded-xl border border-ink/10 bg-white p-5">
              <h3 className="font-display font-semibold text-ink">Lead ikut kategori</h3>
              <div className="mt-4 space-y-2">
                {Object.entries(stats.byCategory).length === 0 ? (
                  <p className="text-sm text-ink/40">Belum ada data kategori.</p>
                ) : (
                  Object.entries(stats.byCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, n]) => {
                      const max = Math.max(1, ...Object.values(stats.byCategory));
                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <div className="w-28 truncate text-sm text-ink/70">{cat}</div>
                          <div className="h-5 flex-1 overflow-hidden rounded bg-ink/5">
                            <div className="h-full rounded bg-gold-shadow" style={{ width: `${(n / max) * 100}%` }} />
                          </div>
                          <div className="w-8 text-right text-sm font-semibold text-ink">{n}</div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
