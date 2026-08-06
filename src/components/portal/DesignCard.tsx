"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Design } from "@/lib/portal";
import { approveDesign, requestRevision } from "@/app/portal/(app)/actions";

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Menunggu maklum balas anda", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Diluluskan", cls: "bg-green-100 text-green-700" },
  revision: { label: "Diminta ubah", cls: "bg-red-100 text-red-600" },
};

export default function DesignCard({ d }: { d: Design }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showRev, setShowRev] = useState(false);
  const [komen, setKomen] = useState(d.komen || "");
  const st = STATUS[d.status] || STATUS.pending;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.image_url} alt={d.tajuk || "Design"} className="aspect-video w-full object-cover" />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-ink">{d.tajuk || "Reka bentuk"}</h3>
          <span className={`rounded-full px-2.5 py-1 text-xs ${st.cls}`}>{st.label}</span>
        </div>

        {d.status === "revision" && d.komen && (
          <p className="mt-2 rounded-lg bg-paper p-2 text-sm text-ink/60">Komen anda: {d.komen}</p>
        )}

        {d.status !== "approved" && (
          <div className="mt-3">
            {!showRev ? (
              <div className="flex gap-2">
                <button
                  onClick={() => startTransition(async () => { await approveDesign(d.id); router.refresh(); })}
                  disabled={pending}
                  className="btn-brass !px-4 !py-2 text-sm"
                >
                  Luluskan
                </button>
                <button onClick={() => setShowRev(true)} className="btn-ghost !px-4 !py-2 text-sm">
                  Minta ubah
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={komen}
                  onChange={(e) => setKomen(e.target.value)}
                  placeholder="Nyatakan perubahan yang diminta…"
                  className="h-20 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => startTransition(async () => { const r = await requestRevision(d.id, komen); if (r.ok) { setShowRev(false); router.refresh(); } else alert(r.error); })}
                    disabled={pending}
                    className="btn-brass !px-4 !py-2 text-sm"
                  >
                    Hantar
                  </button>
                  <button onClick={() => setShowRev(false)} className="text-sm text-ink/50">Batal</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
