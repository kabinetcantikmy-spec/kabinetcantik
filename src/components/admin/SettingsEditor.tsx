"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PricingConfig, CategoryRate, Tier } from "@/lib/pricing";
import { savePricingConfig, updateUserRole, setWaAutomation } from "@/app/admin/(panel)/tetapan/actions";

export interface StaffUser {
  id: string;
  nama: string | null;
  emel: string | null;
  role: string;
}

const ROLES = ["admin", "sales", "finance", "designer", "installer", "customer"];
const TIERS: Tier[] = ["economy", "standard", "premium"];

export default function SettingsEditor({ config, users, waEnabled = false }: { config: PricingConfig; users: StaffUser[]; waEnabled?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [wa, setWa] = useState(waEnabled);
  const [cats, setCats] = useState<CategoryRate[]>(config.categories);
  const [rangePct, setRangePct] = useState(config.publicRangePct);
  const [dep, setDep] = useState<[number, number, number]>(config.depositSplit);
  const [sstOn, setSstOn] = useState(config.sstEnabled);
  const [sstRate, setSstRate] = useState(config.sstRate);
  const [msg, setMsg] = useState("");

  function setRate(i: number, tier: Tier, val: number) {
    setCats((prev) => prev.map((c, idx) => (idx === i ? { ...c, [tier]: val } : c)));
  }

  function save() {
    setMsg("");
    startTransition(async () => {
      const r = await savePricingConfig({ categories: cats, publicRangePct: rangePct, depositSplit: dep, sstEnabled: sstOn, sstRate });
      setMsg(r.ok ? "Disimpan ✓" : r.error || "Gagal.");
      if (r.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {/* Pricing */}
      <div className="rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Kadar & Instant Estimate</h2>
        <p className="mt-1 text-sm text-ink/50">Kadar ini memandu anggaran awam di Quote Wizard.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-ink/50">
              <tr><th className="py-2">Kategori</th><th>Economy</th><th>Standard</th><th>Premium</th><th>Unit</th></tr>
            </thead>
            <tbody>
              {cats.map((c, i) => (
                <tr key={c.key} className="border-t border-ink/5">
                  <td className="py-2 pr-2 font-medium text-ink">{c.name}</td>
                  {TIERS.map((t) => (
                    <td key={t} className="py-2 pr-2">
                      <input type="number" value={c[t]} onChange={(e) => setRate(i, t, Number(e.target.value))} className="w-24 rounded border border-ink/15 bg-paper px-2 py-1 text-right" />
                    </td>
                  ))}
                  <td className="py-2 text-xs text-ink/40">{c.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="text-sm">Lebar julat awam (%)
            <input type="number" value={rangePct} onChange={(e) => setRangePct(Number(e.target.value))} className="mt-1 w-full rounded border border-ink/15 bg-paper px-2 py-1.5" />
          </label>
          <label className="text-sm">SST
            <div className="mt-1 flex items-center gap-2">
              <input type="checkbox" checked={sstOn} onChange={(e) => setSstOn(e.target.checked)} /> aktif
              <input type="number" value={sstRate} onChange={(e) => setSstRate(Number(e.target.value))} className="w-16 rounded border border-ink/15 bg-paper px-2 py-1" /> %
            </div>
          </label>
          <label className="text-sm">Deposit split (%)
            <div className="mt-1 flex gap-1">
              {[0, 1, 2].map((k) => (
                <input key={k} type="number" value={dep[k]} onChange={(e) => setDep((d) => { const n = [...d] as [number, number, number]; n[k] = Number(e.target.value); return n; })} className="w-14 rounded border border-ink/15 bg-paper px-2 py-1 text-right" />
              ))}
            </div>
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={save} disabled={pending} className="btn-brass !px-5 !py-2 text-sm">{pending ? "Menyimpan…" : "Simpan"}</button>
          {msg && <span className="text-sm text-ink/60">{msg}</span>}
        </div>
      </div>

      {/* WhatsApp automation */}
      <div className="rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Automasi WhatsApp</h2>
        <p className="mt-1 text-sm text-ink/50">Hantar notifikasi automatik (lead, peringkat, bayaran, temujanji, review) via Meta Cloud API. Perlu kredensial WhatsApp diisi dalam env + template diluluskan Meta.</p>
        <label className="mt-3 flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={wa}
            onChange={(e) => { setWa(e.target.checked); startTransition(async () => { await setWaAutomation(e.target.checked); router.refresh(); }); }}
          />
          <span className="font-medium text-ink">{wa ? "Automasi WhatsApp DIHIDUPKAN" : "Automasi WhatsApp dimatikan"}</span>
        </label>
      </div>

      {/* Users & roles */}
      <div className="rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Pengguna & Peranan</h2>
        <p className="mt-1 text-sm text-ink/50">Tukar peranan staf. Akaun dicipta melalui Supabase Auth.</p>
        <div className="mt-4 divide-y divide-ink/5">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 py-2 text-sm">
              <div className="flex-1">
                <div className="font-medium text-ink">{u.nama || "—"}</div>
                <div className="text-xs text-ink/50">{u.emel}</div>
              </div>
              <select defaultValue={u.role} onChange={(e) => startTransition(async () => { await updateUserRole(u.id, e.target.value); router.refresh(); })} className="rounded-lg border border-ink/15 bg-paper px-2 py-1.5">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ))}
          {users.length === 0 && <p className="py-2 text-sm text-ink/40">Belum ada pengguna.</p>}
        </div>
      </div>
    </div>
  );
}
