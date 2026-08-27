export const metadata = { title: "Dasar Bayaran Balik & Pembatalan" };

export default function BayaranBalik() {
  return (
    <article>
      <h1 className="font-display text-3xl font-semibold text-ink">Dasar Bayaran Balik & Pembatalan</h1>
      <p className="mt-1 text-sm text-ink/50">Berkuat kuasa: 27 Ogos 2026 · Kemas kini terakhir: 27 Ogos 2026</p>

      <Sec n="1" t="Akses Percuma">
        Pada peringkat pelancaran, akses ke Perkhidmatan disediakan secara percuma. Tiada caj dikenakan semasa tempoh percuma ini. Sebarang yuran langganan akan dimaklumkan kepada anda terlebih dahulu sebelum ia berkuat kuasa.
      </Sec>

      <Sec n="2" t="Langganan Bulanan — Tiada Bayaran Balik">
        Yuran langganan dibayar terlebih dahulu untuk setiap kitaran bulanan. Oleh kerana percubaan percuma disediakan,
        <b> yuran yang telah dibayar untuk tempoh kitaran semasa tidak akan dikembalikan</b>, termasuk untuk tempoh yang
        tidak digunakan sepenuhnya.
      </Sec>

      <Sec n="3" t="Pembatalan Bila-bila Masa">
        Anda boleh membatalkan langganan pada bila-bila masa. Selepas pembatalan, langganan anda kekal aktif sehingga
        <b> akhir kitaran bil semasa</b>, dan <b>tidak akan diperbaharui</b> untuk kitaran berikutnya. Anda tidak akan
        dicaj lagi selepas itu.
      </Sec>

      <Sec n="4" t="Cara Membatalkan">
        Batalkan melalui tetapan akaun anda dalam Platform, atau hubungi kami di <b>admin@renorumah.com</b>. Kami akan
        mengesahkan pembatalan melalui emel.
      </Sec>

      <Sec n="5" t="Penurunan Pakej (Downgrade)">
        Anda boleh menurunkan pakej langganan anda. Perubahan berkuat kuasa pada kitaran bil
        berikutnya; tiada bayaran balik prorata untuk baki kitaran semasa.
      </Sec>

      <Sec n="6" t="Perubahan Harga">
        Sebarang perubahan harga akan dimaklumkan sekurang-kurangnya <b>30 hari</b> lebih awal dan hanya terpakai pada
        kitaran bil selepas notis.
      </Sec>

      <Sec n="7" t="Kegagalan Pembayaran">
        Jika pembayaran gagal, kami mungkin cuba semula dan menggantung akses sehingga bayaran diterima. Akaun yang tidak
        dibayar untuk tempoh lanjut boleh diturunkan ke Freemium atau digantung.
      </Sec>

      <Sec n="8" t="Hubungi">
        Pertanyaan bil & pembatalan: <b>admin@renorumah.com</b>.
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
