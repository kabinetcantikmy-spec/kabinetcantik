"use client";
import { useState } from "react";
import Image from "next/image";
import { BLUR } from "@/lib/img";

export default function BeforeAfter({
  before,
  after,
  alt = "Sebelum & selepas",
}: {
  before: string;
  after: string;
  alt?: string;
}) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative w-full select-none overflow-hidden rounded-2xl">
      <div className="relative aspect-[16/10]">
        <Image src={after} alt={`${alt} — selepas`} fill sizes="(max-width:1024px) 100vw, 800px" placeholder="blur" blurDataURL={BLUR} className="object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <div className="relative h-full" style={{ width: "100%", aspectRatio: "16/10" }}>
            <Image src={before} alt={`${alt} — sebelum`} fill sizes="(max-width:1024px) 100vw, 800px" placeholder="blur" blurDataURL={BLUR} className="object-cover" />
          </div>
          <span className="absolute left-3 top-3 rounded bg-ink/70 px-2 py-1 text-xs text-white">Sebelum</span>
        </div>
        <span className="absolute right-3 top-3 rounded bg-brass px-2 py-1 text-xs text-white">Selepas</span>
        <div className="absolute inset-y-0 w-0.5 bg-white/90" style={{ left: `${pos}%` }} />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Slider sebelum selepas"
        className="mt-3 w-full accent-brass"
      />
    </div>
  );
}
