import type { Metadata } from "next";
import Link from "next/link";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { currentOrg } from "@/lib/tenant";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — Idea Reka Bentuk Dapur & Kabinet",
  description: "Tip, idea & panduan reka bentuk kabinet dapur, wardrobe dan ruang tamu untuk rumah di Klang Valley.",
};

interface Post {
  slug: string;
  tajuk: string;
  ringkasan: string | null;
  cover_url: string | null;
  created_at: string;
}

export default async function BlogIndex() {
  const { orgId } = await currentOrg();
  let posts: Post[] = [];
  if (supabaseReady()) {
    const sb = createServiceClient();
    let q = sb.from("blog_posts").select("slug, tajuk, ringkasan, cover_url, created_at").eq("diterbitkan", true);
    if (orgId) q = q.eq("org_id", orgId);
    const { data } = await q.order("created_at", { ascending: false });
    posts = (data || []) as Post[];
  }

  return (
    <section className="container-c pb-10 pt-28">
      <p className="eyebrow">Blog</p>
      <h1 className="mt-2 h-display text-4xl">Idea & panduan</h1>
      <p className="mt-3 max-w-xl text-ink/60">Inspirasi reka bentuk & tip praktikal untuk projek kabinet anda.</p>

      {posts.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
          Belum ada artikel. Nantikan idea reka bentuk terbaru dari kami.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group overflow-hidden rounded-xl border border-ink/10 bg-white">
              {p.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover_url} alt={p.tajuk} className="aspect-[16/10] w-full object-cover transition group-hover:scale-105" />
              )}
              <div className="p-5">
                <div className="text-xs text-ink/40">{fmtDate(p.created_at)}</div>
                <h2 className="mt-1 font-display text-lg font-semibold text-ink group-hover:text-brass">{p.tajuk}</h2>
                {p.ringkasan && <p className="mt-2 text-sm text-ink/60 line-clamp-3">{p.ringkasan}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
