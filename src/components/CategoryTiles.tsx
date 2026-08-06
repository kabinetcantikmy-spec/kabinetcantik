import Link from "next/link";
import Image from "next/image";
import { BLUR } from "@/lib/img";

const TILES = [
  { key: "dapur", label: "Kabinet Dapur", img: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80" },
  { key: "wardrobe", label: "Wardrobe", img: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&q=80" },
  { key: "tv", label: "TV Cabinet", img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80" },
  { key: "panel", label: "Wall Panelling", img: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80" },
];

export default function CategoryTiles() {
  return (
    <section id="perkhidmatan" className="container-c py-20">
      <p className="eyebrow">Perkhidmatan</p>
      <h2 className="mt-2 h-display text-3xl">Apa yang kami reka</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((t) => (
          <Link
            key={t.key}
            href={`/portfolio?kategori=${t.key}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-xl"
          >
            <Image src={t.img} alt={t.label} fill sizes="(max-width:640px) 50vw, 25vw" placeholder="blur" blurDataURL={BLUR} className="object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
            <span className="absolute bottom-4 left-4 font-display text-lg font-semibold tracking-wide text-off-white">
              {t.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
