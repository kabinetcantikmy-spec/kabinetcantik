import Link from "next/link";
import { requireCustomer } from "@/lib/supabaseServer";
import { signOutPortal } from "../auth-actions";
import PortalNav from "@/components/portal/PortalNav";
import Logo from "@/components/Logo";
import { tenantBrand } from "@/lib/branding";
import { planForOrg } from "@/lib/planServer";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const cust = await requireCustomer();
  const brand = await tenantBrand(cust.orgId);
  const { features } = await planForOrg(cust.orgId);
  if (!features.customerPortal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6">
        <div className="max-w-md rounded-2xl border border-ink/10 bg-white p-8 text-center">
          <div className="text-3xl">🔒</div>
          <h1 className="mt-3 font-display text-xl font-semibold text-ink">Portal tidak tersedia</h1>
          <p className="mt-2 text-sm text-ink/60">Portal pelanggan belum diaktifkan untuk syarikat ini.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-2">
              <Logo src={brand.logoUrl} alt={brand.nama} className="h-9 w-9" />
              <span className="font-display text-sm font-semibold tracking-widest text-ink">{brand.nama}</span>
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-sm text-ink/60 sm:block">{cust.nama}</span>
              <form action={signOutPortal}>
                <button className="text-sm text-ink/60 hover:text-brass">Log Keluar</button>
              </form>
            </div>
          </div>
          <div className="mt-3">
            <PortalNav />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
