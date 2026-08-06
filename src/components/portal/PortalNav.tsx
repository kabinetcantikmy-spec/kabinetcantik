"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/portal", label: "Projek", exact: true },
  { href: "/portal/design", label: "Design" },
  { href: "/portal/bayaran", label: "Bayaran" },
  { href: "/portal/dokumen", label: "Dokumen" },
  { href: "/portal/warranti", label: "Warranti" },
];

export default function PortalNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto">
      {LINKS.map((l) => {
        const active = l.exact ? path === l.href : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
              active ? "bg-brass text-white" : "text-ink/70 hover:bg-ink/5"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
