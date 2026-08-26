import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { supabaseReady } from "@/lib/supabase";
import { PROJECT_STAGES } from "@/lib/portal";
import { rm, fmtDate } from "@/lib/format";
import Logo from "@/components/Logo";
import PrintButton from "@/components/admin/PrintButton";
import { tenantBrand } from "@/lib/branding";
import { planForOrg } from "@/lib/planServer";

export const dynamic = "force-dynamic";

export default async function ProjectReport(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nota?: string }>;
}) {
  const params = await props.params;
  const search = await props.searchParams;
  const nota = (search?.nota || "").slice(0, 1200);

  if (!supabaseReady()) return <div className="p-8 text-center text-ink/50">Supabase belum dikonfigurasi.</div>;
  const sb = createSupabaseServer();

  const { data: project } = await sb
    .from("projects")
    .select("*, customers(nama, telefon)")
    .eq("id", params.id)
    .single();
  if (!project) notFound();
  const p = project as {
    id: string; tajuk: string; kategori: string | null; status: string; nilai_kontrak: number;
    tarikh_mula: string | null; tarikh_pasang: string | null; warranty_until: string | null;
    org_id?: string; customers?: { nama: string; telefon: string } | null;
  };

  const { data: designs } = await sb
    .from("project_designs")
    .select("image_url, tajuk")
    .eq("project_id", params.id)
    .order("created_at", { ascending: false });
  const imgs = (designs || []) as { image_url: string; tajuk: string | null }[];

  const brand = await tenantBrand(p.org_id);
  const { features } = await planForOrg(p.org_id);
  const idx = PROJECT_STAGES.indexOf(p.status as (typeof PROJECT_STAGES)[number]);

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-ink print:p-0">
      <div className="mb-6 flex justify-end print:mb-2">
        <PrintButton />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-brass pb-5">
        <div className="flex items-center gap-3">
          <Logo className="h-14 w-14" src={brand.logoUrl} alt={brand.nama} />
          <div>
            <div className="font-display text-xl font-semibold tracking-widest text-ink">{brand.nama}</div>
            <div className="mt-1 text-xs text-ink/50">Laporan kemajuan projek</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-lg font-semibold">LAPORAN PROGRES</div>
          <div className="text-xs text-ink/50">Tarikh: {fmtDate(new Date().toISOString())}</div>
        </div>
      </div>

      {/* Pelanggan + projek */}
      <div className="mt-5 flex flex-wrap items-start justify-between gap-3 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink/40">Pelanggan</div>
          <div className="font-semibold text-ink">{p.customers?.nama || "—"}</div>
          <div className="text-ink/60">{p.customers?.telefon || ""}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-ink/40">Projek</div>
          <div className="font-semibold text-ink">{p.tajuk}</div>
          <div className="text-ink/60">{p.kategori ? `${p.kategori} · ` : ""}Kontrak {rm(p.nilai_kontrak)}</div>
        </div>
      </div>

      {/* Timeline status */}
      <div className="mt-7">
        <div className="text-xs uppercase tracking-wider text-ink/40">Status projek</div>
        <div className="mt-3 flex items-center">
          {PROJECT_STAGES.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${i <= idx ? "bg-brass text-white" : "bg-ink/10 text-ink/40"}`}>
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
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <Info label="Mula" value={fmtDate(p.tarikh_mula)} />
          <Info label="Pemasangan" value={fmtDate(p.tarikh_pasang)} />
          <Info label="Warranti sehingga" value={fmtDate(p.warranty_until)} />
        </div>
      </div>

      {/* Nota progres */}
      {nota && (
        <div className="mt-7">
          <div className="text-xs uppercase tracking-wider text-ink/40">Kemas kini</div>
          <p className="mt-1 whitespace-pre-line text-ink/80">{nota}</p>
        </div>
      )}

      {/* Gambar / render */}
      {imgs.length > 0 && (
        <div className="mt-7">
          <div className="text-xs uppercase tracking-wider text-ink/40">Gambar / reka bentuk</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {imgs.slice(0, 6).map((im, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={im.image_url} alt={im.tajuk || "Reka bentuk"} className="aspect-video w-full rounded-lg border border-ink/10 object-cover" />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-ink/10 pt-4 text-xs text-ink/50">
        Terima kasih memilih {brand.nama}. Untuk sebarang pertanyaan mengenai projek anda, sila hubungi kami.
      </div>
      {features.quoteWatermark && (
        <div className="mt-4 text-center text-[11px] text-ink/30">Dijana dengan KabinetCantik OS</div>
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
