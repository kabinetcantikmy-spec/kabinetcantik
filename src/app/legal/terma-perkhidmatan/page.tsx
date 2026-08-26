export const metadata = { title: "Terma Perkhidmatan" };

export default function TermaPerkhidmatan() {
  return (
    <article className="prose-legal">
      <h1 className="font-display text-3xl font-semibold text-ink">Terma Perkhidmatan</h1>
      <p className="mt-1 text-sm text-ink/50">Berkuat kuasa: [TARIKH] · Kemas kini terakhir: [TARIKH]</p>

      <Note />

      <Sec n="1" t="Pengenalan & Penerimaan">
        Terma Perkhidmatan (&ldquo;Terma&rdquo;) ini mengawal penggunaan platform perisian sebagai perkhidmatan (SaaS)
        <b> KabinetCantik OS</b> (&ldquo;Platform&rdquo;, &ldquo;Perkhidmatan&rdquo;, &ldquo;kami&rdquo;) yang dikendalikan oleh
        <b> [Nama Entiti Sah]</b> (No. Pendaftaran: <b>[No. SSM]</b>), beralamat di <b>[Alamat Perniagaan]</b>, Malaysia.
        Dengan mendaftar atau menggunakan Perkhidmatan, anda bersetuju terikat dengan Terma ini. Jika anda tidak bersetuju,
        sila jangan gunakan Perkhidmatan.
      </Sec>

      <Sec n="2" t="Definisi">
        &ldquo;<b>Pelanggan</b>&rdquo; / &ldquo;<b>Tenant</b>&rdquo; ialah syarikat atau individu yang melanggan Perkhidmatan.
        &ldquo;<b>Pengguna</b>&rdquo; ialah kakitangan tenant yang dibenarkan mengakses akaun. &ldquo;<b>Data Tenant</b>&rdquo;
        ialah semua data yang dimasukkan oleh tenant, termasuk maklumat pelanggan akhir mereka.
      </Sec>

      <Sec n="3" t="Akaun & Pendaftaran">
        Anda mesti memberikan maklumat yang tepat semasa pendaftaran dan bertanggungjawab menjaga kerahsiaan kata laluan
        serta semua aktiviti di bawah akaun anda. Anda mesti berumur sekurang-kurangnya 18 tahun dan berkuasa mewakili
        entiti perniagaan anda.
      </Sec>

      <Sec n="4" t="Langganan, Pakej & Pembayaran">
        Perkhidmatan ditawarkan dalam beberapa pakej: <b>Freemium</b> (RM0/bulan), <b>Hero</b> (RM249/bulan) dan
        <b> Pro</b> (RM499/bulan). Yuran langganan dikira setiap bulan dan dibayar terlebih dahulu melalui gerbang
        pembayaran pihak ketiga (CHIP). Harga tidak termasuk cukai yang berkenaan (cth SST) melainkan dinyatakan.
        Langganan diperbaharui secara automatik setiap kitaran sehingga dibatalkan. Kami boleh mengubah harga dengan
        notis 30 hari.
      </Sec>

      <Sec n="5" t="Percubaan Percuma (Trial)">
        Kami mungkin menawarkan tempoh percubaan percuma selama <b>14 hari</b>. Selepas tempoh tamat, akaun akan beralih
        ke pakej yang dipilih (atau pakej Freemium) melainkan dibatalkan. Tiada pembayaran dikenakan semasa percubaan.
      </Sec>

      <Sec n="6" t="Penggunaan Boleh Terima">
        Anda bersetuju untuk tidak: (a) menggunakan Perkhidmatan untuk aktiviti menyalahi undang-undang atau menipu;
        (b) memuat naik kandungan yang melanggar hak pihak lain atau mengandungi malware; (c) mengganggu, menggodam atau
        membebankan sistem; (d) menjual semula atau menyalin Perkhidmatan tanpa kebenaran bertulis.
      </Sec>

      <Sec n="7" t="Data Tenant & Data Pelanggan">
        Anda memiliki Data Tenant anda. Anda memberikan kami lesen terhad untuk memproses data tersebut semata-mata bagi
        menyediakan Perkhidmatan. Bagi data peribadi pelanggan akhir anda, <b>anda ialah pengawal data</b> dan kami
        bertindak sebagai <b>pemproses data</b> bagi pihak anda (lihat Dasar Privasi).
      </Sec>

      <Sec n="8" t="Harta Intelek">
        Platform, perisian, reka bentuk dan jenama KabinetCantik OS adalah hak milik kami. Anda tidak memperoleh apa-apa
        hak selain lesen penggunaan terhad yang boleh dibatalkan seperti dinyatakan dalam Terma ini.
      </Sec>

      <Sec n="9" t="Penggantungan & Penamatan">
        Anda boleh membatalkan langganan pada bila-bila masa (lihat Dasar Bayaran Balik & Pembatalan). Kami boleh
        menggantung atau menamatkan akses jika anda melanggar Terma, gagal membayar, atau atas sebab undang-undang.
        Selepas penamatan, Data Tenant boleh dieksport dalam tempoh munasabah sebelum dipadam.
      </Sec>

      <Sec n="10" t="Penafian Waranti & Had Liabiliti">
        Perkhidmatan disediakan &ldquo;sebagaimana adanya&rdquo; tanpa waranti tersurat atau tersirat. Setakat yang
        dibenarkan undang-undang, liabiliti kami secara agregat tidak melebihi jumlah yuran yang anda bayar dalam
        <b> 3 bulan </b> sebelum tuntutan. Kami tidak bertanggungjawab atas kerugian tidak langsung, kehilangan
        keuntungan atau kehilangan data.
      </Sec>

      <Sec n="11" t="Ganti Rugi">
        Anda bersetuju menanggung rugi kami daripada tuntutan pihak ketiga yang berbangkit daripada penggunaan
        Perkhidmatan oleh anda atau pelanggaran Terma oleh anda.
      </Sec>

      <Sec n="12" t="Perubahan Terma">
        Kami boleh mengemas kini Terma ini dari semasa ke semasa. Perubahan penting akan dimaklumkan melalui emel atau
        di dalam Platform. Penggunaan berterusan selepas perubahan bermakna anda menerima Terma yang dikemas kini.
      </Sec>

      <Sec n="13" t="Undang-undang Terpakai">
        Terma ini ditadbir oleh undang-undang Malaysia. Sebarang pertikaian tertakluk kepada bidang kuasa eksklusif
        mahkamah Malaysia.
      </Sec>

      <Sec n="14" t="Hubungi Kami">
        Sebarang pertanyaan mengenai Terma ini: <b>lovaffmy@gmail.com</b>.
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

function Note() {
  return (
    <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <b>Nota untuk pemilik:</b> Ganti semua medan <code>[ ]</code> dengan butiran syarikat sebenar sebelum guna.
      Dokumen ini templat asas — sila semak dengan penasihat undang-undang untuk pematuhan penuh.
    </div>
  );
}
