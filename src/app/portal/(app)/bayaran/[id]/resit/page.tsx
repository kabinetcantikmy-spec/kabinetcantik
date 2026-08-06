import { notFound } from "next/navigation";
import { requireCustomer } from "@/lib/supabaseServer";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { rm2 } from "@/lib/format";
import { fmtDateTime } from "@/lib/format";
import Logo from "@/components/Logo";
import PrintButton from "@/components/admin/PrintButton";

export const dynamic = "force-dynamic";

const JENIS_LABEL: Record<string, string> = { deposit: "Deposit", progress: "Bayaran Progres", final: "Bayaran Akhir" };

export default async function ResitPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const cust = await requireCustomer();
  if (!supabaseReady()) return <div className="p-8 text-center text-ink/50">Supabase belum dikonfigurasi.</div>;
  const sb = createServiceClient();
  const { data: pay } = await sb
    .from("payments")
    .select("*, projects(tajuk, customer_id, customers(nama, emel))")
    .eq("id", params.id)
    .single();
  const project = (pay as { projects?: { tajuk: string; customer_id: string; customers?: { nama: string; emel: string } } } | null)?.projects;
  if (!pay || pay.status !== "paid" || !project || project.customer_id !== cust.customerId) notFound();

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-ink/10 bg-white p-8 print:border-0">
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <div className="flex items-center gap-3 border-b-2 border-brass pb-4">
        <Logo className="h-12 w-12" />
        <div>
          <div className="font-display font-semibold tracking-widest text-ink">KABINET CANTIK</div>
          <div className="text-xs text-ink/50">Resit Rasmi Pembayaran</div>
        </div>
        <div className="ml-auto text-right text-xs text-ink/50">
          <div>Resit #{String(pay.id).slice(0, 8).toUpperCase()}</div>
          <div>{fmtDateTime(pay.dibayar_pada)}</div>
        </div>
      </div>

      <div className="mt-5 space-y-2 text-sm">
        <Row label="Pelanggan" value={project.customers?.nama || cust.nama} />
        <Row label="Projek" value={project.tajuk} />
        <Row label="Jenis bayaran" value={JENIS_LABEL[pay.jenis] || pay.jenis} />
        <Row label="Rujukan gateway" value={pay.gateway_ref || "—"} />
      </div>

      <div className="mt-5 rounded-xl bg-brass/10 p-4 text-center">
        <div className="text-xs uppercase tracking-wider text-gold-shadow">Jumlah dibayar</div>
        <div className="font-display text-3xl font-semibold text-ink">{rm2(pay.jumlah)}</div>
        <div className="mt-1 text-xs text-green-600">✓ Dibayar</div>
      </div>

      <p className="mt-6 text-center text-xs text-ink/40">Terima kasih. Resit ini dijana secara automatik oleh sistem KabinetCantik.</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink/50">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
