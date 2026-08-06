"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptQuote } from "@/app/(site)/q/[token]/actions";

export default function AcceptQuote({ token, accepted }: { token: string; accepted: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(accepted);

  if (done) {
    return (
      <div className="rounded-xl bg-green-100 px-5 py-4 text-center text-green-700">
        ✓ Sebut harga telah diterima. Terima kasih! Kami akan hubungi anda untuk langkah seterusnya.
      </div>
    );
  }

  return (
    <button
      onClick={() => startTransition(async () => { const r = await acceptQuote(token); if (r.ok) { setDone(true); router.refresh(); } else alert(r.error); })}
      disabled={pending}
      className="btn-brass w-full"
    >
      {pending ? "Memproses…" : "Terima Sebut Harga Ini"}
    </button>
  );
}
