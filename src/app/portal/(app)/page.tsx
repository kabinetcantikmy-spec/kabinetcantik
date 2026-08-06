import Link from "next/link";
import { requireCustomer } from "@/lib/supabaseServer";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { PROJECT_STAGES, Project } from "@/lib/portal";
import { rm } from "@/lib/format";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PortalHome() {
  const cust = await requireCustomer();
  let projects: Project[] = [];
  if (supabaseReady()) {
    const sb = createServiceClient();
    const { data } = await sb.from("projects").select("*").eq("customer_id", cust.customerId).order("created_at", { ascending: false });
    projects = (data || []) as Project[];
  }

  return (
    <div>
      <h1 className="h-display text-2xl">Selamat datang, {cust.nama.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-ink/50">Pantau status projek anda di sini.</p>

      {projects.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
          Belum ada projek aktif. Projek akan muncul di sini selepas deposit dibayar.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {projects.map((p) => {
            const idx = PROJECT_STAGES.indexOf(p.status as (typeof PROJECT_STAGES)[number]);
            return (
              <div key={p.id} className="rounded-2xl border border-ink/10 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink">{p.tajuk}</h2>
                    <p className="text-sm text-ink/50">{p.kategori || "—"} · Kontrak {rm(p.nilai_kontrak)}</p>
                  </div>
                  <span className="rounded-full bg-brass/10 px-3 py-1 text-sm text-gold-shadow">{p.status}</span>
                </div>

                {/* Timeline */}
                <div className="mt-6 flex items-center">
                  {PROJECT_STAGES.map((s, i) => (
                    <div key={s} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                            i <= idx ? "bg-brass text-white" : "bg-ink/10 text-ink/40"
                          }`}
                        >
                          {i < idx ? "✓" : i + 1}
                        </div>
                        <span className={`mt-1 text-[10px] ${i <= idx ? "text-ink" : "text-ink/40"}`}>{s}</span>
                      </div>
                      {i < PROJECT_STAGES.length - 1 && (
                        <div className={`mx-1 h-0.5 flex-1 ${i < idx ? "bg-brass" : "bg-ink/10"}`} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <Info label="Mula" value={fmtDate(p.tarikh_mula)} />
                  <Info label="Pemasangan" value={fmtDate(p.tarikh_pasang)} />
                  <Info label="Warranti sehingga" value={fmtDate(p.warranty_until)} />
                  <div className="flex items-end">
                    <Link href="/portal/bayaran" className="text-sm font-semibold text-brass hover:underline">
                      Lihat bayaran →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-ink/40">{label}</div>
      <div className="mt-0.5 text-ink/80">{value}</div>
    </div>
  );
}
