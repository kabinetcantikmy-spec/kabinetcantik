import Link from "next/link";
import { requireStaff } from "@/lib/supabaseServer";
import { signOut } from "../auth-actions";
import AdminNav from "@/components/admin/AdminNav";
import Logo from "@/components/Logo";
import { tenantBrand } from "@/lib/branding";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const brand = await tenantBrand(staff.orgId);
  return (
    <div className="min-h-screen bg-paper">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-ink p-4 text-white md:flex print:!hidden">
        <Link href="/admin" className="mb-6 flex items-center gap-2 px-1">
          <Logo src={brand.logoUrl} alt={brand.nama} className="h-9 w-9" />
          <span className="font-display text-sm font-semibold tracking-widest text-tan">{brand.nama}</span>
        </Link>
        <AdminNav />
        {staff.isPlatformAdmin && (
          <Link href="/admin/owner" className="mt-2 rounded-lg bg-brass/20 px-3 py-2 text-sm font-semibold text-tan hover:bg-brass/30">⚙ Kawalan Platform
          </Link>
        )}
        <div className="mt-auto border-t border-ink-line pt-3">
          <div className="px-3 text-xs text-white/50">{staff.nama}</div>
          <div className="px-3 pb-2 text-[11px] uppercase tracking-wider text-brass-lite">{staff.role}</div>
          <form action={signOut}>
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10">
              Log Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink/10 bg-ink px-4 py-3 text-white md:hidden print:!hidden">
        <Logo src={brand.logoUrl} alt={brand.nama} className="h-8 w-8" />
        <span className="font-display text-sm tracking-widest text-tan">{brand.nama}</span>
        <form action={signOut} className="ml-auto">
          <button className="text-sm text-white/70">Keluar</button>
        </form>
      </header>
      <div className="sticky top-[52px] z-10 border-b border-ink/10 bg-ink px-2 py-1.5 md:hidden print:!hidden">
        <AdminNav horizontal />
      </div>

      <div className="md:pl-60 print:!pl-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
