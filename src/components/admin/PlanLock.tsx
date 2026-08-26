import Link from "next/link";

/** Kad upsell bila ciri dikunci oleh pakej. */
export default function PlanLock({ tier, feature }: { tier: "Hero" | "Pro"; feature: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-brass/40 bg-brass/5 p-8 text-center">
      <div className="text-3xl">🔒</div>
      <h2 className="mt-3 font-display text-xl font-semibold text-ink">Ciri Pakej {tier}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
        {feature} tersedia untuk pakej <b>{tier}</b> ke atas. Naik taraf untuk membukanya.
      </p>
      <Link href="/admin/tetapan" className="btn-brass mt-5 inline-block text-sm">Lihat pakej</Link>
    </div>
  );
}
