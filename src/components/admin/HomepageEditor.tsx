"use client";
import { useState } from "react";
import { saveHomepageConfig, uploadHomepageImage } from "@/app/admin/(panel)/tetapan/actions";
import { HomepageConfig } from "@/lib/homepage";

// Kecilkan imej di client sebelum upload (elak had memori Cloudflare Worker + laman lebih laju).
async function downscaleImage(file: File, maxDim = 1600, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("Gagal muat imej."));
      i.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    if (scale >= 1 && file.size < 1_200_000) { URL.revokeObjectURL(url); return file; }
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) { URL.revokeObjectURL(url); return file; }
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", quality));
    return blob ? new File([blob], "gambar.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

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

  function setSvcLabel(key: "dapur" | "wardrobe" | "tv" | "panel", v: string) {
    setC((prev) => ({ ...prev, svcLabels: { ...prev.svcLabels, [key]: v } }));
  }

  async function onImg(e: React.ChangeEvent<HTMLInputElement>, field: "heroImage" | "beforeImage" | "afterImage", slot: string) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(slot);
    setMsg(null);
    try {
      const blob = await downscaleImage(f);
      const fd = new FormData();
      fd.append("file", blob);
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
      const blob = await downscaleImage(f);
      const fd = new FormData();
      fd.append("file", blob);
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

      {/* Pratonton langsung Hero — berubah masa anda menaip */}
      <div className="mt-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-ink/60">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Pratonton langsung (Hero)
        </div>
        <div className="relative overflow-hidden rounded-xl border border-ink/10 bg-ink" style={{ aspectRatio: "16 / 9" }}>
          {c.heroImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
            {c.heroEyebrow && <p className="text-[10px] font-semibold uppercase tracking-widest text-brass-lite sm:text-xs">{c.heroEyebrow}</p>}
            <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-off-white sm:text-2xl">{c.heroTitle || "Tajuk utama anda"}</h3>
            {c.heroTagline && <p className="mt-1 font-serif text-xs italic text-tan sm:text-sm">{c.heroTagline}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-md bg-brass px-3 py-1 text-[10px] font-semibold text-ink sm:text-xs">{c.heroCta1 || "Butang 1"}</span>
              <span className="rounded-md border border-white/40 px-3 py-1 text-[10px] font-semibold text-off-white sm:text-xs">{c.heroCta2 || "Butang 2"}</span>
            </div>
            <div className="mt-3 grid max-w-md grid-cols-3 gap-2 border-t border-white/15 pt-2">
              {c.stats.slice(0, 3).map((st, i) => (
                <div key={i}>
                  <div className="font-display text-sm font-semibold text-tan">{st.n}</div>
                  <div className="text-[9px] uppercase tracking-wider text-white/60">{st.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-1 text-[11px] text-ink/40">Pratonton berubah masa anda menaip. Tekan &quot;Simpan Laman&quot; untuk terbitkan ke laman sebenar.</p>
      </div>

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
        <div>
          <label className={label}>Butang hero 1</label>
          <input className={input} value={c.heroCta1} onChange={(e) => setField("heroCta1", e.target.value)} />
        </div>
        <div>
          <label className={label}>Butang hero 2</label>
          <input className={input} value={c.heroCta2} onChange={(e) => setField("heroCta2", e.target.value)} />
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

      <div className="mt-6 rounded-lg border border-ink/10 bg-paper/40 p-4">
        <div className="font-display text-sm font-semibold">Tajuk & teks setiap seksyen</div>
        <p className="mt-1 text-xs text-ink/40">Eyebrow = baris kecil atas tajuk. Semua boleh anda tukar ikut bahasa/jenama sendiri.</p>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {/* Perkhidmatan */}
          <div>
            <label className={label}>Perkhidmatan — eyebrow</label>
            <input className={input} value={c.svcEyebrow} onChange={(e) => setField("svcEyebrow", e.target.value)} />
          </div>
          <div>
            <label className={label}>Perkhidmatan — tajuk</label>
            <input className={input} value={c.svcTitle} onChange={(e) => setField("svcTitle", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <div className={label}>Label 4 tile perkhidmatan</div>
            <div className="mt-1 grid gap-2 sm:grid-cols-4">
              <input className={input} value={c.svcLabels.dapur} onChange={(e) => setSvcLabel("dapur", e.target.value)} />
              <input className={input} value={c.svcLabels.wardrobe} onChange={(e) => setSvcLabel("wardrobe", e.target.value)} />
              <input className={input} value={c.svcLabels.tv} onChange={(e) => setSvcLabel("tv", e.target.value)} />
              <input className={input} value={c.svcLabels.panel} onChange={(e) => setSvcLabel("panel", e.target.value)} />
            </div>
          </div>

          {/* Portfolio */}
          <div>
            <label className={label}>Portfolio — eyebrow</label>
            <input className={input} value={c.portEyebrow} onChange={(e) => setField("portEyebrow", e.target.value)} />
          </div>
          <div>
            <label className={label}>Portfolio — tajuk</label>
            <input className={input} value={c.portTitle} onChange={(e) => setField("portTitle", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Portfolio — teks pautan &quot;lihat semua&quot;</label>
            <input className={input} value={c.portMore} onChange={(e) => setField("portMore", e.target.value)} />
          </div>

          {/* Cara ia berfungsi */}
          <div>
            <label className={label}>Cara ia berfungsi — eyebrow</label>
            <input className={input} value={c.stepsEyebrow} onChange={(e) => setField("stepsEyebrow", e.target.value)} />
          </div>
          <div>
            <label className={label}>Cara ia berfungsi — tajuk</label>
            <input className={input} value={c.stepsTitle} onChange={(e) => setField("stepsTitle", e.target.value)} />
          </div>

          {/* Bahan */}
          <div>
            <label className={label}>Bahan — eyebrow</label>
            <input className={input} value={c.matEyebrow} onChange={(e) => setField("matEyebrow", e.target.value)} />
          </div>
          <div>
            <label className={label}>Bahan — tajuk</label>
            <input className={input} value={c.matTitle} onChange={(e) => setField("matTitle", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Bahan — teks pautan &quot;lihat semua&quot;</label>
            <input className={input} value={c.matMore} onChange={(e) => setField("matMore", e.target.value)} />
          </div>

          {/* Sebelum/selepas */}
          <div>
            <label className={label}>Sebelum/selepas — eyebrow</label>
            <input className={input} value={c.baEyebrow} onChange={(e) => setField("baEyebrow", e.target.value)} />
          </div>
          <div>
            <label className={label}>Sebelum/selepas — tajuk</label>
            <input className={input} value={c.baTitle} onChange={(e) => setField("baTitle", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Sebelum/selepas — perenggan</label>
            <textarea className={input + " h-16"} value={c.baText} onChange={(e) => setField("baText", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Sebelum/selepas — teks pautan</label>
            <input className={input} value={c.baMore} onChange={(e) => setField("baMore", e.target.value)} />
          </div>

          {/* Ulasan */}
          <div>
            <label className={label}>Ulasan — eyebrow</label>
            <input className={input} value={c.revEyebrow} onChange={(e) => setField("revEyebrow", e.target.value)} />
          </div>
          <div>
            <label className={label}>Ulasan — tajuk</label>
            <input className={input} value={c.revTitle} onChange={(e) => setField("revTitle", e.target.value)} />
          </div>

          {/* CTA button */}
          <div className="sm:col-span-2">
            <label className={label}>Teks butang CTA (bawah homepage)</label>
            <input className={input} value={c.ctaButton} onChange={(e) => setField("ctaButton", e.target.value)} />
          </div>
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
