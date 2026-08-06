"use client";
import { useState, useTransition } from "react";
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

export default function BlogEditor({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(null);
  const refresh = () => router.refresh();

  function save(id: string, patch: Record<string, unknown>) {
    startTransition(async () => {
      const r = await updatePost(id, patch);
      if (!r.ok) alert(r.error);
      else refresh();
    });
  }

  return (
    <div>
      <button onClick={() => startTransition(async () => { const r = await createPost(); if (r.ok) { setOpenId(r.id || null); refresh(); } })} disabled={pending} className="btn-brass !px-4 !py-2 text-sm">
        + Artikel Baru
      </button>

      <div className="mt-4 space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="rounded-xl border border-ink/10 bg-white">
            <div className="flex items-center gap-3 p-4">
              <button onClick={() => setOpenId(openId === p.id ? null : p.id)} className="flex-1 text-left">
                <span className="font-semibold text-ink">{p.tajuk}</span>
                <span className="ml-2 text-xs text-ink/40">/{p.slug}</span>
              </button>
              <span className={`rounded-full px-2 py-0.5 text-xs ${p.diterbitkan ? "bg-green-100 text-green-700" : "bg-ink/5 text-ink/50"}`}>
                {p.diterbitkan ? "Terbit" : "Draf"}
              </span>
              <button onClick={() => startTransition(async () => { await deletePost(p.id); refresh(); })} className="text-red-400 hover:text-red-600">✕</button>
            </div>

            {openId === p.id && (
              <div className="space-y-2 border-t border-ink/5 p-4 text-sm">
                <input defaultValue={p.tajuk} onBlur={(e) => e.target.value !== p.tajuk && save(p.id, { tajuk: e.target.value })} placeholder="Tajuk" className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2" />
                <input defaultValue={p.slug} onBlur={(e) => e.target.value !== p.slug && save(p.id, { slug: e.target.value })} placeholder="slug-url" className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2" />
                <input defaultValue={p.cover_url || ""} onBlur={(e) => e.target.value !== (p.cover_url || "") && save(p.id, { cover_url: e.target.value })} placeholder="Pautan gambar cover" className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2" />
                <textarea defaultValue={p.ringkasan || ""} onBlur={(e) => e.target.value !== (p.ringkasan || "") && save(p.id, { ringkasan: e.target.value })} placeholder="Ringkasan (untuk SEO & senarai)" className="h-16 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2" />
                <textarea defaultValue={p.kandungan || ""} onBlur={(e) => e.target.value !== (p.kandungan || "") && save(p.id, { kandungan: e.target.value })} placeholder="Kandungan artikel (pisahkan perenggan dengan baris kosong)" className="h-48 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2" />
                <label className="flex items-center gap-2 text-ink/70">
                  <input type="checkbox" defaultChecked={p.diterbitkan} onChange={(e) => save(p.id, { diterbitkan: e.target.checked })} />
                  Terbitkan ke laman awam
                </label>
              </div>
            )}
          </div>
        ))}
        {posts.length === 0 && <p className="text-sm text-ink/40">Belum ada artikel.</p>}
      </div>
    </div>
  );
}
