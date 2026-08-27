"use client";
import { useState, Children, type ReactNode } from "react";

export default function TetapanSections({ labels, children }: { labels: string[]; children: ReactNode }) {
  const nodes = Children.toArray(children);
  const [i, setI] = useState(0);
  const idx = Math.min(Math.max(i, 0), nodes.length - 1);
  return (
    <div>
      <div className="sticky top-0 z-10 mb-4 rounded-xl border border-ink/10 bg-white/90 p-3 backdrop-blur">
        <label className="text-xs font-medium text-ink/60">Pilih bahagian untuk edit</label>
        <select
          value={idx}
          onChange={(e) => setI(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm font-medium text-ink sm:max-w-md"
        >
          {labels.map((l, k) => (
            <option key={k} value={k}>{`${k + 1}. ${l}`}</option>
          ))}
        </select>
      </div>
      {nodes[idx]}
    </div>
  );
}
