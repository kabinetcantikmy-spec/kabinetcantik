import Link from "next/link";
import { requireSupplier } from "@/lib/supabaseServer";
import { signOutSupplier } from "../auth-actions";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const sup = await requireSupplier();
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link href="/pembekal" className="flex items-center gap-2">
            <Logo className="h-9 w-9" />
            <span className="font-display text-sm font-semibold tracking-widest text-ink">PORTAL PEMBEKAL</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-ink/60 sm:block">{sup.nama}</span>
            <form action={signOutSupplier}>
              <button className="text-sm text-ink/60 hover:text-brass">Log Keluar</button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-6">{children}</div>
    </div>
  );
}
