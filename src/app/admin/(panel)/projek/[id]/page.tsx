import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import { supabaseReady } from "@/lib/supabase";
import { Payment, Design, WarrantyClaim } from "@/lib/portal";
import { rm } from "@/lib/format";
import ProjectManage from "@/components/admin/ProjectManage";

export const dynamic = "force-dynamic";

export default async function ProjectDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (!supabaseReady()) return <div className="rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">Supabase belum dikonfigurasi.</div>;
  const sb = createSupabaseServer();
  const { data: project } = await sb.from("projects").select("*, customers(nama, telefon)").eq("id", params.id).single();
  if (!project) notFound();

  const [{ data: payments }, { data: designs }, { data: claims }] = await Promise.all([
    sb.from("payments").select("*").eq("project_id", params.id).order("created_at"),
    sb.from("project_designs").select("*").eq("project_id", params.id).order("created_at", { ascending: false }),
    sb.from("warranty_claims").select("*").eq("project_id", params.id).order("created_at", { ascending: false }),
  ]);

  const p = project as { id: string; tajuk: string; status: string; nilai_kontrak: number; customers?: { nama: string; telefon: string } | null };

  return (
    <div>
      <Link href="/admin/projek" className="text-sm text-ink/50 hover:text-brass">← Semua projek</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{p.tajuk}</h1>
          <p className="text-sm text-ink/60">{p.customers?.nama || "—"} · {p.customers?.telefon || ""} · Kontrak {rm(p.nilai_kontrak)}</p>
        </div>
        <span className="rounded-full bg-brass/10 px-3 py-1 text-sm text-gold-shadow">{p.status}</span>
      </div>

      <div className="mt-6">
        <ProjectManage
          projectId={p.id}
          status={p.status}
          payments={(payments || []) as Payment[]}
          designs={(designs || []) as Design[]}
          claims={(claims || []) as WarrantyClaim[]}
        />
      </div>
    </div>
  );
}
