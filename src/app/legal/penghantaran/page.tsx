export const metadata = { title: "Dasar Penghantaran & Penyampaian" };

export default function DasarPenghantaran() {
  return (
    <article>
      <h1 className="font-display text-3xl font-semibold text-ink">Dasar Penghantaran & Penyampaian Perkhidmatan</h1>
      <p className="mt-1 text-sm text-ink/50">Berkuat kuasa: 27 Ogos 2026 · Kemas kini terakhir: 27 Ogos 2026</p>

      <Sec n="1" t="Produk Digital (SaaS)">
        <b>KabinetCantik OS</b> ialah perkhidmatan perisian sebagai perkhidmatan (SaaS) berasaskan langganan yang
        dikendalikan oleh <b>RENORUMAH SDN. BHD.</b>. Perkhidmatan disampaikan sepenuhnya secara dalam talian —
        <b> tiada barangan fizikal dihantar atau diposkan</b>.
      </Sec>

      <Sec n="2" t="Penyampaian & Pengaktifan Akses">
        Sebaik sahaja pendaftaran atau pembayaran langganan disahkan berjaya, akses ke Platform diaktifkan
        <b> serta-merta</b> (biasanya dalam beberapa minit). Anda mengakses akaun melalui pelayar web di
        <b> kabinetcantik.com</b> menggunakan emel dan kata laluan anda.
      </Sec>

      <Sec n="3" t="Masa Penyampaian">
        Penyampaian adalah automatik dan segera. Sekiranya akses tertangguh atas sebab teknikal, sila hubungi sokongan
        dan kami akan menyelesaikannya secepat mungkin.
      </Sec>

      <Sec n="4" t="Tiada Penghantaran Fizikal / Kos Pos">
        Oleh kerana Perkhidmatan bersifat digital, tiada penghantaran fizikal, kos pos, atau anggaran masa penghantaran
        yang terpakai. Sebarang rujukan kepada "penghantaran" merujuk kepada penyampaian akses digital sahaja.
      </Sec>

      <Sec n="5" t="Masalah Akses Selepas Pembayaran">
        Jika anda telah membayar tetapi tidak menerima akses, sila hubungi kami dengan bukti pembayaran. Kami akan
        memulihkan akses anda, atau memproses bayaran balik mengikut <b>Dasar Bayaran Balik & Pembatalan</b> kami.
      </Sec>

      <Sec n="6" t="Hubungi">
        Sokongan & pertanyaan akses: <b>admin@renorumah.com</b> · <b>+60 12-771 7543</b>.
      </Sec>
    </article>
  );
}

function Sec({ n, t, children }: { n: string; t: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="font-display text-lg font-semibold text-ink">{n}. {t}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink/75">{children}</p>
    </section>
  );
}
