"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/leads", label: "Leads / Pipeline" },
  { href: "/admin/sebutharga", label: "Sebut Harga" },
  { href: "/admin/projek", label: "Projek" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/kalendar", label: "Kalendar" },
  { href: "/admin/bahan", label: "Bahan & Harga" },
  { href: "/admin/pelanggan", label: "Pelanggan" },
  { href: "/admin/pembekal", label: "Pembekal" },
  { href: "/admin/ulasan", label: "Ulasan" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/tetapan", label: "Tetapan" },
];

export default function AdminNav({ horizontal = false }: { horizontal?: boolean }) {
  const path = usePathname();
  return (
    <nav className={horizontal ? "flex gap-1 overflow-x-auto" : "flex flex-col gap-1"}>
      {LINKS.map((l) => {
        const active = l.exact ? path === l.href : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
              active ? "bg-brass text-white" : "text-white/70 hover:bg-white/10"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
