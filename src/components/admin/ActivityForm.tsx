"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addActivity } from "@/app/admin/(panel)/leads/actions";

export default function ActivityForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [jenis, setJenis] = useState("note");
  const [mesej, setMesej] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  function submit() {
    setErr("");
    if (!mesej.trim()) return;
    startTransition(async () => {
      const res = await addActivity(leadId, jenis, mesej);
      if (!res.ok) setErr(res.error || "Gagal.");
      else {
        setMesej("");
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <div className="flex gap-2">
        <select
          value={jenis}
          onChange={(e) => setJenis(e.target.value)}
          className="rounded-lg border border-ink/15 bg-paper px-2 py-2 text-sm"
        >
          <option value="note">Nota</option>
          <option value="call">Panggilan</option>
        </select>
        <input
          value={mesej}
          onChange={(e) => setMesej(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Tambah nota / rekod panggilan…"
          className="flex-1 rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm"
        />
        <button onClick={submit} disabled={pending} className="btn-brass !px-4 !py-2 text-sm">
          {pending ? "…" : "Tambah"}
        </button>
      </div>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}
