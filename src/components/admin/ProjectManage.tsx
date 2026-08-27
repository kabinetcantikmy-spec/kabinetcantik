"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rm2 } from "@/lib/format";
import { PROJECT_STAGES, Payment, Design, WarrantyClaim } from "@/lib/portal";
import { updateProjectStatus, addPayment, addDesign, updateWarrantyStatus, requestReview } from "@/app/admin/(panel)/projek/actions";
import { uploadHomepageImage } from "@/app/admin/(panel)/tetapan/actions";

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
    canvas.width = w; canvas.height = h;
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

async function uploadFile(file: File, slot: string): Promise<string> {
  const blob = await downscaleImage(file);
  const fd = new FormData();
  fd.append("file", blob);
  fd.append("slot", slot);
  const res = await uploadHomepageImage(fd);
  if (!res.ok || !res.url) throw new Error(res.error || "Muat naik gagal.");
  return res.url;
}

export default function ProjectManage({
  projectId,
  status,
  payments,
  designs,
  claims,
}: {
  projectId: string;
  status: string;
  payments: Payment[];
  designs: Design[];
  claims: WarrantyClaim[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const refresh = () => router.refresh();
  const [payJenis, setPayJenis] = useState("progress");
  const [payAmt, setPayAmt] = useState("");
  const [dTajuk, setDTajuk] = useState("");
  const [dUrl, setDUrl] = useState("");
  const [nota, setNota] = useState("");
  const [uploading, setUploading] = useState(false);
  const progresFotos = designs.filter((d) => d.tajuk === "Progres kerja");

  async function onProgresFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) {
        const url = await uploadFile(f, "projek-progres");
        await addDesign(projectId, "Progres kerja", url);
      }
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Muat naik gagal.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Laporan Progres untuk pelanggan */}
      <div className="rounded-xl border border-brass/30 bg-brass/[0.03] p-4 lg:col-span-2">
        <h3 className="font-display font-semibold text-ink">Laporan Progres untuk pelanggan</h3>
        <p className="mt-1 text-sm text-ink/50">Taip kemas kini ringkas, jana PDF berjenama untuk dihantar ke pelanggan (WhatsApp/emel).</p>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Cth: Kabinet dah siap difabrikasi. Pemasangan dijadualkan minggu depan, insyaAllah siap sepenuhnya hujung bulan."
          className="mt-2 h-20 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => window.open(`/admin/projek/${projectId}/laporan?nota=${encodeURIComponent(nota)}`, "_blank")}
          className="btn-brass mt-2 !px-4 !py-2 text-sm"
        >
          Jana Laporan PDF →
        </button>

        <div className="mt-4">
          <label className="text-xs font-medium text-ink/60">Gambar progres kerja</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {progresFotos.map((d) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={d.id} src={d.image_url} alt="Progres" className="h-16 w-16 rounded-lg border border-ink/10 object-cover" />
            ))}
            <label className={`flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-brass text-brass ${uploading ? "opacity-50" : ""}`}>
              <span className="text-lg leading-none">+</span>
              <span className="text-[10px] font-semibold">{uploading ? "..." : "Tambah"}</span>
              <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={onProgresFiles} />
            </label>
          </div>
          <p className="mt-1 text-[11px] text-ink/45">Boleh pilih banyak gambar sekali gus. Semua gambar masuk dalam PDF laporan.</p>
        </div>
      </div>

      {/* Status + designs */}
      <div className="space-y-6">
        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <label className="text-xs uppercase tracking-wider text-ink/50">Status projek</label>
          <select
            defaultValue={status}
            onChange={(e) => startTransition(async () => { await updateProjectStatus(projectId, e.target.value); refresh(); })}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm"
          >
            {PROJECT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => startTransition(async () => {
              const r = await requestReview(projectId);
              if (r.ok) { if (r.waLink) window.open(r.waLink, "_blank"); else alert("Jemputan review dihantar."); }
              else alert(r.error);
            })}
            disabled={pending}
            className="btn-ghost mt-3 w-full !py-2 text-sm"
          >
            Minta Ulasan Pelanggan
          </button>
        </div>

        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <h3 className="font-display font-semibold text-ink">Reka bentuk (render)</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <input value={dTajuk} onChange={(e) => setDTajuk(e.target.value)} placeholder="Tajuk" className="flex-1 rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
            <input value={dUrl} onChange={(e) => setDUrl(e.target.value)} placeholder="Pautan imej" className="flex-1 rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
            <button onClick={() => startTransition(async () => { const r = await addDesign(projectId, dTajuk, dUrl); if (r.ok) { setDTajuk(""); setDUrl(""); refresh(); } else alert(r.error); })} disabled={pending} className="btn-brass !px-4 !py-2 text-sm">Tambah</button>
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {designs.map((d) => (
              <li key={d.id} className="flex items-center gap-2">
                <span className="flex-1 truncate text-ink/70">{d.tajuk || d.image_url}</span>
                <span className={`rounded px-1.5 py-0.5 text-xs ${d.status === "approved" ? "bg-green-100 text-green-700" : d.status === "revision" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>{d.status}</span>
              </li>
            ))}
            {designs.length === 0 && <li className="text-ink/40">Belum ada render.</li>}
          </ul>
        </div>
      </div>

      {/* Payments + warranty */}
      <div className="space-y-6">
        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <h3 className="font-display font-semibold text-ink">Milestone bayaran</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <select value={payJenis} onChange={(e) => setPayJenis(e.target.value)} className="rounded-lg border border-ink/15 bg-paper px-2 py-2 text-sm">
              <option value="deposit">Deposit</option>
              <option value="progress">Progres</option>
              <option value="final">Akhir</option>
            </select>
            <input type="number" value={payAmt} onChange={(e) => setPayAmt(e.target.value)} placeholder="Jumlah (RM)" className="flex-1 rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
            <button onClick={() => startTransition(async () => { const r = await addPayment(projectId, payJenis, Number(payAmt)); if (r.ok) { setPayAmt(""); refresh(); } else alert(r.error); })} disabled={pending} className="btn-brass !px-4 !py-2 text-sm">Tambah</button>
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span className="text-ink/70">{p.jenis} · {rm2(p.jumlah)}</span>
                <span className={p.status === "paid" ? "text-green-600" : "text-amber-600"}>{p.status === "paid" ? "Dibayar" : "Menunggu"}</span>
              </li>
            ))}
            {payments.length === 0 && <li className="text-ink/40">Belum ada milestone.</li>}
          </ul>
        </div>

        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <h3 className="font-display font-semibold text-ink">Tuntutan warranti</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {claims.map((c) => (
              <li key={c.id} className="rounded-lg bg-paper p-2">
                <div className="text-ink/80">{c.keterangan}</div>
                <div className="mt-1 flex gap-2">
                  {["baru", "dalam_proses", "selesai"].map((s) => (
                    <button key={s} onClick={() => startTransition(async () => { await updateWarrantyStatus(c.id, projectId, s); refresh(); })} className={`rounded px-2 py-0.5 text-xs ${c.status === s ? "bg-brass text-white" : "bg-ink/5 text-ink/60"}`}>{s}</button>
                  ))}
                </div>
              </li>
            ))}
            {claims.length === 0 && <li className="text-ink/40">Tiada tuntutan.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
