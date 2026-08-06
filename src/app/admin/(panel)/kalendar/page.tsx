import { createServiceClient, supabaseReady } from "@/lib/supabase";
import AppointmentsManager, { Appt, LeadOpt } from "@/components/admin/AppointmentsManager";

export const dynamic = "force-dynamic";

export default async function KalendarPage() {
  let appts: Appt[] = [];
  let leads: LeadOpt[] = [];
  if (supabaseReady()) {
    const sb = createServiceClient();
    const [{ data: a }, { data: l }] = await Promise.all([
      sb.from("appointments").select("*, leads(nama)").order("tarikh", { ascending: true }),
      sb.from("leads").select("id, nama").not("stage", "eq", "Batal/Lost").order("created_at", { ascending: false }),
    ]);
    appts = (a || []) as Appt[];
    leads = (l || []) as LeadOpt[];
  }

  return (
    <div>
      <h1 className="h-display text-2xl">Kalendar</h1>
      <p className="mt-1 text-sm text-ink/50">Jadual ukur tapak & pemasangan.</p>
      {!supabaseReady() ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
          Supabase belum dikonfigurasi.
        </div>
      ) : (
        <div className="mt-6">
          <AppointmentsManager appts={appts} leads={leads} />
        </div>
      )}
    </div>
  );
}
