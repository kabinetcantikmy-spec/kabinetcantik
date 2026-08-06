"use client";
import { useState } from "react";

export default function PayButton({ paymentId }: { paymentId: string }) {
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal memulakan bayaran.");
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Ralat.");
      setBusy(false);
    }
  }

  return (
    <button onClick={pay} disabled={busy} className="btn-brass !px-4 !py-2 text-sm">
      {busy ? "Menyambung…" : "Bayar Sekarang"}
    </button>
  );
}
