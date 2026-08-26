import type { Metadata } from "next";
import BookVisitForm from "@/components/BookVisitForm";

export const metadata: Metadata = {
  title: "Tempah Ukur Tapak Percuma",
  description: "Tempah sesi ukur tapak percuma untuk projek kabinet dapur atau wardrobe anda di Klang Valley.",
};

export default function TempahUkurPage() {
  return (
    <section className="container-c max-w-lg pb-16 pt-28">
      <p className="eyebrow">Tempah Ukur Tapak</p>
      <h1 className="mt-2 h-display text-3xl">Ukur tapak percuma</h1>
      <p className="mt-2 text-ink/60">Pilih tarikh, kami datang ukur & bincang reka bentuk di rumah anda — tanpa sebarang bayaran.</p>
      <div className="mt-8">
        <BookVisitForm />
      </div>
    </section>
  );
}
