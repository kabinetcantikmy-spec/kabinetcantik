export const metadata = { title: "Dasar Privasi" };

export default function DasarPrivasi() {
  return (
    <article>
      <h1 className="font-display text-3xl font-semibold text-ink">Dasar Privasi</h1>
      <p className="mt-1 text-sm text-ink/50">Berkuat kuasa: [TARIKH] · Kemas kini terakhir: [TARIKH]</p>
      <Note />

      <Sec n="1" t="Pengenalan">
        Dasar ini menerangkan cara <b>[Nama Entiti Sah]</b> (&ldquo;kami&rdquo;), pengendali <b>KabinetCantik OS</b>,
        mengumpul, menggunakan dan melindungi data peribadi selaras dengan <b>Akta Perlindungan Data Peribadi 2010 (PDPA)</b> Malaysia.
      </Sec>

      <Sec n="2" t="Data Yang Kami Kumpul">
        (a) <b>Data akaun</b> — nama, emel, nama syarikat, kata laluan (disulitkan). (b) <b>Data langganan</b> — pakej,
        status pembayaran (butiran kad dikendalikan oleh gerbang pembayaran, bukan kami). (c) <b>Data penggunaan</b> —
        log akses & aktiviti untuk keselamatan. (d) <b>Data Tenant</b> — maklumat yang anda masukkan, termasuk data
        pelanggan akhir anda.
      </Sec>

      <Sec n="3" t="Cara Kami Guna">
        Untuk menyediakan & menyelenggara Perkhidmatan, memproses langganan, menghantar emel transaksi & sokongan,
        meningkatkan produk, dan mematuhi kewajipan undang-undang. Kami <b>tidak menjual</b> data peribadi anda.
      </Sec>

      <Sec n="4" t="Pemproses Pihak Ketiga">
        Kami menggunakan penyedia terpercaya untuk mengendalikan Perkhidmatan: <b>Supabase</b> (pangkalan data & auth),
        <b> Cloudflare</b> (hosting & rangkaian), <b>Resend</b> (penghantaran emel) dan <b>CHIP</b> (pemprosesan
        pembayaran). Setiap pemproses hanya menerima data yang perlu untuk fungsi mereka.
      </Sec>

      <Sec n="5" t="Data Pelanggan Tenant (Pemproses)">
        Bagi data peribadi pelanggan akhir yang dimasukkan oleh tenant, <b>tenant ialah pengawal data</b> dan kami
        bertindak sebagai <b>pemproses</b> — kami memproses data tersebut hanya mengikut arahan tenant untuk menyediakan
        Perkhidmatan.
      </Sec>

      <Sec n="6" t="Cookies">
        Kami menggunakan cookies penting untuk sesi log masuk & keselamatan. Kami tidak menggunakan cookies pengiklanan
        pihak ketiga.
      </Sec>

      <Sec n="7" t="Penyimpanan & Pengekalan">
        Data disimpan di pelayan penyedia kami. Kami mengekalkan data selagi akaun aktif dan untuk tempoh munasabah
        selepas penamatan bagi tujuan undang-undang, sebelum dipadam atau dianonimkan.
      </Sec>

      <Sec n="8" t="Keselamatan">
        Kami menggunakan penyulitan dalam transit (HTTPS), kawalan akses berasaskan peranan, dan pengasingan data
        antara tenant (Row-Level Security). Tiada sistem 100% selamat; anda juga bertanggungjawab menjaga kata laluan.
      </Sec>

      <Sec n="9" t="Hak Anda (PDPA)">
        Anda berhak mengakses, membetulkan, atau meminta pemadaman data peribadi anda, serta menarik balik kebenaran.
        Untuk melaksanakan hak ini, hubungi kami di bawah.
      </Sec>

      <Sec n="10" t="Hubungi">
        Pertanyaan privasi atau permintaan data: <b>lovaffmy@gmail.com</b>.
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
      <b>Nota untuk pemilik:</b> Ganti medan <code>[ ]</code> dengan butiran sebenar. Semak dengan penasihat undang-undang
      untuk pematuhan PDPA penuh.
    </div>
  );
}
