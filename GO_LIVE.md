# KabinetCantik — Panduan Go-Live (Supabase + GitHub + Cloudflare)

Stack deploy: **Next.js 15 → Cloudflare Workers (OpenNext)**, DB **Supabase**, kod di **GitHub**, domain & DNS di **Cloudflare**.
Ganti `kabinetcantik.com` dengan domain sebenar anda di mana perlu.

Urutan dicadang: **1) Supabase → 2) GitHub → 3) Cloudflare deploy → 4) Domain/DNS → 5) Integrasi → 6) Konfig akhir → 7) Smoke test.**

---

## 0. Prasyarat
Akaun: Supabase, GitHub, Cloudflare. Domain sedia ada (boleh transfer DNS ke Cloudflare). Node 20+ dipasang di komputer anda.

---

## 1. Supabase
1. **Buat projek** di supabase.com → simpan **Project URL**, **anon key**, **service_role key** (Settings → API).
2. **Jalankan skema**: SQL Editor → tampal seluruh `supabase/schema.sql` → Run.
3. **Seed data**: SQL Editor → tampal `supabase/seed.sql` → Run (isi harga + portfolio/blog contoh).
4. **Storage buckets** (Storage → New bucket):
   - `lead-photos` — **Public** (gambar ruang dari Quote Wizard).
   - `dokumen` — **Private** (invois/dokumen sulit; diakses via signed URL).
5. **Auth settings** (Authentication → Providers → Email): pastikan Email dihidupkan. Untuk portal pelanggan/pembekal guna OTP/magic-link, benarkan. (Pilihan: matikan "Confirm email" semasa ujian.)
6. **Akaun admin pertama**:
   - Authentication → Users → **Add user** (emel + kata laluan owner).
   - Salin UUID user, SQL Editor:
     ```sql
     insert into public.profiles (id, nama, emel, role)
     values ('<AUTH-USER-UUID>', 'Nama Owner', 'owner@email.com', 'admin')
     on conflict (id) do update set role = 'admin';
     ```

---

## 2. GitHub
1. Buat repo baru (private) `kabinetcantik`.
2. Dari folder projek:
   ```bash
   git init && git add . && git commit -m "KabinetCantik initial"
   git branch -M main
   git remote add origin https://github.com/<akaun>/kabinetcantik.git
   git push -u origin main
   ```
   (`.gitignore` sudah abaikan `node_modules`, `.next`, `.open-next`, `.env*`.)

---

## 3. Deploy ke Cloudflare Workers (OpenNext)
Dua cara — pilih satu.

### Cara A — Cloudflare CLI (paling terus)
```bash
npm install
npx wrangler login            # buka browser, benarkan
npm run deploy                # opennextjs-cloudflare build && deploy
```
Ini bina `.open-next/worker.js` dan deploy Worker `kabinetcantik`.

### Cara B — Auto-deploy dari GitHub (Workers Builds)
Cloudflare Dashboard → **Workers & Pages → Create → Workers → Connect to Git** → pilih repo.
- Build command: `npm run cf:build`
- Deploy command: `npx wrangler deploy`
- Setiap `git push` ke `main` akan auto-deploy.

### Environment variables / secrets
Set di **Workers & Pages → (worker) → Settings → Variables & Secrets** (atau `npx wrangler secret put <NAME>`):

**Secrets (jangan dedah):** `SUPABASE_SERVICE_ROLE_KEY`, `CHIP_SECRET_KEY`, `CHIP_WEBHOOK_PUBLIC_KEY`, `RESEND_API_KEY`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`.

**Plain vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` (=`https://kabinetcantik.com`), `NEXT_PUBLIC_WHATSAPP_SALES`, `NEXT_PUBLIC_SERVICE_AREA`, `NEXT_PUBLIC_SHOWROOM_ADDRESS`, `RESEND_FROM`, `SALES_NOTIFY_EMAIL`, `SUPABASE_DOCS_BUCKET=dokumen`, `CHIP_BRAND_ID`, `CHIP_API_BASE`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_API_VERSION=v21.0`, `WA_TPL_*`, `WA_TPL_LANG=ms`.

> Rujukan penuh: `.env.example`. Untuk ujian lokal Workers: salin ke `.dev.vars` dan `npm run preview`.

---

## 4. Domain & DNS ke Cloudflare
1. Cloudflare Dashboard → **Add a site** → masukkan domain anda → pilih plan Free.
2. Cloudflare beri **2 nameserver**. Log masuk ke **registrar** domain anda → tukar nameserver ke yang Cloudflare beri. (Tunggu propagasi — biasanya bawah sejam, boleh sampai 24 jam.)
3. Bila domain "Active" di Cloudflare → pergi ke Worker anda → **Settings → Domains & Routes → Add → Custom Domain** → `kabinetcantik.com` (dan `www`). Cloudflare auto-cipta rekod DNS + SSL.
4. Pastikan `NEXT_PUBLIC_APP_URL` = `https://kabinetcantik.com` (redeploy jika baru tukar).

---

## 5. Integrasi
### CHIP (bayaran)
- Daftar CHIP Collect → dapat **Brand ID** + **Secret Key** → set env.
- **Webhook**: dashboard CHIP → tambah callback `https://kabinetcantik.com/api/payments/webhook`. Salin **public key** → `CHIP_WEBHOOK_PUBLIC_KEY`.

### Resend (emel)
- Verify domain hantar (DNS record di Cloudflare) → dapat API key → set `RESEND_API_KEY`, `RESEND_FROM` (cth `KabinetCantik <noreply@kabinetcantik.com>`), `SALES_NOTIFY_EMAIL`.

### WhatsApp (Meta Cloud API)
- Meta Business → WhatsApp → dapat **Phone Number ID** + **Access Token** (permanent). Set env + `WHATSAPP_VERIFY_TOKEN` (token rawak pilihan anda).
- **Webhook**: Meta → Configuration → Callback URL `https://kabinetcantik.com/api/whatsapp/webhook`, Verify Token = sama dengan env → Subscribe ke `messages`.
- **Templates**: cipta & tunggu kelulusan Meta dengan nama: `lead_welcome`, `stage_update`, `payment_received`, `appointment_reminder`, `project_review` (bahasa `ms`), setiap satu dengan pembolehubah body yang sepadan.
- Hidupkan **toggle** di `/admin/tetapan`.

### Imej (pilihan tapi disyorkan)
Gallery kini guna placeholder Unsplash + `next/image`. Untuk prestasi/kos, pindah ke **Cloudflare Images / R2** dan set custom loader dalam `next.config.mjs`.

---

## 6. Konfigurasi akhir (dalam app, selepas live)
- Log masuk `/admin/login` (akaun owner).
- **/admin/tetapan** → betulkan **kadar sebenar** (memandu estimate awam), deposit %, SST, dan toggle WhatsApp. Tukar peranan staf.
- **/admin/portfolio** → ganti projek contoh dengan gambar & projek sebenar.
- **/admin/blog** → tulis artikel SEO sebenar.
- Isi nombor WhatsApp sales & alamat showroom (env `NEXT_PUBLIC_*`).

---

## 7. Pra-launch checklist (smoke test)
- [ ] Laman awam buka di `https://kabinetcantik.com` (home, portfolio, case study, perkhidmatan, bahan, tentang, blog, ulasan).
- [ ] Quote Wizard → hantar → lead masuk `/admin/leads` (Kanban).
- [ ] Lead detail → bina sebut harga → **Hantar** → buka `/q/<token>` → **Terima** (status bertukar).
- [ ] Bina projek dari quote diterima → pelanggan dijemput (emel) → login `/portal` → nampak timeline.
- [ ] Bayaran CHIP (sandbox) → webhook tanda paid → resit + invois auto.
- [ ] Tempah ukur tapak awam `/tempah-ukur` → temujanji masuk kalendar.
- [ ] Pembekal daftar `/pembekal/daftar` → admin lulus → pembekal hantar tuntutan → finance lulus → baucer auto → tanda dibayar.
- [ ] (Jika WA on) template diterima di telefon ujian.
- [ ] `sitemap.xml` & `robots.txt` load; Lighthouse mobile ≥ 90.

---

## Nota teknikal
- **Next 15**: `cookies()` guna shim rasmi (`UnsafeUnwrappedCookies`) — berfungsi, cuma log deprecation warning. Boleh refactor ke async penuh kemudian (tak menghalang launch).
- **PDF**: sebut harga/resit kini Print→PDF browser. Boleh naik taraf ke PDF server-side kemudian.
- **i18n English toggle**: belum — kerja berasingan (next-intl).
- Selepas tukar env di Cloudflare, **redeploy** supaya berkuat kuasa.
