import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const area = process.env.NEXT_PUBLIC_SERVICE_AREA || "Klang Valley";
  const address = process.env.NEXT_PUBLIC_SHOWROOM_ADDRESS || "";
  const year = 2026;
  return (
    <footer className="mt-24 bg-ink text-off-white">
      <div className="container-c grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-12" />
            <span className="font-display text-lg font-semibold tracking-[0.15em] text-tan">
              KABINET CANTIK
            </span>
          </div>
          <p className="mt-4 max-w-sm font-serif text-lg italic text-brass-lite">
            Built to Fit. Styled to Last.
          </p>
          <p className="mt-3 max-w-sm text-sm text-white/60">
            Reka bentuk & fabrikasi kabinet dapur, wardrobe, TV cabinet dan wall panelling kustom.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-tan">Laman</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/portfolio" className="hover:text-brass">Portfolio</Link></li>
            <li><Link href="/sebut-harga" className="hover:text-brass">Sebut Harga</Link></li>
            <li><Link href="/tempah-ukur" className="hover:text-brass">Tempah Ukur Tapak</Link></li>
            <li><Link href="/bahan" className="hover:text-brass">Bahan</Link></li>
            <li><Link href="/tentang" className="hover:text-brass">Tentang</Link></li>
            <li><Link href="/ulasan" className="hover:text-brass">Ulasan</Link></li>
            <li><Link href="/blog" className="hover:text-brass">Blog</Link></li>
            <li><Link href="/hubungi" className="hover:text-brass">Hubungi</Link></li>
            <li><Link href="/portal" className="hover:text-brass">Portal Pelanggan</Link></li>
            <li><Link href="/pembekal/daftar" className="hover:text-brass">Daftar Pembekal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-tan">Hubungi</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>Kawasan servis: <span className="text-white">{area}</span></li>
            {address && <li>{address}</li>}
            <li><Link href="/sebut-harga" className="text-brass hover:underline">Dapatkan anggaran →</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-line">
        <div className="container-c flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:justify-between">
          <span>© {year} KabinetCantik. Hak cipta terpelihara.</span>
          <span className="space-x-4">
            <Link href="/privasi" className="hover:text-brass">Privasi</Link>
            <Link href="/terma" className="hover:text-brass">Terma</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
