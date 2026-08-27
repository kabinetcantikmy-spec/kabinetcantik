import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseReady } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { Lead, LeadActivity } from "@/lib/crm";
import { rm } from "@/lib/format";
import { fmtDateTime, fmtDate } from "@/lib/format";
import { waLink } from "@/lib/wa";
import { tenantBrand } from "@/lib/branding";
import ActivityForm from "@/components/admin/ActivityForm";
import LeadControls from "@/components/admin/LeadControls";

export const dynamic = "force-dynamic";

export default async function LeadDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (!supabaseReady()) {
    return <div className="rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">Supabase belum dikonfigurasi.</div>;
  }
  const sb = createSupabaseServer();
  const { data: lead } = await sb.from("leads").select("*").eq("id", params.id).single();
  const brand = await tenantBrand((lead as { org_id?: string } | null)?.org_id);
  if (!lead) notFound();
  const l = lead as Lead;

  const { data: acts } = await sb
    .from("lead_activity")
    .select("*")
    .eq("lead_id", params.id)
    .order("created_at", { ascending: false });
  const activities = (acts || []) as LeadActivity[];

  const { data: staffRows } = await sb
    .from("profiles")
    .select("id, nama")
    .in("role", ["admin", "sales", "designer", "finance", "installer"]);
  const staff = (staffRows || []) as { id: string; nama: string | null }[];

  const { data: fileRows } = await sb.from("lead_files").select("url").eq("lead_id", params.id);
  const files = (fileRows || []) as { url: string }[];

  const wizard = l.jawapan_wizard || {};
  const w = wizard as Record<string, unknown>;
  const CAT_LABEL: Record<string, string> = {
    dapur: "Kabinet Dapur",
    dapur_bawah: "Kabinet bawah",
    dapur_atas: "Kabinet atas",
    wardrobe: "Wardrobe",
    tv: "TV Cabinet",
    panel: "Wall Panelling",
  };
  const TIER_LABEL: Record<string, string> = { economy: "Economy", standard: "Standard", premium: "Premium" };
  const saizText = (qtys: unknown): string => {
    if (!qtys || typeof qtys !== "object") return "—";
    const parts = Object.entries(qtys as Record<string, unknown>)
      .filter(([, v]) => Number(v) > 0)
      .map(([k, v]) => {
        const unit = k === "panel" ? "kaki persegi" : "kaki";
        const label = k === "dapur_bawah" ? "bawah " : k === "dapur_atas" ? "atas " : "";
        return `${label}${String(v)} ${unit}`;
      });
    return parts.length ? parts.join(" + ") : "—";
  };
  const wizardRows: [string, string][] = Object.keys(w).length
    ? [
        ["Bahan", TIER_LABEL[w.tier as string] || (w.tier ? String(w.tier) : "—")],
        ["Saiz", saizText(w.qtys)],
        ["Bajet", w.budget ? String(w.budget) : "—"],
        ["Timeline", w.timeline ? String(w.timeline) : "—"],
      ]
    : [];
  const SOURCE_LABEL: Record<string, string> = { quote_wizard: "Website", website: "Website", manual: "Manual" };
  const sumberText = SOURCE_LABEL[l.source as string] || (l.source ? String(l.source) : "—");
  const catText = (l.kategori || []).map((k: string) => CAT_LABEL[k] || String(k)).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).join(", ") || "—";
  const wa = waLink(l.telefon, `Hai ${l.nama}, terima kasih hubungi ${brand.nama}.`);

  return (
    <div>
      <Link href="/admin/leads" className="text-sm text-ink/50 hover:text-brass">← Kembali ke pipeline</Link>

      <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="rounded-xl border border-ink/10 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-2xl font-semibold text-ink">{l.nama}</h1>
                <p className="text-sm text-ink/60">{l.telefon}{l.emel ? ` · ${l.emel}` : ""}</p>
              </div>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-brass !px-4 !py-2 text-sm">
                WhatsApp
              </a>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Info label="Peringkat" value={l.stage} />
              <Info label="Sumber" value={sumberText} />
              <Info label="Kategori" value={catText} />
              <Info label="Anggaran" value={l.budget_max ? `${rm(l.budget_min)} – ${rm(l.budget_max)}` : "—"} />
              <Info label="Timeline" value={String((wizard as Record<string, unknown>).timeline || l.timeline || "—")} />
              <Info label="Masuk" value={fmtDate(l.created_at)} />
            </div>
            {files.length > 0 && (
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wider text-ink/40">Gambar ruang</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brass hover:underline">
                      Gambar {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {wizardRows.length > 0 && (
              <details className="mt-4 text-sm" open>
                <summary className="cursor-pointer text-ink/60">Butiran ukuran & bahan</summary>
                <div className="mt-2 space-y-1 rounded-lg bg-paper p-3">
                  {wizardRows.map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <span className="w-20 flex-shrink-0 text-ink/45">{k}</span>
                      <span className="text-ink/80">{v}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          <h2 className="mt-6 font-display text-lg font-semibold text-ink">Aktiviti</h2>
          <div className="mt-3">
            <ActivityForm leadId={l.id} />
          </div>
          <ul className="mt-4 space-y-3">
            {activities.map((a) => (
              <li key={a.id} className="flex gap-3">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brass" />
                <div>
                  <div className="text-sm text-ink">{a.mesej}</div>
                  <div className="text-xs text-ink/40">
                    {a.jenis} · {a.oleh || "—"} · {fmtDateTime(a.created_at)}
                  </div>
                </div>
              </li>
            ))}
            {activities.length === 0 && <li className="text-sm text-ink/40">Belum ada aktiviti.</li>}
          </ul>
        </div>

        <div>
          <LeadControls leadId={l.id} stage={l.stage} followup={l.next_followup} assigneeId={l.assignee_id} staff={staff} />
          {l.next_followup && (
            <p className="mt-3 text-center text-xs text-ink/50">Follow-up: {fmtDate(l.next_followup)}</p>
          )}
        </div>
      </div>
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
