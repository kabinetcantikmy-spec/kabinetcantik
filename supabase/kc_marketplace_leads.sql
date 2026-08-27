-- ============================================================
-- KabinetCantik — LEAD MARKETPLACE (kolam lead pusat + tuntutan eksklusif)
-- marketplace_leads = kolam PUSAT dari borang awam. TIADA org_id.
-- lead_claims = UNIQUE(marketplace_lead_id) → 1 lead → 1 kontraktor.
-- Akses via service-role sahaja. Run di Supabase SQL Editor. Idempotent.
-- ============================================================
create extension if not exists "pgcrypto";

create table if not exists public.marketplace_leads (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,
  telefon     text not null,
  emel        text,
  poskod      text,
  kawasan     text,
  kategori    text,
  bajet       text,
  timeline    text,
  keterangan  text,
  status      text not null default 'available',
  created_at  timestamptz not null default now()
);
create index if not exists mkt_leads_status_idx on public.marketplace_leads(status, created_at desc);
create index if not exists mkt_leads_poskod_idx on public.marketplace_leads(poskod);

create table if not exists public.lead_claims (
  id                   uuid primary key default gen_random_uuid(),
  marketplace_lead_id  uuid not null unique references public.marketplace_leads(id) on delete cascade,
  org_id               uuid not null,
  claimed_by           uuid,
  crm_lead_id          uuid,
  source               text not null default 'free',
  amount               numeric default 0,
  claimed_at           timestamptz not null default now()
);
create index if not exists lead_claims_org_idx   on public.lead_claims(org_id, claimed_at desc);
create index if not exists lead_claims_month_idx on public.lead_claims(org_id, source, claimed_at);

alter table public.marketplace_leads enable row level security;
alter table public.lead_claims        enable row level security;
