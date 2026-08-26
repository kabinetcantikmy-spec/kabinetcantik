"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SETUP_STEPS, ENTITI_OPTIONS, BusinessInfo } from "@/lib/onboarding";
import { HomepageConfig } from "@/lib/homepage";
import { saveBusiness, markStep, finishOnboarding } from "@/app/admin/(panel)/setup/actions";
import BrandingEditor from "@/components/admin/BrandingEditor";
import HomepageEditor from "@/components/admin/HomepageEditor";

interface Props {
  orgId: string;
  business: BusinessInfo;
  steps: Record<string, boolean>;
  brand: { nama: string; logoUrl: string };
  homepage: HomepageConfig;
}

export default function SetupJourney({ orgId, business, steps: initialSteps, brand, homepage }: Props) {
  const router = useRouter();
  const [i, setI] = useState(() => {
    const idx = SETUP_STEPS.findIndex((s) => !initialSteps[s.key]);
    return idx === -1 ? 0 : idx;
  });
  const [steps, setSteps] = useState<Record<string, boolean>>(initialSteps);
  const [busy, setBusy] = useState(false);
  const step = SETUP_STEPS[i];
  const isLast = i === SETUP_STEPS.length - 1;
  const doneCount = SETUP_STEPS.filter((s) => steps[s.key]).length;

  async function complete(key: string) {
    setBusy(true);
    await markStep(key, true);
    setSteps((p) => ({ ...p, [key]: true }));
    setBusy(false);
  }
  async function next(key: string) {
    if (!steps[key]) await complete(key);
    if (isLast) {
      setBusy(true);
      await finishOnboarding();
      router.push("/admin?setup=done");
      router.refresh();
      return;
    }
    setI((x) => Math.min(x + 1, SETUP_STEPS.length - 1));
  }

  return (
    <div>
      {/* progress */}
      <div className="rounded-2xl border border-ink/10 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-ink">Bina kedai anda</span>
          <span className="text-ink/50">{doneCount}/{SETUP_STEPS.length} selesai</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-brass transition-all" style={{ width: `${(doneCount / SETUP_STEPS.length) * 100}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {SETUP_STEPS.map((s, idx) => {
            const done = steps[s.key];
            const active = idx === i;
            return (
              <button key={s.key} onClick={() => setI(idx)}
                className={`rounded-lg border px-2 py-2 text-left text-xs transition ${active ? "border-brass bg-brass/5" : "border-ink/10 hover:border-ink/25"}`}>
                <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${done ? "bg-emerald-500 text-white" : active ? "bg-brass text-white" : "bg-ink/10 text-ink/50"}`}>
                  {done ? "✓" : idx + 1}
                </div>
                <div className="mt-1.5 font-medium text-ink">{s.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* step content */}
      <div className="mt-5">
        <h2 className="font-display text-xl font-semibold text-ink">{step.label}</h2>
        <p className="mt-1 text-sm text-ink/50">{step.desc}</p>

        <div className="mt-4">
          {step.key === "perniagaan" && (
            <BusinessForm initial={business} onSaved={() => { setSteps((p) => ({ ...p, perniagaan: true })); setI((x) => x + 1); }} />
          )}
          {step.key === "jenama" && (
            <>
              <BrandingEditor initial={brand} orgId={orgId} />
              <NavButtons busy={busy} showBack onBack={() => setI((x) => x - 1)} onNext={() => next("jenama")} />
            </>
          )}
          {step.key === "laman" && (
            <>
              <HomepageEditor initial={homepage} />
              <NavButtons busy={busy} showBack onBack={() => setI((x) => x - 1)} onNext={() => next("laman")} />
            </>
          )}
          {step.key === "harga" && (
            <LinkStep
              body="Sediakan katalog bahan & kadar harga anda. Bahan & harga yang anda set akan digunakan dalam wizard sebut harga & quote."
              links={[{ href: "/admin/bahan", label: "Buka Bahan & Harga" }, { href: "/admin/tetapan", label: "Tetapan Kadar" }]}
              busy={busy} onBack={() => setI((x) => x - 1)} onNext={() => next("harga")}
            />
          )}
          {step.key === "portfolio" && (
            <LinkStep
              body="Tambah projek pertama anda (gambar + tajuk) supaya laman anda ada karya untuk ditunjuk kepada pelanggan."
              links={[{ href: "/admin/portfolio", label: "Buka Portfolio" }]}
              busy={busy} lastLabel="Selesai & Lancarkan Kedai" onBack={() => setI((x) => x - 1)} onNext={() => next("portfolio")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function BusinessForm({ initial, onSaved }: { initial: BusinessInfo; onSaved: () => void }) {
  const [b, setB] = useState<BusinessInfo>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = <K extends keyof BusinessInfo>(k: K, v: BusinessInfo[K]) => setB((p) => ({ ...p, [k]: v }));
  const input = "mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm";
  const label = "text-xs font-medium text-ink/60";

  async function submit() {
    setErr("");
    if (!b.namaSah.trim()) return setErr("Nama perniagaan wajib.");
    setBusy(true);
    const res = await saveBusiness(b);
    setBusy(false);
    if (!res.ok) return setErr(res.error || "Gagal simpan.");
    onSaved();
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className={label}>Nama perniagaan (berdaftar)</label>
          <input className={input} value={b.namaSah} onChange={(e) => set("namaSah", e.target.value)} placeholder="cth: Melecun Kabinet Sdn Bhd" /></div>
        <div><label className={label}>Jenis entiti</label>
          <select className={input} value={b.jenisEntiti} onChange={(e) => set("jenisEntiti", e.target.value)}>
            <option value="">Pilih…</option>
            {ENTITI_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select></div>
        <div><label className={label}>No. Pendaftaran (SSM)</label>
          <input className={input} value={b.noSsm} onChange={(e) => set("noSsm", e.target.value)} placeholder="cth: 202301234567 (123456-A)" /></div>
        <div><label className={label}>Nama pemilik / wakil</label>
          <input className={input} value={b.pemilik} onChange={(e) => set("pemilik", e.target.value)} /></div>
        <div><label className={label}>Telefon perniagaan</label>
          <input className={input} value={b.telefon} onChange={(e) => set("telefon", e.target.value)} placeholder="cth: 03-xxxx / 01x-xxx" /></div>
        <div className="sm:col-span-2"><label className={label}>Emel perniagaan</label>
          <input type="email" className={input} value={b.emel} onChange={(e) => set("emel", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className={label}>Alamat perniagaan</label>
          <textarea rows={2} className={input} value={b.alamat} onChange={(e) => set("alamat", e.target.value)} /></div>
      </div>
      {err && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
      <div className="mt-4 flex justify-end">
        <button onClick={submit} disabled={busy} className="btn-brass text-sm disabled:opacity-60">
          {busy ? "Menyimpan…" : "Simpan & Teruskan"}
        </button>
      </div>
    </div>
  );
}

function LinkStep({ body, links, busy, lastLabel, onBack, onNext }:
  { body: string; links: { href: string; label: string }[]; busy: boolean; lastLabel?: string; onBack: () => void; onNext: () => void }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <p className="text-sm text-ink/70">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} target="_blank" className="rounded-lg border border-ink/15 px-3 py-2 text-sm hover:bg-paper">
            {l.label} ↗
          </Link>
        ))}
      </div>
      <NavButtons busy={busy} showBack nextLabel={lastLabel || "Dah siap — Teruskan"} onBack={onBack} onNext={onNext} />
    </div>
  );
}

function NavButtons({ busy, showBack, nextLabel, onBack, onNext }:
  { busy: boolean; showBack?: boolean; nextLabel?: string; onBack: () => void; onNext: () => void }) {
  return (
    <div className="mt-5 flex items-center justify-between">
      {showBack ? <button onClick={onBack} disabled={busy} className="btn-ghost text-sm">← Kembali</button> : <span />}
      <button onClick={onNext} disabled={busy} className="btn-brass text-sm disabled:opacity-60">
        {busy ? "Menyimpan…" : (nextLabel || "Teruskan →")}
      </button>
    </div>
  );
}
