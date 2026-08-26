import { supabaseReady } from "@/lib/supabase";
import { createSupabaseServer, requireStaff } from "@/lib/supabaseServer";
import { planForOrg } from "@/lib/planServer";
import PlanLock from "@/components/admin/PlanLock";
import ReviewsEditor, { Review } from "@/components/admin/ReviewsEditor";

export const dynamic = "force-dynamic";

export default async function UlasanAdminPage() {
  const staff = await requireStaff();
  const { features } = await planForOrg(staff.orgId);
  if (!features.blogReviews) return (<div><h1 className="h-display text-2xl">Ulasan</h1><PlanLock tier="Hero" feature="Urus & terbit ulasan pelanggan" /></div>);
  let reviews: Review[] = [];
  if (supabaseReady()) {
    const sb = createSupabaseServer();
    const { data } = await sb.from("reviews").select("*").order("created_at", { ascending: false });
    reviews = (data || []) as Review[];
  }
  return (
    <div>
      <h1 className="h-display text-2xl">Ulasan / Testimoni</h1>
      <p className="mt-1 text-sm text-ink/50">Moderasi & terbitkan ulasan ke laman awam.</p>
      {!supabaseReady() ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">Supabase belum dikonfigurasi.</div>
      ) : (
        <div className="mt-6"><ReviewsEditor reviews={reviews} /></div>
      )}
    </div>
  );
}
