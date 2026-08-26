"use client";
import { useState } from "react";
import { saveHomepageConfig, uploadHomepageImage } from "@/app/admin/(panel)/tetapan/actions";
import { HomepageConfig } from "@/lib/homepage";

export default function HomepageEditor({ initial }: { initial: HomepageConfig }) {
  const [c, setC] = useState<HomepageConfig>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [matText, setMatText] = useState(initial.materialChips.join("\n"));

  function setField<K extends keyof HomepageConfig>(k: K, v: HomepageConfig[K]) {
    setC((prev) => ({ ...prev, [k]: v }));
  }
  function setStat(i: number, key: "n" | "l", v: string) {
    setC((prev) => {
      const stats = prev.stats.slice();
      stats[i] = { ...stats[i], [key]: v };
      return { ...prev, stats };
    });
  }

  function setStep(i: number, key: "t" | "d", v: string) {
    setC((prev) => {
      const steps = prev.processSteps.slice();
      steps[i] = { ...steps[i], [key]: v };
      return { ...prev, processSteps: steps };
    });
  }

  async function onImg(e: React.ChangeEvent<HTMLInputElement>, field: "heroImage" | "beforeImage" | "afterImage", slot: string) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(slot);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("slot", slot);
      const res = await uploadHomepageImage(fd);
      if (!res.ok || !res.url) throw new Error(res.error || "gagal");
      setField(field, res.url);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Muat naik imej gagal. Cuba imej lain (PNG/JPG)." });
    } finally {
      setUploading(null);
    }
  }

  async function onSvcImg(e: React.ChangeEvent<HTMLInputElement>, key: "dapur" | "wardrobe" | "tv" | "panel") {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading("svc-" + key);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("slot", "svc-" + key);
      const res = await uploadHomepageImage(fd);
      if (!res.ok || !res.url) throw new Error(res.error || "gagal");
      const url = res.url;
      setC((prev) => ({ ...prev, serviceImages: { ...prev.serviceImages, [key]: url } }));
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Muat naik imej gagal. Cuba imej lain (PNG/JPG)." });
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const materialChips = matText.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
      const res = await saveHomepageConfig({ ...c, materialChips });
      setMsg(res.ok ? { ok: true, text: "Disimpan. Laman awam dikemas kini." } : { ok: false, text: res.error || "Gagal simpan." });
    } catch {
      setMsg({ ok: false, text: "Ada masalah. Cuba lagi." });
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm";
  const label = "text-xs font-medium text-ink/60";

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <h2 className="font-display text-lg font-semibold">Laman Awam (Homepage)</h2>
      <p className="mt-1 text-sm text-ink/50">Teks & maklumat yang dipapar di laman utama syarikat anda.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label}>Eyebrow (baris kecil atas tajuk)</label>
          <input className={input} value={c.heroEyebrow} onChange={(e) => setField("heroEyebrow", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Tajuk utama (hero)</label>
          <input className={input} value={c.heroTitle} onChange={(e) => setField("heroTitle", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Tagline</label>
          <input className={input} value={c.heroTagline} onChange={(e) => setField("heroTagline", e.target.value)} />
        </div>
      </div>

      <div className="mt-5">
        <div className={label}>3 Statistik</div>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {c.stats.map((s, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-ink/10 p-3">
              <input className={input} placeholder="cth: 10+" value={s.n} onChange={(e) => setStat(i, "n", e.target.value)} />
              <input className={input} placeholder="cth: Tahun pengalaman" value={s.l} onChange={(e) => setStat(i, "l", e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className={label}>Gambar laman</div>
        <p className="mt-1 text-xs text-ink/40">Latar hero & gambar sebelum/selepas. Guna gambar projek sendiri untuk laman yang unik (bukan stok).</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {([
            { slot: "hero", field: "heroImage", title: "Latar Hero" },
            { slot: "before", field: "beforeImage", title: "Sebelum" },
            { slot: "after", field: "afterImage", title: "Selepas" },
          ] as const).map((it) => (
            <div key={it.slot} className="space-y-2 rounded-lg border border-ink/10 p-3">
              <div className={label}>{it.title}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c[it.field]} alt={it.title} className="aspect-video w-full rounded border border-ink/10 object-cover" />
              <label className="block cursor-pointer rounded-lg border border-ink/15 px-3 py-2 text-center text-xs hover:bg-paper">
                {uploading === it.slot ? "Memuat naik…" : "Tukar gambar"}
                <input type="file" accept="image/*" className="hidden" disabled={uploading !== null} onChange={(e) => onImg(e, it.field, it.slot)} />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className={label}>Gambar Perkhidmatan (4 tile)</div>
        <p className="mt-1 text-xs text-ink/40">Gambar untuk 4 kategori di section &quot;Apa yang kami reka&quot;.</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-4">
          {([
            { key: "dapur", title: "Kabinet Dapur" },
            { key: "wardrobe", title: "Wardrobe" },
            { key: "tv", title: "TV Cabinet" },
            { key: "panel", title: "Wall Panelling" },
          ] as const).map((it) => (
            <div key={it.key} className="space-y-2 rounded-lg border border-ink/10 p-3">
              <div className={label}>{it.title}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.serviceImages[it.key]} alt={it.title} className="aspect-[3/4] w-full rounded border border-ink/10 object-cover" />
              <label className="block cursor-pointer rounded-lg border border-ink/15 px-3 py-2 text-center text-xs hover:bg-paper">
                {uploading === "svc-" + it.key ? "Memuat naik…" : "Tukar gambar"}
                <input type="file" accept="image/*" className="hidden" disabled={uploading !== null} onChange={(e) => onSvcImg(e, it.key)} />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label className={label}>Senarai bahan (satu per baris)</label>
        <textarea className={input + " h-32"} value={matText} onChange={(e) => setMatText(e.target.value)} placeholder={"Laminat E0\nAcrylic\n4G / 5G Glass"} />
        <p className="mt-1 text-xs text-ink/40">Chip bahan di section &quot;Bahan &amp; Kemasan&quot;. Satu bahan satu baris.</p>
      </div>

      <div className="mt-5">
        <div className={label}>Cara ia berfungsi (4 langkah)</div>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {c.processSteps.map((s, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-ink/10 p-3">
              <div className="text-xs text-ink/40">Langkah {i + 1}</div>
              <input className={input} placeholder="Tajuk langkah" value={s.t} onChange={(e) => setStep(i, "t", e.target.value)} />
              <textarea className={input + " h-16"} placeholder="Penerangan" value={s.d} onChange={(e) => setStep(i, "d", e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label}>Tajuk CTA (bahagian bawah homepage)</label>
          <input className={input} value={c.ctaTitle} onChange={(e) => setField("ctaTitle", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Teks CTA</label>
          <textarea className={input + " h-16"} value={c.ctaText} onChange={(e) => setField("ctaText", e.target.value)} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Nombor WhatsApp</label>
          <input className={input} placeholder="cth: 60123456789" value={c.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} />
          <p className="mt-1 text-xs text-ink/40">Kosong = butang WhatsApp disembunyikan.</p>
        </div>
        <div>
          <label className={label}>Kawasan servis</label>
          <input className={input} placeholder="cth: Klang Valley" value={c.serviceArea} onChange={(e) => setField("serviceArea", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Alamat showroom (pilihan)</label>
          <input className={input} value={c.showroomAddress} onChange={(e) => setField("showroomAddress", e.target.value)} />
        </div>
      </div>

      {msg && (
        <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>
      )}
      <button onClick={save} disabled={busy} className="btn-brass mt-4 text-sm disabled:opacity-60">
        {busy ? "Menyimpan…" : "Simpan Laman"}
      </button>
    </div>
  );
}
