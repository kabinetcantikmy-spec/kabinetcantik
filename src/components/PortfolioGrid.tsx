"use client";
import { useState } from "react";
import ProjectCard, { CardProject } from "./ProjectCard";
import { CATEGORY_LABELS, PortfolioCategory } from "@/data/portfolio";

type Filter = "all" | PortfolioCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "dapur", label: CATEGORY_LABELS.dapur },
  { key: "wardrobe", label: CATEGORY_LABELS.wardrobe },
  { key: "tv", label: CATEGORY_LABELS.tv },
  { key: "panel", label: CATEGORY_LABELS.panel },
];

export default function PortfolioGrid({ projects, initial = "all" }: { projects: CardProject[]; initial?: Filter }) {
  const [active, setActive] = useState<Filter>(initial);
  const list = active === "all" ? projects : projects.filter((p) => p.kategori === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActive(f.key)}
            className={`rounded-full border px-5 py-2 text-sm transition ${
              active === f.key
                ? "border-brass bg-brass text-white"
                : "border-ink/15 bg-white text-ink/70 hover:border-brass"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => <ProjectCard key={p.slug} p={p} />)}
      </div>
      {list.length === 0 && (
        <p className="mt-10 text-center text-ink/50">Tiada projek dalam kategori ini buat masa ni.</p>
      )}
    </div>
  );
}
