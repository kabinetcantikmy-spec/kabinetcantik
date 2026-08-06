-- KabinetCantik — Skema Supabase (Phase 1 subset)
-- Jalankan dalam Supabase SQL editor. RLS didayakan; guna service-role untuk server actions.

create extension if not exists "pgcrypto";

-- ---------- LEADS ----------
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  nama          text not null,
  telefon       text not null,
  emel          text,
  source        text default 'quote_wizard',
  kategori      text[] default '{}',
  jawapan_wizard jsonb default '{}'::jsonb,
  budget_min    numeric,
  budget_max    numeric,
  timeline      text,
  stage         text default 'Baru',
  next_followup date,
  lost_reason   text,
  created_at    timestamptz not null default now()
);
create index if not exists leads_stage_idx on public.leads(stage);
create index if not exists leads_created_idx on public.leads(created_at desc);

create table if not exists public.lead_files (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references public.leads(id) on delete cascade,
  url        text not null,
  jenis      text,
  created_at timestamptz not null default now()
);

-- ---------- PORTFOLIO ----------
create table if not exists public.portfolio (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  tajuk        text not null,
  kategori     text not null,
  gaya         text[] default '{}',
  cover_url    text,
  keterangan   text,
  bahan        text[] default '{}',
  kawasan      text,
  featured     boolean default false,
  diterbitkan  boolean default true,
  created_at   timestamptz not null default now()
);
create index if not exists portfolio_kategori_idx on public.portfolio(kategori);

create table if not exists public.portfolio_images (
  id           uuid primary key default gen_random_uuid(),
  portfolio_id uuid references public.portfolio(id) on delete cascade,
  url          text not null,
  urutan       int default 0
);

-- ---------- MATERIALS & SETTINGS (feed instant estimate) ----------
create table if not exists public.materials (
  id         uuid primary key default gen_random_uuid(),
  kategori   text not null,
  nama       text not null,
  tier       text not null check (tier in ('economy','standard','premium')),
  unit       text not null,
  harga_unit numeric not null,
  aktif      boolean default true
);

create table if not exists public.settings (
  key   text primary key,
  value jsonb not null
);
-- Contoh: public_range_pct, deposit_split, sst_enabled, sst_rate, brand
insert into public.settings(key, value) values
  ('public_range_pct', '20'::jsonb),
  ('deposit_split', '[50,40,10]'::jsonb),
  ('sst_enabled', 'false'::jsonb),
  ('sst_rate', '6'::jsonb)
on conflict (key) do nothing;

-- ---------- RLS ----------
alter table public.leads enable row level security;
alter table public.lead_files enable row level security;
alter table public.portfolio enable row level security;
alter table public.portfolio_images enable row level security;
alter table public.materials enable row level security;
alter table public.settings enable row level security;

-- Portfolio & settings: boleh baca umum (untuk laman awam)
create policy "portfolio_public_read" on public.portfolio
  for select using (diterbitkan = true);
create policy "portfolio_images_public_read" on public.portfolio_images
  for select using (true);
create policy "materials_public_read" on public.materials
  for select using (aktif = true);
create policy "settings_public_read" on public.settings
  for select using (true);

-- Leads: TIADA akses anon. Insert & baca hanya melalui service-role (server action / API route).
-- (Sengaja tiada policy anon di sini — server guna SUPABASE_SERVICE_ROLE_KEY yang pintas RLS.)

-- =====================================================================
--  PHASE 2 — Sales engine (CRM, quotation, materials, appointments)
-- =====================================================================

-- ---------- PROFILES (peranan staf) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nama        text,
  emel        text,
  role        text not null default 'sales'
              check (role in ('admin','sales','finance','designer','installer','customer','supplier')),
  customer_id uuid,   -- diisi untuk role 'customer'
  supplier_id uuid,   -- diisi untuk role 'supplier'
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_self_read" on public.profiles for select using (auth.uid() = id);

-- Helper: adakah pengguna semasa staf (bukan customer)?
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin','sales','finance','designer','installer')
  );
$$;

-- ---------- CUSTOMERS ----------
create table if not exists public.customers (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null,
  telefon    text,
  emel       text,
  alamat     text,
  notes      text,
  created_at timestamptz not null default now()
);
alter table public.customers enable row level security;
create policy "customers_staff_all" on public.customers for all using (public.is_staff()) with check (public.is_staff());

-- ---------- LEAD ACTIVITY (log) ----------
create table if not exists public.lead_activity (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references public.leads(id) on delete cascade,
  oleh       text,
  jenis      text not null default 'note' check (jenis in ('note','call','status','file','quote')),
  mesej      text,
  created_at timestamptz not null default now()
);
create index if not exists lead_activity_lead_idx on public.lead_activity(lead_id, created_at desc);
alter table public.lead_activity enable row level security;
create policy "lead_activity_staff_all" on public.lead_activity for all using (public.is_staff()) with check (public.is_staff());

-- Leads: benarkan staf baca/urus (selain service-role dari borang awam)
create policy "leads_staff_all" on public.leads for all using (public.is_staff()) with check (public.is_staff());

-- ---------- QUOTATIONS ----------
create table if not exists public.quotations (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references public.leads(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  no_quote    text unique not null,
  versi       int not null default 1,
  status      text not null default 'draft' check (status in ('draft','sent','accepted','rejected')),
  subtotal    numeric not null default 0,
  diskaun     numeric not null default 0,
  cukai       numeric not null default 0,   -- SST
  jumlah      numeric not null default 0,
  deposit_pct numeric not null default 50,
  nota        text,
  share_token text,
  viewed_at   timestamptz,
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists quotations_lead_idx on public.quotations(lead_id);
alter table public.quotations enable row level security;
create policy "quotations_staff_all" on public.quotations for all using (public.is_staff()) with check (public.is_staff());

create table if not exists public.quotation_items (
  id            uuid primary key default gen_random_uuid(),
  quotation_id  uuid references public.quotations(id) on delete cascade,
  kategori      text,
  keterangan    text not null,
  material_tier text,
  kuantiti      numeric not null default 1,
  unit          text,
  harga_unit    numeric not null default 0,
  jumlah        numeric not null default 0,
  urutan        int default 0
);
create index if not exists quotation_items_q_idx on public.quotation_items(quotation_id);
alter table public.quotation_items enable row level security;
create policy "quotation_items_staff_all" on public.quotation_items for all using (public.is_staff()) with check (public.is_staff());

-- ---------- APPOINTMENTS ----------
create table if not exists public.appointments (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references public.leads(id) on delete set null,
  jenis      text not null default 'site_visit' check (jenis in ('site_visit','install')),
  tarikh     date not null,
  masa       text,
  status     text not null default 'scheduled' check (status in ('scheduled','done','cancelled')),
  catatan    text,
  created_at timestamptz not null default now()
);
create index if not exists appointments_tarikh_idx on public.appointments(tarikh);
alter table public.appointments enable row level security;
create policy "appointments_staff_all" on public.appointments for all using (public.is_staff()) with check (public.is_staff());

-- Materials: benarkan staf urus (tulis), selain public read yang sedia ada
create policy "materials_staff_all" on public.materials for all using (public.is_staff()) with check (public.is_staff());
create policy "settings_staff_write" on public.settings for all using (public.is_staff()) with check (public.is_staff());

-- =====================================================================
--  PHASE 3 — Customer portal, payments, reviews, blog
-- =====================================================================

-- ---------- PROJECTS ----------
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid references public.customers(id) on delete set null,
  lead_id       uuid references public.leads(id) on delete set null,
  quotation_id  uuid references public.quotations(id) on delete set null,
  tajuk         text not null,
  kategori      text,
  status        text not null default 'Fabrikasi'
                check (status in ('Deposit','Fabrikasi','Pemasangan','Siap','Warranti')),
  nilai_kontrak numeric not null default 0,
  deposit_pct   numeric not null default 50,
  tarikh_mula   date,
  tarikh_pasang date,
  warranty_until date,
  review_token  text,
  review_done   boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists projects_customer_idx on public.projects(customer_id);
alter table public.projects enable row level security;
create policy "projects_staff_all" on public.projects for all using (public.is_staff()) with check (public.is_staff());
create policy "projects_owner_read" on public.projects for select using (
  customer_id in (select customer_id from public.profiles where id = auth.uid())
);

-- ---------- PROJECT DESIGNS (approval) ----------
create table if not exists public.project_designs (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references public.projects(id) on delete cascade,
  tajuk       text,
  image_url   text not null,
  status      text not null default 'pending' check (status in ('pending','approved','revision')),
  komen       text,
  created_at  timestamptz not null default now()
);
alter table public.project_designs enable row level security;
create policy "designs_staff_all" on public.project_designs for all using (public.is_staff()) with check (public.is_staff());
create policy "designs_owner_rw" on public.project_designs for all using (
  project_id in (select p.id from public.projects p join public.profiles pr on pr.customer_id = p.customer_id where pr.id = auth.uid())
) with check (
  project_id in (select p.id from public.projects p join public.profiles pr on pr.customer_id = p.customer_id where pr.id = auth.uid())
);

-- ---------- PAYMENTS ----------
create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid references public.projects(id) on delete cascade,
  jenis        text not null check (jenis in ('deposit','progress','final')),
  jumlah       numeric not null,
  status       text not null default 'pending' check (status in ('pending','paid','failed')),
  gateway_ref  text,
  dibayar_pada timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists payments_project_idx on public.payments(project_id);
alter table public.payments enable row level security;
create policy "payments_staff_all" on public.payments for all using (public.is_staff()) with check (public.is_staff());
create policy "payments_owner_read" on public.payments for select using (
  project_id in (select p.id from public.projects p join public.profiles pr on pr.customer_id = p.customer_id where pr.id = auth.uid())
);

-- ---------- INVOICES ----------
create table if not exists public.invoices (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  no_invois  text unique not null,
  jumlah     numeric not null,
  status     text not null default 'unpaid' check (status in ('unpaid','paid')),
  pdf_url    text,
  created_at timestamptz not null default now()
);
alter table public.invoices enable row level security;
create policy "invoices_staff_all" on public.invoices for all using (public.is_staff()) with check (public.is_staff());
create policy "invoices_owner_read" on public.invoices for select using (
  project_id in (select p.id from public.projects p join public.profiles pr on pr.customer_id = p.customer_id where pr.id = auth.uid())
);

-- ---------- WARRANTY CLAIMS ----------
create table if not exists public.warranty_claims (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references public.projects(id) on delete cascade,
  keterangan  text not null,
  url_gambar  text,
  status      text not null default 'baru' check (status in ('baru','dalam_proses','selesai')),
  tindakan    text,
  created_at  timestamptz not null default now()
);
alter table public.warranty_claims enable row level security;
create policy "warranty_staff_all" on public.warranty_claims for all using (public.is_staff()) with check (public.is_staff());
create policy "warranty_owner_rw" on public.warranty_claims for all using (
  project_id in (select p.id from public.projects p join public.profiles pr on pr.customer_id = p.customer_id where pr.id = auth.uid())
) with check (
  project_id in (select p.id from public.projects p join public.profiles pr on pr.customer_id = p.customer_id where pr.id = auth.uid())
);

-- ---------- REVIEWS ----------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references public.projects(id) on delete set null,
  nama        text not null,
  rating      int not null default 5 check (rating between 1 and 5),
  ulasan      text,
  diterbitkan boolean default false,
  created_at  timestamptz not null default now()
);
alter table public.reviews enable row level security;
create policy "reviews_public_read" on public.reviews for select using (diterbitkan = true);
create policy "reviews_staff_all" on public.reviews for all using (public.is_staff()) with check (public.is_staff());

-- ---------- BLOG ----------
create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  tajuk        text not null,
  ringkasan    text,
  kandungan    text,          -- markdown / html ringkas
  cover_url    text,
  diterbitkan  boolean default false,
  created_at   timestamptz not null default now()
);
create index if not exists blog_published_idx on public.blog_posts(diterbitkan, created_at desc);
alter table public.blog_posts enable row level security;
create policy "blog_public_read" on public.blog_posts for select using (diterbitkan = true);
create policy "blog_staff_all" on public.blog_posts for all using (public.is_staff()) with check (public.is_staff());

-- =====================================================================
--  PHASE 4 — Suppliers / installers + claims → voucher
-- =====================================================================

-- Helper: adakah pengguna semasa admin/finance?
create or replace function public.is_finance() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','finance'));
$$;

-- ---------- SUPPLIERS / INSTALLERS ----------
create table if not exists public.suppliers (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null,
  syarikat   text,
  no_ssm     text,
  telefon    text,
  emel       text,
  bank       text,
  no_akaun   text,
  jenis      text default 'pembekal' check (jenis in ('pembekal','installer')),
  status     text not null default 'pending' check (status in ('pending','diluluskan','ditolak')),
  url_dokumen text,
  created_at timestamptz not null default now()
);
alter table public.suppliers enable row level security;
create policy "suppliers_staff_all" on public.suppliers for all using (public.is_staff()) with check (public.is_staff());
create policy "suppliers_owner_read" on public.suppliers for select using (
  id in (select supplier_id from public.profiles where id = auth.uid())
);

-- ---------- SUPPLIER CLAIMS ----------
create table if not exists public.supplier_claims (
  id            uuid primary key default gen_random_uuid(),
  supplier_id   uuid references public.suppliers(id) on delete cascade,
  project_id    uuid references public.projects(id) on delete set null,
  no_tuntutan   text unique not null,
  butiran       text,
  jumlah        numeric not null default 0,
  url_dokumen   text,
  status        text not null default 'baru' check (status in ('baru','diluluskan','ditolak','dibayar')),
  voucher_id    uuid,
  created_at    timestamptz not null default now()
);
create index if not exists claims_supplier_idx on public.supplier_claims(supplier_id);
alter table public.supplier_claims enable row level security;
create policy "claims_staff_all" on public.supplier_claims for all using (public.is_staff()) with check (public.is_staff());
create policy "claims_owner_rw" on public.supplier_claims for all using (
  supplier_id in (select supplier_id from public.profiles where id = auth.uid())
) with check (
  supplier_id in (select supplier_id from public.profiles where id = auth.uid())
);

-- ---------- VOUCHERS (baucer bayaran auto-jana) ----------
create table if not exists public.vouchers (
  id          uuid primary key default gen_random_uuid(),
  claim_id    uuid references public.supplier_claims(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  no_baucer   text unique not null,
  jumlah      numeric not null default 0,
  status      text not null default 'pending' check (status in ('pending','dibayar')),
  dibayar_pada timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists vouchers_supplier_idx on public.vouchers(supplier_id);
alter table public.vouchers enable row level security;
create policy "vouchers_staff_all" on public.vouchers for all using (public.is_staff()) with check (public.is_staff());
create policy "vouchers_owner_read" on public.vouchers for select using (
  supplier_id in (select supplier_id from public.profiles where id = auth.uid())
);

-- ---------- WHATSAPP LOG (audit mesej automatik) ----------
create table if not exists public.wa_log (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references public.leads(id) on delete set null,
  telefon    text,
  arah       text not null default 'keluar' check (arah in ('keluar','masuk')),
  jenis      text,          -- lead/stage/payment/appointment/review/reply
  template   text,
  mesej      text,
  status     text,          -- sent/failed/delivered/read
  ref        text,          -- message id dari Meta
  created_at timestamptz not null default now()
);
create index if not exists wa_log_lead_idx on public.wa_log(lead_id, created_at desc);
alter table public.wa_log enable row level security;
create policy "wa_log_staff_all" on public.wa_log for all using (public.is_staff()) with check (public.is_staff());

-- Toggle automasi WhatsApp
insert into public.settings(key, value) values ('wa_automation_enabled', 'false'::jsonb)
on conflict (key) do nothing;
