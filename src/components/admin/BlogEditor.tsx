"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost, deletePost } from "@/app/admin/(panel)/blog/actions";

export interface Post {
  id: string;
  slug: string;
  tajuk: string;
  ringkasan: string | null;
  kandungan: string | null;
  cover_url: string | null;
  diterbitkan: boolean;
}

interface FormState {
  tajuk: string;
  slug: string;
  cover_url: string;
  ringkasan: string;
  kandungan: string;
  diterbitkan: boolean;
}

export default function BlogEditor({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ tajuk: "", slug: "", cover_url: "", ringkasan: "", kandungan: "", diterbitkan: false });
  const [msg, setMsg] = useState("");
  const refresh = () => router.refresh();

  // Muat borang bila artikel dibuka / senarai dikemas kini.
  useEffect(() => {
    if (openId && loadedId !== openId) {
      const p = posts.find((x) => x.id === openId);
      if (p) {
        setForm({ tajuk: p.tajuk, slug: p.slug, cover_url: p.cover_url || "", ringkasan: p.ringkasan || "", kandungan: p.kandungan || "", diterbitkan: p.diterbitkan });
        setLoadedId(openId);
        setMsg("");
      }
    }
  }, [openId, loadedId, posts]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  function toggleOpen(id: string) {
    setMsg("");
    setOpenId((cur) => (cur === id ? null : id));
  }

  function save(id: string) {
    setMsg("");
    startTransition(async () => {
      const r = await updatePost(id, form);
      if (!r.ok) setMsg(r.error || "Gagal simpan.");
      else { setMsg("Disimpan ✓"); refresh(); }
    });
  }

  const input = "w-full rounded-lg border border-ink/15 bg-paper px-3 py-2";

  return (
    <div>
      <button onClick={() => startTransition(async () => { const r = await createPost(); if (r.ok) { setLoadedId(null); setOpenId(r.id || null); refresh(); } })} disabled={pending} className="btn-brass !px-4 !py-2 text-sm">
        + Artikel Baru
      </button>

      <div className="mt-4 space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="rounded-xl border border-ink/10 bg-white">
            <div className="flex items-center gap-3 p-4">
              <button onClick={() => toggleOpen(p.id)} className="flex-1 text-left">
                <span className="font-semibold text-ink">{p.tajuk}</span>
                <span className="ml-2 text-xs text-ink/40">/{p.slug}</span>
              </button>
              <span className={`rounded-full px-2 py-0.5 text-xs ${p.diterbitkan ? "bg-green-100 text-green-700" : "bg-ink/5 text-ink/50"}`}>
                {p.diterbitkan ? "Terbit" : "Draf"}
              </span>
              <button onClick={() => { if (confirm("Padam artikel ini?")) startTransition(async () => { await deletePost(p.id); if (openId === p.id) setOpenId(null); refresh(); }); }} className="text-red-400 hover:text-red-600">✕</button>
            </div>

            {openId === p.id && (
              <div className="space-y-2 border-t border-ink/5 p-4 text-sm">
                <input value={form.tajuk} onChange={(e) => set("tajuk", e.target.value)} placeholder="Tajuk" className={input} />
                <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="slug-url" className={input} />
                <input value={form.cover_url} onChange={(e) => set("cover_url", e.target.value)} placeholder="Pautan gambar cover" className={input} />
                <textarea value={form.ringkasan} onChange={(e) => set("ringkasan", e.target.value)} placeholder="Ringkasan (untuk SEO & senarai)" className={`h-16 ${input}`} />
                <textarea value={form.kandungan} onChange={(e) => set("kandungan", e.target.value)} placeholder="Kandungan artikel (pisahkan perenggan dengan baris kosong)" className={`h-48 ${input}`} />
                <label className="flex items-center gap-2 text-ink/70">
                  <input type="checkbox" checked={form.diterbitkan} onChange={(e) => set("diterbitkan", e.target.checked)} />
                  Terbitkan ke laman awam
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={() => save(p.id)} disabled={pending} className="btn-brass !px-4 !py-2 text-sm disabled:opacity-60">
                    {pending ? "Menyimpan…" : "Simpan Artikel"}
                  </button>
                  {msg && <span className={`text-sm ${msg.includes("✓") ? "text-emerald-600" : "text-red-600"}`}>{msg}</span>}
                </div>
              </div>
            )}
          </div>
        ))}
        {posts.length === 0 && <p className="text-sm text-ink/40">Belum ada artikel.</p>}
      </div>
    </div>
  );
}
