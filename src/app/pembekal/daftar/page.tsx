"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { registerSupplier } from "../register-actions";

export default function SupplierRegister() {
  const [f, setF] = useState({ nama: "", syarikat: "", no_ssm: "", telefon: "", emel: "", bank: "", no_akaun: "", jenis: "pembekal", password: "" });
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const r = await registerSupplier(f);
      if (r.ok) setDone(true);
      else setErr(r.error || "Gagal.");
    });
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6">
        <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-2xl text-brass">✓</div>
          <h1 className="mt-4 font-display text-xl font-semibold text-ink">Pendaftaran diterima!</h1>
          <p className="mt-2 text-ink/60">Akaun anda sedang disemak. Anda akan dimaklumkan bila diluluskan.</p>
          <Link href="/pembekal/login" className="btn-brass mt-6">Ke Log Masuk</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-ink/10 bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center">
          <Logo className="h-14 w-14" />
          <h1 className="mt-3 font-display text-lg font-semibold tracking-wide text-ink">Daftar Pembekal / Installer</h1>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input required value={f.nama} onChange={(e) => set("nama", e.target.value)} placeholder="Nama penuh *" className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm" />
          <input value={f.syarikat} onChange={(e) => set("syarikat", e.target.value)} placeholder="Nama syarikat" className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm" />
          <input value={f.no_ssm} onChange={(e) => set("no_ssm", e.target.value)} placeholder="No. SSM" className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm" />
          <input value={f.telefon} onChange={(e) => set("telefon", e.target.value)} placeholder="Telefon" className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm" />
          <select value={f.jenis} onChange={(e) => set("jenis", e.target.value)} className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm">
            <option value="pembekal">Pembekal</option>
            <option value="installer">Installer</option>
          </select>
          <input value={f.bank} onChange={(e) => set("bank", e.target.value)} placeholder="Bank" className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm" />
          <input value={f.no_akaun} onChange={(e) => set("no_akaun", e.target.value)} placeholder="No. akaun bank" className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm sm:col-span-2" />
          <input type="email" required value={f.emel} onChange={(e) => set("emel", e.target.value)} placeholder="Emel *" className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm sm:col-span-2" />
          <input type="password" required value={f.password} onChange={(e) => set("password", e.target.value)} placeholder="Kata laluan (min 6) *" className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm sm:col-span-2" />
        </div>
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        <button type="submit" disabled={pending} className="btn-brass mt-5 w-full">{pending ? "Menghantar…" : "Daftar"}</button>
        <p className="mt-4 text-center text-sm text-ink/50">Dah ada akaun? <Link href="/pembekal/login" className="font-semibold text-brass hover:underline">Log masuk</Link></p>
      </form>
    </div>
  );
}
