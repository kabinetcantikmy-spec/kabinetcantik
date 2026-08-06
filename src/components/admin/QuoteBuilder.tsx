"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Quotation, QuotationItem } from "@/lib/crm";
import { rm2 } from "@/lib/format";
import { addItem, updateItem, removeItem, updateQuoteMeta, setQuoteStatus, sendQuotation, reviseQuotation } from "@/app/admin/(panel)/sebutharga/actions";

export interface MaterialOpt {
  id: string;
  kategori: string;
  nama: string;
  tier: string;
  unit: string;
  harga_unit: number;
}

export default function QuoteBuilder({
  quote,
  items,
  materials,
  leadNama,
}: {
  quote: Quotation;
  items: QuotationItem[];
  materials: MaterialOpt[];
  leadNama: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const refresh = () => router.refresh();

  function patchItem(id: string, patch: Record<string, unknown>) {
    startTransition(async () => {
      await updateItem(id, quote.id, patch);
      refresh();
    });
  }

  const deposit = (quote.jumlah * quote.deposit_pct) / 100;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/sebutharga" className="text-sm text-ink/50 hover:text-brass">← Semua sebut harga</Link>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{quote.no_quote}</h1>
          <p className="text-sm text-ink/50">{leadNama} · Status: {quote.status}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/sebutharga/${quote.id}/cetak`} target="_blank" className="btn-ghost !px-4 !py-2 text-sm">
            Cetak / PDF
          </Link>
          <button
            onClick={() => startTransition(async () => { const r = await sendQuotation(quote.id); if (r.ok) { if (r.waLink) window.open(r.waLink, "_blank"); refresh(); } else alert(r.error); })}
            className="btn-brass !px-4 !py-2 text-sm"
          >
            Hantar ke Pelanggan
          </button>
          <button
            onClick={() => startTransition(async () => { const r = await reviseQuotation(quote.id); if (r.ok && r.id) router.push(`/admin/sebutharga/${r.id}`); else alert(r.error); })}
            className="btn-ghost !px-4 !py-2 text-sm"
          >
            Buat Semakan
          </button>
          <button onClick={() => startTransition(async () => { await setQuoteStatus(quote.id, "accepted"); refresh(); })} className="btn-ghost !px-4 !py-2 text-sm">
            Tanda Diterima
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-3 py-2">Keterangan</th>
              <th className="px-3 py-2 w-24">Tier</th>
              <th className="px-3 py-2 w-20">Kuantiti</th>
              <th className="px-3 py-2 w-24">Unit</th>
              <th className="px-3 py-2 w-28 text-right">Harga/unit</th>
              <th className="px-3 py-2 w-28 text-right">Jumlah</th>
              <th className="px-3 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-ink/5">
                <td className="px-3 py-2">
                  <input
                    defaultValue={it.keterangan}
                    onBlur={(e) => e.target.value !== it.keterangan && patchItem(it.id, { keterangan: e.target.value })}
                    className="w-full rounded border border-transparent bg-transparent px-1 py-1 hover:border-ink/10 focus:border-brass focus:bg-paper focus:outline-none"
                  />
                  <input
                    list={`mat-${it.id}`}
                    placeholder="+ isi dari katalog"
                    onChange={(e) => {
                      const m = materials.find((x) => `${x.nama} (${x.tier})` === e.target.value);
                      if (m) patchItem(it.id, { keterangan: m.nama, kategori: m.kategori, material_tier: m.tier, unit: m.unit, harga_unit: m.harga_unit });
                    }}
                    className="mt-1 w-full rounded border border-ink/10 bg-paper px-1 py-1 text-xs text-ink/50"
                  />
                  <datalist id={`mat-${it.id}`}>
                    {materials.map((m) => (
                      <option key={m.id} value={`${m.nama} (${m.tier})`} />
                    ))}
                  </datalist>
                </td>
                <td className="px-3 py-2 text-xs text-ink/60">{it.material_tier || "—"}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    defaultValue={it.kuantiti}
                    onBlur={(e) => Number(e.target.value) !== it.kuantiti && patchItem(it.id, { kuantiti: Number(e.target.value) })}
                    className="w-16 rounded border border-ink/10 bg-paper px-2 py-1 text-right"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    defaultValue={it.unit || ""}
                    onBlur={(e) => e.target.value !== it.unit && patchItem(it.id, { unit: e.target.value })}
                    className="w-20 rounded border border-ink/10 bg-paper px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    defaultValue={it.harga_unit}
                    onBlur={(e) => Number(e.target.value) !== it.harga_unit && patchItem(it.id, { harga_unit: Number(e.target.value) })}
                    className="w-24 rounded border border-ink/10 bg-paper px-2 py-1 text-right"
                  />
                </td>
                <td className="px-3 py-2 text-right font-semibold text-ink">{rm2(it.jumlah)}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => startTransition(async () => { await removeItem(it.id, quote.id); refresh(); })}
                    className="text-red-400 hover:text-red-600"
                    title="Buang"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-ink/40">Belum ada item.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => startTransition(async () => { await addItem(quote.id); refresh(); })}
        disabled={pending}
        className="btn-ghost mt-3 !px-4 !py-2 text-sm"
      >
        + Tambah Item
      </button>

      {/* Totals */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <label className="text-xs uppercase tracking-wider text-ink/50">Nota (papar dalam sebut harga)</label>
          <textarea
            defaultValue={quote.nota || ""}
            onBlur={(e) => e.target.value !== (quote.nota || "") && startTransition(async () => { await updateQuoteMeta(quote.id, { nota: e.target.value }); refresh(); })}
            className="mt-1 h-24 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm"
            placeholder="cth: Harga sah 30 hari. Termasuk hardware Blum & pemasangan."
          />
        </div>

        <div className="rounded-xl border border-ink/10 bg-white p-4 text-sm">
          <Row label="Subtotal" value={rm2(quote.subtotal)} />
          <div className="flex items-center justify-between py-1.5">
            <span className="text-ink/60">Diskaun (RM)</span>
            <input
              type="number"
              defaultValue={quote.diskaun}
              onBlur={(e) => Number(e.target.value) !== quote.diskaun && startTransition(async () => { await updateQuoteMeta(quote.id, { diskaun: Number(e.target.value) }); refresh(); })}
              className="w-24 rounded border border-ink/10 bg-paper px-2 py-1 text-right"
            />
          </div>
          <Row label="SST" value={rm2(quote.cukai)} />
          <div className="my-2 border-t border-ink/10" />
          <Row label="Jumlah" value={rm2(quote.jumlah)} bold />
          <div className="flex items-center justify-between py-1.5">
            <span className="text-ink/60">Deposit (%)</span>
            <input
              type="number"
              defaultValue={quote.deposit_pct}
              onBlur={(e) => Number(e.target.value) !== quote.deposit_pct && startTransition(async () => { await updateQuoteMeta(quote.id, { deposit_pct: Number(e.target.value) }); refresh(); })}
              className="w-20 rounded border border-ink/10 bg-paper px-2 py-1 text-right"
            />
          </div>
          <Row label="Deposit perlu bayar" value={rm2(deposit)} accent />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-ink/60">{label}</span>
      <span className={`${bold ? "font-display text-lg font-semibold" : ""} ${accent ? "text-brass" : "text-ink"}`}>{value}</span>
    </div>
  );
}
