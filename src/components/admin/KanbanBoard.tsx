"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STAGES, STAGE_ACCENT, LOST, type Lead } from "@/lib/crm";
import { rm } from "@/lib/format";
import { updateStage } from "@/app/admin/(panel)/leads/actions";

const COLUMNS = [...STAGES, LOST];

export default function KanbanBoard({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Lead[]>(leads);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const q = search.trim().toLowerCase();
  const filtered = q
    ? items.filter((l) => l.nama.toLowerCase().includes(q) || (l.telefon || "").includes(q))
    : items;

  function onDrop(stage: string) {
    const id = dragId;
    setOver(null);
    setDragId(null);
    if (!id) return;
    const lead = items.find((l) => l.id === id);
    if (!lead || lead.stage === stage) return;
    // Optimistic
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
    startTransition(async () => {
      const res = await updateStage(id, stage);
      if (!res.ok) {
        setItems((prev) => prev.map((l) => (l.id === id ? { ...l, stage: lead.stage } : l)));
        alert(res.error || "Gagal kemas kini.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama atau telefon…"
        className="mb-4 w-full max-w-xs rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
      />
      <div className="flex gap-3 overflow-x-auto pb-4">
      {COLUMNS.map((stage) => {
        const cards = filtered.filter((l) => l.stage === stage);
        const value = cards.reduce((s, l) => s + (Number(l.budget_max) || 0), 0);
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(stage);
            }}
            onDrop={() => onDrop(stage)}
            className={`flex w-64 flex-shrink-0 flex-col rounded-xl border bg-ink/[0.03] p-2 ${
              over === stage ? "border-brass" : "border-transparent"
            }`}
          >
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: STAGE_ACCENT[stage] }} />
              <span className="text-sm font-semibold text-ink">{stage}</span>
              <span className="ml-auto text-xs text-ink/40">{cards.length}</span>
            </div>
            {value > 0 && <div className="mb-2 px-1 text-[11px] text-ink/40">{rm(value)}</div>}

            <div className="flex flex-col gap-2">
              {cards.map((l) => (
                <div
                  key={l.id}
                  draggable
                  onDragStart={() => setDragId(l.id)}
                  className="cursor-grab rounded-lg border border-ink/10 bg-white p-3 shadow-sm active:cursor-grabbing"
                >
                  <Link href={`/admin/leads/${l.id}`} className="block">
                    <div className="text-sm font-semibold text-ink">{l.nama}</div>
                    <div className="text-xs text-ink/50">{l.telefon}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(l.kategori || []).slice(0, 2).map((k) => (
                        <span key={k} className="rounded bg-brass/10 px-1.5 py-0.5 text-[10px] text-gold-shadow">
                          {k}
                        </span>
                      ))}
                    </div>
                    {(l.budget_max || 0) > 0 && (
                      <div className="mt-1 text-[11px] text-ink/45">≈ {rm(l.budget_max)}</div>
                    )}
                  </Link>
                </div>
              ))}
              {cards.length === 0 && <div className="px-1 py-4 text-center text-xs text-ink/25">—</div>}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
