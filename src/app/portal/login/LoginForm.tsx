"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabaseBrowser";
import Logo from "@/components/Logo";

export default function PortalLoginForm({ brand }: { brand: { nama: string; logoUrl: string } }) {
  const router = useRouter();
  const [emel, setEmel] = useState("");
  const [kata, setKata] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({ email: emel, password: kata });
      if (error) throw error;
      router.push("/portal");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Log masuk gagal.");
    } finally {
      setBusy(false);
    }
  }

  async function sendOtp() {
    setErr("");
    if (!emel) { setErr("Masukkan emel dahulu."); return; }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOtp({
        email: emel,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/portal` },
      });
      if (error) throw error;
      setOtpSent(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menghantar pautan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <form onSubmit={login} className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center">
          <Logo className="h-16 w-16" src={brand.logoUrl} alt={brand.nama} />
          <h1 className="mt-4 font-display text-xl font-semibold tracking-wide text-ink">{brand.nama}</h1>
          <p className="text-sm text-ink/50">Portal Pelanggan</p>
        </div>
        <div className="mt-6 space-y-3">
          <input type="email" required value={emel} onChange={(e) => setEmel(e.target.value)} placeholder="Emel" className="w-full rounded-lg border border-ink/15 bg-paper px-4 py-3" />
          <input type="password" required value={kata} onChange={(e) => setKata(e.target.value)} placeholder="Kata laluan" className="w-full rounded-lg border border-ink/15 bg-paper px-4 py-3" />
        </div>
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        {otpSent && <p className="mt-3 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700">Pautan log masuk dihantar ke emel anda. Sila semak inbox.</p>}
        <button type="submit" disabled={busy} className="btn-brass mt-5 w-full">
          {busy ? "Log masuk…" : "Log Masuk"}
        </button>
        <div className="mt-3 flex items-center gap-2 text-xs text-ink/40">
          <span className="h-px flex-1 bg-ink/10" /> atau <span className="h-px flex-1 bg-ink/10" />
        </div>
        <button type="button" onClick={sendOtp} disabled={busy} className="btn-ghost mt-3 w-full text-sm">
          Hantar pautan log masuk ke emel
        </button>
        <p className="mt-4 text-center text-xs text-ink/40">
          Akses portal diberi selepas projek anda bermula. Ada masalah? Hubungi kami di WhatsApp.
        </p>
      </form>
    </div>
  );
}
