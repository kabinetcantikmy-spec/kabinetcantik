"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabaseBrowser";
import Logo from "@/components/Logo";

export default function AdminLogin() {
  const router = useRouter();
  const [emel, setEmel] = useState("");
  const [kata, setKata] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({ email: emel, password: kata });
      if (error) throw error;
      router.push("/admin");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Log masuk gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-6">
      <form onSubmit={login} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center">
          <Logo className="h-16 w-16" />
          <h1 className="mt-4 font-display text-xl font-semibold tracking-wide text-ink">KABINET CANTIK</h1>
          <p className="text-sm text-ink/50">Panel Admin</p>
        </div>
        <div className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={emel}
            onChange={(e) => setEmel(e.target.value)}
            placeholder="Emel"
            className="w-full rounded-lg border border-ink/15 bg-paper px-4 py-3"
          />
          <input
            type="password"
            required
            value={kata}
            onChange={(e) => setKata(e.target.value)}
            placeholder="Kata laluan"
            className="w-full rounded-lg border border-ink/15 bg-paper px-4 py-3"
          />
        </div>
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        <button type="submit" disabled={busy} className="btn-brass mt-5 w-full">
          {busy ? "Log masuk…" : "Log Masuk"}
        </button>
        <p className="mt-4 text-center text-xs text-ink/40">
          Akaun staf dicipta oleh admin dalam Supabase (jadual <code>profiles</code>).
        </p>
      </form>
    </div>
  );
}
