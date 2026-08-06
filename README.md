# KabinetCantik.com — Phase 1 (MVP)

Enjin **lead-generation + portfolio** untuk KabinetCantik. Phase 1 fokus: tangkap lead secepat mungkin dengan laman depan yang cantik.

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind · Supabase**. Deploy: Cloudflare (OpenNext) — lihat spec.

## Apa yang ada dalam Phase 1

- **Home** (`/`) — hero, kategori, portfolio pilihan, cara kerja, bahan, social proof, CTA, footer
- **Portfolio** (`/portfolio`) — galeri boleh tapis ikut kategori
- **Quote Wizard** (`/sebut-harga`) — 4 langkah, keluarkan **instant ballpark** + hantar lead
- **Contact** (`/hubungi`) — borang + WhatsApp deep link
- **API lead** (`/api/lead`) — simpan lead ke Supabase (service-role) + pulang wa.me link
- Butang WhatsApp terapung di semua halaman
- Skema Supabase: `supabase/schema.sql`

## Setup

```bash
cp .env.example .env.local   # isi kredensial Supabase + no. WhatsApp
npm install
npm run dev                  # http://localhost:3000
```

Untuk Supabase: buat projek baru → jalankan `supabase/schema.sql` dalam SQL editor → salin URL + anon key + service-role key ke `.env.local`.

## Nota reka bentuk

- **Palet** dari logo rasmi (lihat `tailwind.config.ts`): ink `#0B1320`, brass `#AE873B`, tan `#CFAD8A`.
- **Font**: Cinzel (display) + Cormorant (serif) + Inter (body) via `next/font`.
- **Instant estimate**: buat masa ni baca dari `src/lib/pricing.ts` (config placeholder). Bila katalog Supabase (`materials`/`settings`) sedia, tukar `getPricingConfig()` untuk baca dari DB. Config boleh dijana dari **Panel Harga Admin**.
- **Gambar**: guna placeholder Unsplash sekarang. Ganti dengan Cloudflare Images/R2 + `next/image` bila set gambar sebenar sedia.

## TODO sebelum go-live

- [ ] Isi nombor WhatsApp sebenar (`NEXT_PUBLIC_WHATSAPP_SALES`)
- [ ] Alamat showroom (footer/peta)
- [ ] Muat naik gambar projek sebenar
- [ ] Sambung image CDN
- [ ] Notifikasi WhatsApp automatik ke sales (Phase 3 — API)
- [ ] Turnstile/honeypot pada borang (anti-spam)

### Phase 1 — kelengkapan (ditambah)
- **Portfolio dari DB + case study**: `/portfolio` baca dari Supabase `portfolio` (fallback ke data statik jika kosong); setiap projek buka `/portfolio/[slug]` (galeri, bahan, skop, CTA "Saya nak macam ni").
- **Portfolio CMS** (`/admin/portfolio`): cipta/edit projek, galeri gambar, featured & terbit.
- **Halaman kandungan**: `/perkhidmatan` + `/perkhidmatan/[kategori]`, `/bahan` (swatch), `/tentang`.
- **Image optimization**: semua imej utama guna `next/image` (auto WebP/AVIF, responsive `sizes`) + **LQIP blur** (`lib/img.ts`). Untuk Cloudflare Images, set custom loader dalam `next.config`.
- **Home**: slider **sebelum/selepas** + pautan swatch bahan.
- **Quote Wizard**: **save progress** (localStorage) + **upload gambar ruang** (Supabase Storage bucket `lead-photos`) → tersimpan ke `lead_files` & dipapar di admin lead.

> Nota: cipta bucket **`lead-photos`** (public) dalam Supabase Storage untuk upload wizard. **i18n toggle English** belum — ia perubahan seni bina besar (perlu next-intl + terjemah semua copy); dicadang sebagai kerja berasingan.

## Phase 2 — Sales engine (SIAP)

Panel admin di `/admin` (dilindungi Supabase Auth + middleware):

- **Dashboard** (`/admin`) — KPI: jumlah lead, lead baru bulan ini, nilai pipeline, kadar tukar; carta lead ikut peringkat.
- **Leads / Pipeline** (`/admin/leads`) — papan **Kanban** (seret kad tukar peringkat), setiap lead ada halaman detail + **log aktiviti**, follow-up date, tanda Batal/Lost, balas WhatsApp satu-klik.
- **Sebut Harga** (`/admin/sebutharga`) — quotation builder: item dari katalog bahan, auto-kira subtotal/diskaun/SST/deposit, versi status (draf→hantar→terima), dan **halaman cetak → PDF** (`/…/cetak`).
- **Kalendar** (`/admin/kalendar`) — jadual ukur tapak & pemasangan, kaitkan dengan lead, tukar status.
- **Bahan & Harga** (`/admin/bahan`) — katalog materials (CRUD), boleh "isi dari kadar placeholder".

### Buat akaun admin pertama
1. Supabase Dashboard → Authentication → Users → **Add user** (emel + kata laluan).
2. SQL editor:
   ```sql
   insert into public.profiles (id, nama, emel, role)
   values ('<auth-user-uuid>', 'Nama Anda', 'anda@email.com', 'admin');
   ```
3. Log masuk di `/admin/login`.

**Nota:** server actions admin guna `SUPABASE_SERVICE_ROLE_KEY` (server sahaja) selepas sahkan sesi staf — pastikan key ni diisi dalam `.env.local`. "PDF" quote kini = halaman cetak (browser Print→PDF); boleh naik taraf ke PDF server-side kemudian.

### Phase 2 — kelengkapan (ditambah)
- **Katalog → estimate awam**: Quote Wizard kini baca kadar dari `settings.pricing` (`lib/pricingServer.ts`), bukan lagi fail statik. Tukar di `/admin/tetapan` terus ubah anggaran awam.
- **Tetapan** (`/admin/tetapan`, admin sahaja): edit kadar/tier, deposit split, SST, lebar julat + **urus pengguna & peranan**. Role gating via `requireRole()`.
- **Leads**: cipta lead manual, **assign ke staf**, **duplicate guard** (telefon sama 30 hari → flag), **carian** nama/telefon dalam Kanban.
- **Quotation**: **Hantar ke Pelanggan** (email + WhatsApp link), pelanggan lihat & **terima online** di `/q/[token]` (auto tanda `viewed_at`/`accepted_at`, gerak lead), **Buat Semakan** (versi baru salin item).
- **Tempah ukur tapak awam** (`/tempah-ukur`): borang awam → cipta lead + temujanji + emel pengesahan.
- **Pelanggan** (`/admin/pelanggan`): senarai + kiraan projek.
- **Reporting**: dashboard tambah carta lead 6-bulan & lead ikut kategori; **Export CSV** (leads & quotations) di dashboard/leads/sebutharga.

## Phase 3 — Customer experience & cash flow (SIAP)

**Portal pelanggan** `/portal` (Supabase Auth, guarded):
- **Projek** — timeline status (Deposit→Fabrikasi→Pemasangan→Siap→Warranti).
- **Design** — semak render, **luluskan / minta ubah** (dengan komen).
- **Bayaran** — milestone via **CHIP** (FPX/kad), resit boleh cetak.
- **Dokumen** — invois & resit.
- **Warranti** — hantar tuntutan + jejak status.

**Admin tambahan:**
- **Projek** (`/admin/projek`) — cipta projek dari sebut harga *diterima* (auto customer + deposit milestone), urus status, milestone bayaran, render design, triage warranti.
- **Ulasan** (`/admin/ulasan`) — moderasi & terbit testimoni ke laman awam + home.
- **Blog** (`/admin/blog`) — tulis artikel SEO, terbit ke `/blog`.

**Awam baharu:** `/blog` + `/blog/[slug]` (metadata + OG), `/ulasan`. Testimoni home auto-tarik dari DB (fallback ke statik).

**Pembayaran CHIP:** `POST /api/payments/create` cipta bill → redirect checkout; `POST /api/payments/webhook` sahkan signature → tanda `paid`. Set `CHIP_BRAND_ID`, `CHIP_SECRET_KEY`, `CHIP_WEBHOOK_PUBLIC_KEY`, `NEXT_PUBLIC_APP_URL`. Daftar URL webhook di dashboard CHIP.

### Buat akaun pelanggan (akses portal)
1. Supabase → Authentication → Add user (emel pelanggan + kata laluan).
2. SQL: pastikan ada baris `customers`, kemudian:
   ```sql
   insert into public.profiles (id, nama, emel, role, customer_id)
   values ('<auth-user-uuid>', 'Nama Pelanggan', 'pelanggan@email.com', 'customer', '<customer-uuid>');
   ```
3. Pelanggan log masuk di `/portal/login`.

> Nota: cipta projek dari sebut harga auto-buat rekod `customers`; pautkan `profiles.customer_id` ke situ untuk beri akses portal. Auto-jemput akaun pelanggan (invite email) boleh ditambah kemudian guna Supabase Admin API.

### Phase 3 — kelengkapan (ditambah)
- **Review request + borang awam**: admin “Minta Ulasan Pelanggan” → jana token, hantar WhatsApp + email; pelanggan isi di `/ulasan/baru/[token]` (tanpa login) → masuk moderasi.
- **Email transaksi (Resend)** `src/lib/email.ts`: review request, resit bayaran, pengesahan temujanji, notifikasi design ke sales. No-op selamat jika `RESEND_API_KEY` tiada.
- **Auto-jemput pelanggan**: cipta projek → `auth.admin.inviteUserByEmail` + auto-pautkan `profiles.customer_id`.
- **Automasi bayaran**: webhook CHIP → tanda paid → **auto-jana invois** + **advance status projek** + **email resit**.
- **Notifikasi design**: pelanggan approve/minta-ubah → log ke activity lead + email sales (`SALES_NOTIFY_EMAIL`).
- **OTP login**: portal login ada pilihan “Hantar pautan log masuk” (magic link).
- **Signed URL dokumen**: `src/lib/storage.ts` + `/api/dokumen/[id]` (sign fail sulit dari Supabase Storage bucket `SUPABASE_DOCS_BUCKET`).
- **SEO**: `sitemap.xml`, `robots.txt`, JSON-LD (HomeAndConstructionBusiness site-wide, Article di blog, AggregateRating di /ulasan).

Env baharu: `RESEND_FROM`, `SALES_NOTIFY_EMAIL`, `SUPABASE_DOCS_BUCKET`. Nota: server-side PDF (quote/resit) masih guna Print→PDF browser — planned swap.

## Phase 4 — Operations & scale (SEBAHAGIAN SIAP)

**Pembekal / Installer + Claims → Voucher (SIAP):**
- Pendaftaran awam `/pembekal/daftar` → cipta akaun auth + rekod pembekal (pending) + emel.
- Portal pembekal `/pembekal` (login/OTP): status kelulusan, hantar tuntutan, jejak tuntutan & baucer.
- Admin `/admin/pembekal` (**Admin & Finance sahaja** via `requireRole`): lulus/tolak pembekal, **lulus tuntutan → auto-jana baucer**, tanda baucer dibayar (+ emel pembekal).
- Skema: `suppliers`, `supplier_claims`, `vouchers` (+ `profiles.supplier_id`, role `supplier`, `is_finance()`).

Aliran: pembekal daftar → admin lulus → pembekal hantar tuntutan → finance lulus (auto baucer) → tanda dibayar → pembekal nampak status + emel resit.

**WhatsApp Business API — Meta Cloud API (SIAP):**
- `lib/whatsapp.ts`: `sendTemplate` / `sendText` + event helpers (lead, stage, payment, appointment, review). Selamat no-op jika kredensial tiada ATAU automasi off.
- **Auto-hantar** dari trigger sedia ada: lead baru, tukar peringkat, bayaran (webhook), temujanji, request review.
- **Webhook masuk** `/api/whatsapp/webhook` (GET verify + POST) → log balasan/status ke `wa_log` & `lead_activity` (padan lead ikut telefon).
- **Toggle** dalam `/admin/tetapan` (admin) — hidup/matikan automasi.
- Skema: `wa_log` + setting `wa_automation_enabled`.

**Setup owner (di luar code):** akaun WhatsApp Business + verify di Meta; isi `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`; cipta & luluskan template Meta dengan nama `lead_welcome`, `stage_update`, `payment_received`, `appointment_reminder`, `project_review` (bahasa `ms`); daftar URL webhook `/api/whatsapp/webhook`; hidupkan toggle di Tetapan. Ingat: mesej bisnes-initiated WAJIB guna template diluluskan (peraturan Meta 24-jam).

**Belum (Phase 4 baki):** analytics dashboard lanjutan, inventori stok, 3D configurator.
