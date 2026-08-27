import { redirect } from "next/navigation";
import { currentOrg } from "@/lib/tenant";
import LeadIntakeForm from "@/components/LeadIntakeForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cari Pembuat Kabinet Dipercayai | KabinetCantik",
  description: "Isi sekali — kami hubungkan anda dengan kontraktor kabinet berdaftar di kawasan anda. Percuma.",
};

export default async function CariKontraktorPage() {
  // Halaman PLATFORM — hanya di root domain (kabinetcantik.com). Subdomain tenant → homepage sendiri.
  const { isDefault } = await currentOrg();
  if (!isDefault) redirect("/");

  return (
    <div className="bg-paper">
      <section className="container-c max-w-2xl py-10 sm:py-14">
        <div className="text-center">
          <p className="eyebrow">Percuma · Tanpa komitmen</p>
          <h1 className="mt-2 h-display text-3xl sm:text-4xl">Cari pembuat kabinet dipercayai</h1>
          <p className="mx-auto mt-3 max-w-lg text-ink/70">
            Isi borang sekali. Kami hubungkan anda dengan <b>satu</b> kontraktor kabinet berdaftar di kawasan anda —
            mereka akan hubungi anda untuk sebut harga.
          </p>
        </div>
        <div className="mt-8">
          <LeadIntakeForm />
        </div>
      </section>
    </div>
  );
}
