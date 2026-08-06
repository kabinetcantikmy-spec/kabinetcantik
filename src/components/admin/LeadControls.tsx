"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { STAGES } from "@/lib/crm";
import { updateStage, setFollowup, markLost, assignLead } from "@/app/admin/(panel)/leads/actions";
import { createQuotationForLead } from "@/app/admin/(panel)/sebutharga/actions";

export interface StaffOpt {
  id: string;
  nama: string | null;
}

export default function LeadControls({
  leadId,
  stage,
  followup,
  assigneeId,
  staff = [],
}: {
  leadId: string;
  stage: string;
  followup: string | null;
  assigneeId?: string | null;
  staff?: StaffOpt[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [date, setDate] = useState(followup || "");

  function changeStage(s: string) {
    startTransition(async () => {
      await updateStage(leadId, s);
      router.refresh();
    });
  }
  function saveFollowup() {
    startTransition(async () => {
      await setFollowup(leadId, date);
      router.refresh();
    });
  }
  function lost() {
    const reason = window.prompt("Sebab batal/lost?") || "";
    startTransition(async () => {
      await markLost(leadId, reason);
      router.refresh();
    });
  }
  function makeQuote() {
    startTransition(async () => {
      const res = await createQuotationForLead(leadId);
      if (res.ok && res.id) router.push(`/admin/sebutharga/${res.id}`);
      else alert(res.error || "Gagal cipta sebut harga.");
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-ink/10 bg-white p-4">
      {staff.length > 0 && (
        <div>
          <label className="text-xs uppercase tracking-wider text-ink/50">Ditugaskan kepada</label>
          <select
            defaultValue={assigneeId || ""}
            onChange={(e) => startTransition(async () => { await assignLead(leadId, e.target.value); router.refresh(); })}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm"
            disabled={pending}
          >
            <option value="">— Belum ditugaskan —</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.nama || s.id.slice(0, 8)}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="text-xs uppercase tracking-wider text-ink/50">Peringkat</label>
        <select
          value={STAGES.includes(stage as (typeof STAGES)[number]) ? stage : ""}
          onChange={(e) => changeStage(e.target.value)}
          className="mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm"
          disabled={pending}
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          {stage === "Batal/Lost" && <option value="">Batal/Lost</option>}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-ink/50">Follow-up seterusnya</label>
        <div className="mt-1 flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm"
          />
          <button onClick={saveFollowup} disabled={pending} className="btn-ghost !px-3 !py-2 text-sm">
            Simpan
          </button>
        </div>
      </div>

      <button onClick={makeQuote} disabled={pending} className="btn-brass w-full text-sm">
        Bina Sebut Harga →
      </button>
      <button onClick={lost} disabled={pending} className="w-full text-sm text-red-500 hover:underline">
        Tanda Batal/Lost
      </button>
    </div>
  );
}
