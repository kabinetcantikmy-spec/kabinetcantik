"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addMaterial, updateMaterial, deleteMaterial, seedFromConfig } from "@/app/admin/(panel)/bahan/actions";

export interface Material {
  id: string;
  kategori: string;
  nama: string;
  tier: string;
  unit: string;
  harga_unit: number;
  aktif: boolean;
}

const TIERS = ["economy", "standard", "premium"];

export default function MaterialsEditor({ materials }: { materials: Material[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const refresh = () => router.refresh();

  function patch(id: string, p: Record<string, unknown>) {
    startTransition(async () => {
      await updateMaterial(id, p);
      refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => startTransition(async () => { await addMaterial(); refresh(); })} disabled={pending} className="btn-brass !px-4 !py-2 text-sm">
          + Tambah Bahan
        </button>
        {materials.length === 0 && (
          <button onClick={() => startTransition(async () => { await seedFromConfig(); refresh(); })} disabled={pending} className="btn-ghost !px-4 !py-2 text-sm">
            Isi dari kadar placeholder
          </button>
        )}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-3 py-2">Kategori</th>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2 w-28">Tier</th>
              <th className="px-3 py-2 w-24">Unit</th>
              <th className="px-3 py-2 w-28 text-right">Harga/unit</th>
              <th className="px-3 py-2 w-16">Aktif</th>
              <th className="px-3 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} className="border-t border-ink/5">
                <td className="px-3 py-2">
                  <input defaultValue={m.kategori} onBlur={(e) => e.target.value !== m.kategori && patch(m.id, { kategori: e.target.value })} className="w-full rounded border border-ink/10 bg-paper px-2 py-1" />
                </td>
                <td className="px-3 py-2">
                  <input defaultValue={m.nama} onBlur={(e) => e.target.value !== m.nama && patch(m.id, { nama: e.target.value })} className="w-full rounded border border-ink/10 bg-paper px-2 py-1" />
                </td>
                <td className="px-3 py-2">
                  <select defaultValue={m.tier} onChange={(e) => patch(m.id, { tier: e.target.value })} className="rounded border border-ink/10 bg-paper px-2 py-1">
                    {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input defaultValue={m.unit} onBlur={(e) => e.target.value !== m.unit && patch(m.id, { unit: e.target.value })} className="w-20 rounded border border-ink/10 bg-paper px-2 py-1" />
                </td>
                <td className="px-3 py-2 text-right">
                  <input type="number" defaultValue={m.harga_unit} onBlur={(e) => Number(e.target.value) !== m.harga_unit && patch(m.id, { harga_unit: Number(e.target.value) })} className="w-24 rounded border border-ink/10 bg-paper px-2 py-1 text-right" />
                </td>
                <td className="px-3 py-2 text-center">
                  <input type="checkbox" defaultChecked={m.aktif} onChange={(e) => patch(m.id, { aktif: e.target.checked })} />
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => { if (confirm("Padam bahan ini?")) startTransition(async () => { await deleteMaterial(m.id); refresh(); }); }} className="text-red-400 hover:text-red-600">✕</button>
                </td>
              </tr>
            ))}
            {materials.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-ink/40">Belum ada bahan dalam katalog.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
