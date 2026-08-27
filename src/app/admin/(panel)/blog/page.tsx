import { supabaseReady } from "@/lib/supabase";
import { createSupabaseServer, requireStaff } from "@/lib/supabaseServer";
import { planForOrg } from "@/lib/planServer";
import PlanLock from "@/components/admin/PlanLock";
import BlogEditor, { Post } from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  const staff = await requireStaff();
  const { features } = await planForOrg(staff.orgId);
  if (!features.blog) return (<div><h1 className="h-display text-2xl">Blog</h1><PlanLock tier="Hero" feature="Blog & penerbitan artikel" /></div>);
  let posts: Post[] = [];
  if (supabaseReady()) {
    const sb = createSupabaseServer();
    const { data } = await sb.from("blog_posts").select("*").order("created_at", { ascending: false });
    posts = (data || []) as Post[];
  }
  return (
    <div>
      <h1 className="h-display text-2xl">Blog</h1>
      <p className="mt-1 text-sm text-ink/50">Tulis artikel SEO (cth “kabinet dapur [bandar]”) untuk tarik trafik organik.</p>
      {!supabaseReady() ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">Supabase belum dikonfigurasi.</div>
      ) : (
        <div className="mt-6"><BlogEditor posts={posts} /></div>
      )}
    </div>
  );
}
