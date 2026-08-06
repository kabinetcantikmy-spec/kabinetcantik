import Link from "next/link";
import Image from "next/image";
import { CATEGORY_LABELS, PortfolioCategory } from "@/data/portfolio";
import { BLUR } from "@/lib/img";

export interface CardProject {
  slug: string;
  tajuk: string;
  kategori: PortfolioCategory;
  cover: string;
  kawasan: string;
  bahan: string[];
}

export default function ProjectCard({ p }: { p: CardProject }) {
  return (
    <Link href={`/portfolio/${p.slug}`} className="group relative block overflow-hidden rounded-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={p.cover}
          alt={p.tajuk}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL={BLUR}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/85 via-ink/10 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
        <span className="text-xs uppercase tracking-wider text-brass-lite">{CATEGORY_LABELS[p.kategori]}</span>
        <span className="font-display text-lg font-semibold text-off-white">{p.tajuk}</span>
        <span className="mt-1 text-xs text-white/70">{p.kawasan} · {p.bahan.slice(0, 2).join(", ")}</span>
        <span className="mt-2 text-sm font-semibold text-brass">Lihat projek →</span>
      </div>
    </Link>
  );
}
