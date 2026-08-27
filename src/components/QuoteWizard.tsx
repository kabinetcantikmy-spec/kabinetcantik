"use client";
import { useEffect, useMemo, useState } from "react";
import { formatRM, Tier, PricingConfig, PRICING, CategoryRate } from "@/lib/pricing";
import { createSupabaseBrowser } from "@/lib/supabaseBrowser";

const TIERS: { key: Tier; label: string; note: string }[] = [
  { key: "economy", label: "Economy", note: "Melamine / laminat asas" },
  { key: "standard", label: "Standard", note: "Laminat E0 / plywood" },
  { key: "premium", label: "Premium", note: "Acrylic / veneer / sintered stone" },
];

const TIMELINES = ["Secepat mungkin", "1–3 bulan", "3–6 bulan", "Sekadar tinjau"];

function displayUnit(u: string): string {
  return u.replace(/kaki lari/gi, "kaki");
}

type WizOption = { key: string; name: string; parts: CategoryRate[] };

function buildOptions(cfg: PricingConfig): WizOption[] {
  const find = (k: string) => cfg.categories.find((c) => c.key === k);
  const opts: WizOption[] = [];
  const bawah = find("dapur_bawah");
  const atas = find("dapur_atas");
  if (bawah && atas) {
    opts.push({ key: "dapur", name: "Kabinet Dapur", parts: [bawah, atas] });
  } else if (bawah) {
    opts.push({ key: bawah.key, name: bawah.name, parts: [bawah] });
  } else if (atas) {
    opts.push({ key: atas.key, name: atas.name, parts: [atas] });
  }
  for (const c of cfg.categories) {
    if (c.key === "dapur_bawah" || c.key === "dapur_atas") continue;
    opts.push({ key: c.key, name: c.name, parts: [c] });
  }
  return opts;
}

function defaultQty(key: string): number {
  if (key === "dapur_bawah") return 12;
  if (key === "dapur_atas") return 10;
  if (key === "panel") return 20;
  return 10;
}

function partLabel(key: string, name: string): string {
  if (key === "dapur_bawah") return "Kabinet bawah";
  if (key === "dapur_atas") return "Kabinet atas";
  return name;
}

export default function QuoteWizard({ initialKategori, config }: { initialKategori?: string; config?: PricingConfig }) {
  const cfg = config ?? PRICING;
  const options = useMemo(() => buildOptions(cfg), [cfg]);

  function initialOptionKey(): string {
    if (initialKategori) {
      if (initialKategori.startsWith("dapur") && options.some((o) => o.key === "dapur")) return "dapur";
      const hit = options.find((o) => o.key === initialKategori);
      if (hit) return hit.key;
    }
    return options[0].key;
  }

  const [step, setStep] = useState(0);
  const [selKeys, setSelKeys] = useState<string[]>(() => [initialOptionKey()]);
  const [tier, setTier] = useState<Tier>("standard");
  const [qtys, setQtys] = useState<Record<string, number>>(() => {
    const o: Record<string, number> = {};
    cfg.categories.forEach((c) => (o[c.key] = defaultQty(c.key)));
    return o;
  });
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState(TIMELINES[1]);
  const [nama, setNama] = useState("");
  const [telefon, setTelefon] = useState("");
  const [emel, setEmel] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ waLink?: string } | null>(null);
  const [error, setError] = useState("");

  // Pulih kemajuan (bukan-peribadi) dari sesi lepas.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kc_wizard");
      if (raw) {
        const s = JSON.parse(raw);
        const restored: string[] = Array.isArray(s.selKeys) ? s.selKeys : s.selKey ? [s.selKey] : [];
        const valid = restored.filter((k) => options.some((o) => o.key === k));
        if (valid.length) setSelKeys(valid);
        if (s.tier) setTier(s.tier);
        if (s.qtys && typeof s.qtys === "object") setQtys((q) => ({ ...q, ...s.qtys }));
        if (s.budget) setBudget(s.budget);
        if (s.timeline) setTimeline(s.timeline);
        if (typeof s.step === "number") setStep(s.step);
      }
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("kc_wizard", JSON.stringify({ selKeys, tier, qtys, budget, timeline, step }));
    } catch {
      /* noop */
    }
  }, [selKeys, tier, qtys, budget, timeline, step]);

  const selected = options.filter((o) => selKeys.includes(o.key));
  const allParts = selected.flatMap((o) => o.parts);

  function toggleOption(key: string) {
    setSelKeys((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  }

  const est = useMemo(() => {
    let base = allParts.reduce((sum, p) => sum + p[tier] * (qtys[p.key] || 0), 0);
    if (base <= 0) return null;
    if (cfg.sstEnabled) base = base * (1 + cfg.sstRate / 100);
    const rp = cfg.publicRangePct / 100;
    return { low: base * (1 - rp), high: base * (1 + rp) };
  }, [allParts, tier, qtys, cfg]);

  const totalQty = allParts.reduce((s, p) => s + (qtys[p.key] || 0), 0);

  const steps = ["Kategori", "Saiz & Bahan", "Bajet & Masa", "Maklumat Anda"];
  const canNext =
    (step === 0 && selKeys.length > 0) ||
    (step === 1 && totalQty > 0) ||
    (step === 2 && !!timeline) ||
    step === 3;

  function setPartQty(key: string, val: number) {
    setQtys((q) => ({ ...q, [key]: val }));
  }

  async function submit() {
    setError("");
    if (!nama.trim() || !telefon.trim() || !emel.trim()) {
      setError("Sila isi nama, nombor telefon & emel.");
      return;
    }
    setSubmitting(true);
    try {
      const photos: string[] = [];
      if (files.length) {
        try {
          const sb = createSupabaseBrowser();
          for (const f of files.slice(0, 5)) {
            const path = `${Date.now()}-${Math.round(totalQty)}-${f.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
            const { error: upErr } = await sb.storage.from("lead-photos").upload(path, f, { upsert: false });
            if (!upErr) {
              const { data: pub } = sb.storage.from("lead-photos").getPublicUrl(path);
              if (pub?.publicUrl) photos.push(pub.publicUrl);
            }
          }
        } catch {
          /* upload pilihan — abaikan kegagalan */
        }
      }

      const partQtys: Record<string, number> = {};
      allParts.forEach((p) => (partQtys[p.key] = qtys[p.key] || 0));

      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          telefon,
          emel,
          kategori: allParts.map((p) => p.key),
          jawapan_wizard: { options: selKeys, tier, qtys: partQtys, budget, timeline },
          estimate: est ? { low: Math.round(est.low), high: Math.round(est.high) } : null,
          photos,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Ralat menghantar.");
      try {
        localStorage.removeItem("kc_wizard");
      } catch {
        /* noop */
      }
      setDone({ waLink: data.waLink });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ralat menghantar. Cuba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-2xl text-brass">✓</div>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink">Terima kasih, {nama.split(" ")[0]}!</h2>
        <p className="mt-2 text-ink/70">
          Permintaan anda diterima. Team kami akan hubungi dalam masa 1 jam pada waktu bekerja.
        </p>
        {est && (
          <div className="mx-auto mt-6 max-w-sm rounded-xl bg-ink p-5 text-off-white">
            <div className="text-xs uppercase tracking-wider text-white/60">Anggaran awal anda</div>
            <div className="mt-1 font-serif text-3xl text-tan">
              {formatRM(est.low)} – {formatRM(est.high)}
            </div>
            <p className="mt-2 text-xs text-white/50">Julat indikatif untuk semua yang dipilih. Harga tepat selepas ukur tapak.</p>
          </div>
        )}
        {done.waLink && (
          <a href={done.waLink} target="_blank" rel="noopener noreferrer" className="btn-brass mt-6">
            Sambung di WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
        {/* progress */}
        <div className="mb-6 flex gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-brass" : "bg-ink/10"}`} />
              <span className={`mt-2 block text-[11px] ${i === step ? "text-brass font-semibold" : "text-ink/40"}`}>{s}</span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Apa yang anda nak reka?</h2>
            <p className="mt-1 text-sm text-ink/50">Boleh pilih lebih dari satu — cth dapur + TV cabinet + wardrobe.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {options.map((o) => {
                const on = selKeys.includes(o.key);
                return (
                  <button
                    key={o.key}
                    onClick={() => toggleOption(o.key)}
                    className={`relative rounded-xl border p-4 text-left transition ${
                      on ? "border-brass bg-brass/5" : "border-ink/15 hover:border-brass/50"
                    }`}
                  >
                    <div className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-md border text-[11px] ${on ? "border-brass bg-brass text-white" : "border-ink/25 text-transparent"}`}>✓</div>
                    <div className="font-semibold text-ink">{o.name}</div>
                    <div className="text-xs text-ink/50">
                      {o.key === "dapur" ? "atas + bawah" : `per ${displayUnit(o.parts[0].unit)}`}
                    </div>
                  </button>
                );
              })}
            </div>
            {selKeys.length > 0 && (
              <p className="mt-3 text-xs text-brass">{selKeys.length} dipilih</p>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Saiz & pilihan bahan</h2>

            <div className="mt-4 space-y-5">
              {selected.map((o) => (
                <div key={o.key} className="rounded-xl border border-ink/10 bg-paper/40 p-4">
                  <div className="text-sm font-semibold text-ink">{o.name}</div>
                  <div className="mt-3 space-y-3">
                    {o.parts.map((p) => (
                      <div key={p.key}>
                        <label className="block text-sm font-medium text-ink/80">
                          {partLabel(p.key, p.name)} — anggaran saiz ({displayUnit(p.unit)})
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={qtys[p.key] ?? 0}
                          onChange={(e) => setPartQty(p.key, parseFloat(e.target.value) || 0)}
                          className="mt-2 w-full rounded-lg border border-ink/15 bg-white px-4 py-3"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink/45">Tak pasti saiz? Anggar je — kami sahkan masa ukur tapak.</p>

            <div className="mt-5">
              <label className="block text-sm font-medium text-ink/80">Pilihan bahan / kemasan</label>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {TIERS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTier(t.key)}
                    className={`rounded-xl border p-3 text-left transition ${
                      tier === t.key ? "border-brass bg-brass/5" : "border-ink/15 hover:border-brass/50"
                    }`}
                  >
                    <div className="font-semibold text-ink">{t.label}</div>
                    <div className="mt-0.5 text-[11px] text-ink/50">{t.note}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Bajet & jangka masa</h2>
            <label className="mt-4 block text-sm font-medium text-ink/80">Bajet dalam fikiran (pilihan)</label>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="cth: RM15,000"
              className="mt-2 w-full rounded-lg border border-ink/15 bg-paper px-4 py-3"
            />
            <label className="mt-5 block text-sm font-medium text-ink/80">Bila nak mula?</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TIMELINES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeline(t)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    timeline === t ? "border-brass bg-brass text-white" : "border-ink/15 hover:border-brass"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Maklumat anda</h2>
            <div className="mt-4 space-y-3">
              <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama penuh *" className="w-full rounded-lg border border-ink/15 bg-paper px-4 py-3" />
              <input value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="Nombor telefon (WhatsApp) *" className="w-full rounded-lg border border-ink/15 bg-paper px-4 py-3" />
              <input type="email" required value={emel} onChange={(e) => setEmel(e.target.value)} placeholder="Emel *" className="w-full rounded-lg border border-ink/15 bg-paper px-4 py-3" />
              <p className="text-xs text-ink/45">Sebut harga & kemas kini projek akan dihantar ke emel ini.</p>
              <div>
                <label className="block text-sm font-medium text-ink/80">Gambar ruang (pilihan)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))}
                  className="mt-1 w-full text-sm text-ink/60 file:mr-3 file:rounded-lg file:border-0 file:bg-brass file:px-4 file:py-2 file:text-white"
                />
                {files.length > 0 && <p className="mt-1 text-xs text-ink/50">{files.length} gambar dipilih (maks 5).</p>}
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        )}

        {/* nav */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-sm text-ink/50 disabled:opacity-0"
          >
            ← Kembali
          </button>
          {step < 3 ? (
            <button onClick={() => canNext && setStep((s) => s + 1)} className="btn-brass" disabled={!canNext}>
              Seterusnya
            </button>
          ) : (
            <button onClick={submit} className="btn-brass" disabled={submitting}>
              {submitting ? "Menghantar…" : "Hantar & Dapat Anggaran"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
