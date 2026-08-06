"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fmtDate } from "@/lib/format";
import { createAppointment, updateAppointmentStatus } from "@/app/admin/(panel)/kalendar/actions";

export interface Appt {
  id: string;
  lead_id: string | null;
  jenis: string;
  tarikh: string;
  masa: string | null;
  status: string;
  catatan: string | null;
  leads?: { nama: string } | null;
}
export interface LeadOpt {
  id: string;
  nama: string;
}

const JENIS_LABEL: Record<string, string> = { site_visit: "Ukur Tapak", install: "Pemasangan" };
const STATUS_LABEL: Record<string, string> = { scheduled: "Dijadualkan", done: "Selesai", cancelled: "Batal" };

export default function AppointmentsManager({ appts, leads }: { appts: Appt[]; leads: LeadOpt[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [jenis, setJenis] = useState("site_visit");
  const [leadId, setLeadId] = useState("");
  const [tarikh, setTarikh] = useState("");
  const [masa, setMasa] = useState("");
  const [catatan, setCatatan] = useState("");
  const [err, setErr] = useState("");
  const refresh = () => router.refresh();

  function add() {
    setErr("");
    if (!tarikh) { setErr("Sila pilih tarikh."); return; }
    startTransition(async () => {
      const res = await createAppointment({ lead_id: leadId || undefined, jenis, tarikh, masa, catatan });
      if (!res.ok) setErr(res.error || "Gagal.");
      else { setTarikh(""); setMasa(""); setCatatan(""); setLeadId(""); refresh(); }
    });
  }

  const upcoming = appts.filter((a) => a.status === "scheduled");
  const past = appts.filter((a) => a.status !== "scheduled");

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Form */}
      <div className="h-fit rounded-xl border border-ink/10 bg-white p-4">
        <h3 className="font-display font-semibold text-ink">Jadual temujanji</h3>
        <div className="mt-3 space-y-2 text-sm">
          <select value={jenis} onChange={(e) => setJenis(e.target.value)} className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2">
            <option value="site_visit">Ukur Tapak</option>
            <option value="install">Pemasangan</option>
          </select>
          <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2">
            <option value="">— Kaitkan lead (pilihan) —</option>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.nama}</option>)}
          </select>
          <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2" />
          <input type="time" value={masa} onChange={(e) => setMasa(e.target.value)} className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2" />
          <input value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan (alamat, dll)" className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2" />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button onClick={add} disabled={pending} className="btn-brass w-full text-sm">Tambah</button>
        </div>
      </div>

      {/* Lists */}
      <div>
        <h3 className="font-display font-semibold text-ink">Akan datang</h3>
        <div className="mt-3 space-y-2">
          {upcoming.map((a) => (
            <ApptRow key={a.id} a={a} onStatus={(s) => startTransition(async () => { await updateAppointmentStatus(a.id, s); refresh(); })} />
          ))}
          {upcoming.length === 0 && <p className="text-sm text-ink/40">Tiada temujanji dijadualkan.</p>}
        </div>

        {past.length > 0 && (
          <>
            <h3 className="mt-8 font-display font-semibold text-ink">Lepas / selesai</h3>
            <div className="mt-3 space-y-2 opacity-70">
              {past.map((a) => <ApptRow key={a.id} a={a} onStatus={() => {}} readOnly />)}
            </div>
          </>
        )}
      </div>
    </div>
  );

  function ApptRow({ a, onStatus, readOnly }: { a: Appt; onStatus: (s: string) => void; readOnly?: boolean }) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 bg-white p-3 text-sm">
        <span className="rounded bg-brass/10 px-2 py-1 text-xs text-gold-shadow">{JENIS_LABEL[a.jenis] || a.jenis}</span>
        <div>
          <div className="font-medium text-ink">{fmtDate(a.tarikh)} {a.masa || ""}</div>
          <div className="text-xs text-ink/50">
            {a.leads?.nama ? (
              a.lead_id ? <Link href={`/admin/leads/${a.lead_id}`} className="hover:text-brass">{a.leads.nama}</Link> : a.leads.nama
            ) : "—"}
            {a.catatan ? ` · ${a.catatan}` : ""}
          </div>
        </div>
        <span className="ml-auto text-xs text-ink/50">{STATUS_LABEL[a.status]}</span>
        {!readOnly && (
          <div className="flex gap-2">
            <button onClick={() => onStatus("done")} className="text-xs text-green-600 hover:underline">Selesai</button>
            <button onClick={() => onStatus("cancelled")} className="text-xs text-red-500 hover:underline">Batal</button>
          </div>
        )}
      </div>
    );
  }
}
