import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { fmtDate } from "@/lib/format";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

interface Post {
  slug: string;
  tajuk: string;
  ringkasan: string | null;
  kandungan: string | null;
  cover_url: string | null;
  created_at: string;
  diterbitkan: boolean;
}

async function getPost(slug: string): Promise<Post | null> {
  if (!supabaseReady()) return null;
  const sb = createServiceClient();
  const { data } = await sb.from("blog_posts").select("*").eq("slug", slug).eq("diterbitkan", true).single();
  return (data as Post) || null;
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const post = await getPost(params.slug);
  if (!post) return { title: "Artikel tidak dijumpai | KabinetCantik" };
  return {
    title: `${post.tajuk} | KabinetCantik`,
    description: post.ringkasan || undefined,
    openGraph: { title: post.tajuk, description: post.ringkasan || undefined, images: post.cover_url ? [post.cover_url] : undefined, type: "article" },
  };
}

export default async function BlogPost(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = await getPost(params.slug);
  if (!post) notFound();

  const base = process.env.NEXT_PUBLIC_APP_URL || "https://kabinetcantik.com";
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.tajuk,
    description: post.ringkasan || undefined,
    image: post.cover_url || undefined,
    datePublished: post.created_at,
    author: { "@type": "Organization", name: "KabinetCantik" },
    publisher: { "@type": "Organization", name: "KabinetCantik" },
    mainEntityOfPage: `${base}/blog/${post.slug}`,
  };

  return (
    <article className="container-c max-w-3xl pb-10 pt-28">
      <JsonLd data={articleLd} />
      <Link href="/blog" className="text-sm text-ink/50 hover:text-brass">← Semua artikel</Link>
      <div className="mt-3 text-xs text-ink/40">{fmtDate(post.created_at)}</div>
      <h1 className="mt-1 h-display text-3xl sm:text-4xl">{post.tajuk}</h1>
      {post.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        (<img src={post.cover_url} alt={post.tajuk} className="mt-6 aspect-[16/9] w-full rounded-xl object-cover" />)
      )}
      <div className="mt-6 space-y-4 font-serif text-lg leading-relaxed text-ink/85">
        {(post.kandungan || "").split(/\n\n+/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-ink p-6 text-center text-off-white">
        <p className="font-display text-lg text-tan">Suka idea ni? Jom mula projek anda.</p>
        <Link href="/sebut-harga" className="btn-brass mt-3">Dapatkan Sebut Harga Percuma</Link>
      </div>
    </article>
  );
}
