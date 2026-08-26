"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabaseBrowser";
import { registerTenant } from "./actions";
import Logo from "@/components/Logo";

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
}

export default function DaftarPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [emel, setEmel] = useState("");
  const [kata, setKata] = useState("");
  const [kata2, setKata2] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null); // emel pengesahan dihantar

  function onNama(v: string) {
    setNama(v);
    if (!slugEdited) setSlug(slugify(v));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (kata !== kata2) return setErr("Kata laluan tak sama.");
    if (kata.length < 8) return setErr("Kata laluan mesti sekurang-kurangnya 8 aksara.");
    setBusy(true);
    try {
      const res = await registerTenant({ nama, slug, email: emel, password: kata, hp });
      if (!res.ok) {
        setErr(res.error);
        setBusy(false);
        return;
      }
      if (res.mode === "verify") {
        setSentTo(res.email || emel);
        setBusy(false);
        return;
      }
      // Mod terus: auto log masuk guna kredensial yang baru didaftar.
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({ email: emel, password: kata });
      if (error) {
        router.push("/admin/login?daftar=ok");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setErr("Ada masalah. Cuba lagi sekejap.");
      setBusy(false);
    }
  }

  // Skrin selepas emel pengesahan dihantar.
  if (sentTo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <Logo className="mx-auto h-14 w-14" />
          <h1 className="mt-4 font-display text-xl font-semibold text-ink">Semak emel anda</h1>
          <p className="mt-2 text-sm text-ink/60">
            Kami dah hantar pautan pengesahan ke<br />
            <span className="font-medium text-ink">{sentTo}</span>
          </p>
          <p className="mt-4 text-sm text-ink/50">
            Klik pautan dalam emel tu untuk sahkan &amp; terus masuk panel anda. Tak nampak? Semak folder
            spam/promosi.
          </p>
          <p className="mt-6 text-xs text-ink/40">
            Salah emel? <button onClick={() => setSentTo(null)} className="text-brass underline">Daftar semula</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center">
          <Logo className="h-14 w-14" />
          <h1 className="mt-4 font-display text-xl font-semibold tracking-wide text-ink">Daftar Syarikat</h1>
          <p className="text-sm text-ink/50">Cuba percuma 14 hari — tiada kad kredit.</p>
        </div>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-xs font-medium text-ink/60">Nama syarikat</label>
            <input required value={nama} onChange={(e) => onNama(e.target.value)} placeholder="cth: Melecun Kabinet"
              className="mt-1 w-full rounded-lg border border-ink/15 bg-paper px-4 py-2.5" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60">Alamat portal (slug)</label>
            <div className="mt-1 flex items-center rounded-lg border border-ink/15 bg-paper px-3">
              <input required value={slug}
                onChange={(e) => { setSlug(slugify(e.target.value)); setSlugEdited(true); }}
                placeholder="melecun" className="w-full bg-transparent py-2.5 font-mono text-sm outline-none" />
              <span className="whitespace-nowrap text-sm text-ink/40">.kabinetcantik.com</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60">Emel admin</label>
            <input type="email" required value={emel} onChange={(e) => setEmel(e.target.value)} placeholder="anda@syarikat.com"
              className="mt-1 w-full rounded-lg border border-ink/15 bg-paper px-4 py-2.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink/60">Kata laluan</label>
              <input type="password" required value={kata} onChange={(e) => setKata(e.target.value)} placeholder="min 8 aksara"
                className="mt-1 w-full rounded-lg border border-ink/15 bg-paper px-4 py-2.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/60">Ulang kata laluan</label>
              <input type="password" required value={kata2} onChange={(e) => setKata2(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink/15 bg-paper px-4 py-2.5" />
            </div>
          </div>
          {/* honeypot — tersembunyi dari manusia */}
          <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)}
            className="hidden" aria-hidden="true" />
        </div>

        {err && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

        <button type="submit" disabled={busy} className="btn-brass mt-5 w-full disabled:opacity-60">
          {busy ? "Mendaftar…" : "Daftar & Mula Percuma"}
        </button>

        <p className="mt-4 text-center text-xs text-ink/40">
          Dah ada akaun? <Link href="/admin/login" className="text-brass underline">Log masuk</Link>
        </p>
      </form>
    </div>
  );
}
