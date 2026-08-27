export const metadata = { title: "Terma Marketplace & Notis PDPA" };

export default function TermaMarketplace() {
  return (
    <article>
      <h1 className="font-display text-3xl font-semibold text-ink">Terma Perkhidmatan Marketplace &amp; Notis PDPA</h1>
      <p className="mt-1 text-sm text-ink/50">Untuk pemilik rumah yang menghantar permintaan · Berkuat kuasa: 27 Ogos 2026</p>

      <Sec n="1" t="Tentang Perkhidmatan">
        KabinetCantik ialah platform yang menghubungkan pemilik rumah dengan kontraktor kabinet berdaftar. Kami
        <b> bukan kontraktor</b> dan tidak melaksanakan kerja kabinet. Peranan kami hanya memadankan permintaan anda
        dengan satu kontraktor yang sesuai di kawasan anda. Platform ini dikendalikan oleh <b>RENORUMAH SDN. BHD.</b>
        (No. Pendaftaran 202301005235 (1499154-X)).
      </Sec>

      <Sec n="2" t="Percuma Untuk Anda">
        Penggunaan borang permintaan ini adalah <b>percuma</b> kepada pemilik rumah. Tiada sebarang bayaran dikenakan
        kepada anda untuk dihubungkan dengan kontraktor.
      </Sec>

      <Sec n="3" t="Kebenaran Perkongsian Data (PDPA)">
        Dengan menghantar borang, anda memberi <b>kebenaran</b> di bawah Akta Perlindungan Data Peribadi 2010 (PDPA)
        untuk kami mengumpul dan berkongsi maklumat yang anda berikan &mdash; nama, nombor telefon, emel, poskod/kawasan
        dan butiran projek &mdash; dengan <b>satu (1) kontraktor kabinet berdaftar</b> supaya mereka boleh menghubungi
        anda untuk memberikan sebut harga. Nombor telefon anda hanya didedahkan kepada kontraktor selepas mereka menerima
        permintaan anda.
      </Sec>

      <Sec n="4" t="Cara Data Digunakan">
        Maklumat anda digunakan semata-mata untuk tujuan pemadanan dan menghubungkan anda dengan kontraktor. Kami
        <b> tidak menjual</b> data peribadi anda kepada pihak ketiga untuk pengiklanan.
      </Sec>

      <Sec n="5" t="Tiada Jaminan">
        Kami berusaha memadankan anda dengan kontraktor berdaftar, tetapi kami <b>tidak menjamin</b> kualiti kerja, harga,
        ketersediaan atau hasil. Sebarang perjanjian, sebut harga dan kontrak adalah <b>secara langsung antara anda dan
        kontraktor</b>. KabinetCantik tidak bertanggungjawab atas urusan, pertikaian atau kerja yang berlaku antara anda
        dan kontraktor.
      </Sec>

      <Sec n="6" t="Hak Anda (PDPA)">
        Anda berhak mengakses, membetulkan, atau meminta pemadaman data peribadi anda, dan menarik balik kebenaran pada
        bila-bila masa. Untuk berbuat demikian, hubungi kami di bawah.
      </Sec>

      <Sec n="7" t="Hubungi">
        Pertanyaan atau permintaan data: <b>admin@renorumah.com</b> · <b>+60 12-771 7543</b>.
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
