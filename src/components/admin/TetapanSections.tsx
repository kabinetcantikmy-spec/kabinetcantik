"use client";
import { useState, Children, type ReactNode } from "react";

export default function TetapanSections({ labels, children }: { labels: string[]; children: ReactNode }) {
  const nodes = Children.toArray(children);
  // Buka bahagian pertama secara lalai; -1 = semua tutup.
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-2">
      {nodes.map((node, k) => {
        const isOpen = open === k;
        return (
          <div key={k}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : k)}
              className={`flex w-full items-center justify-between rounded-xl border border-ink/10 px-5 py-4 text-left transition ${isOpen ? "bg-paper" : "bg-white hover:bg-paper"}`}
            >
              <span className="font-display text-base font-semibold text-ink">
                <span className="mr-2 text-ink/30">{k + 1}.</span>{labels[k]}
              </span>
              <span className={`text-ink/40 transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {/* Kekal mount (simpan state edit), sembunyi bila tutup */}
            <div className={isOpen ? "mt-2" : "hidden"}>{node}</div>
          </div>
        );
      })}
    </div>
  );
}
