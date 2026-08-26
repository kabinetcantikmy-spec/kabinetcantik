import { supabaseReady } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabaseServer";
import MaterialsEditor, { Material } from "@/components/admin/MaterialsEditor";

export const dynamic = "force-dynamic";

export default async function BahanPage() {
  let materials: Material[] = [];
  if (supabaseReady()) {
    const sb = createSupabaseServer();
    const { data } = await sb.from("materials").select("*").order("kategori").order("tier");
    materials = (data || []) as Material[];
  }

  return (
    <div>
      <h1 className="h-display text-2xl">Bahan & Harga</h1>
      <p className="mt-1 text-sm text-ink/50">
        Katalog ini digunakan oleh quotation builder. Untuk kadar instant-estimate awam, guna Panel Harga berasingan / jadual settings.
      </p>
      {!supabaseReady() ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
          Supabase belum dikonfigurasi.
        </div>
      ) : (
        <div className="mt-6">
          <MaterialsEditor materials={materials} />
        </div>
      )}
    </div>
  );
}
