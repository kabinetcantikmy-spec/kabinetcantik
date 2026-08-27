-- KabinetCantik — FASA PERCUMA ("launch"): pindah tenant sedia ada ke plan launch.
-- Ciri penuh, badge kekal, tiada white-label, tanpa tamat. Run di Supabase SQL Editor.

-- 1) Luaskan check constraint plan supaya terima 'launch'.
alter table public.tenants drop constraint if exists tenants_plan_check;
alter table public.tenants
  add constraint tenants_plan_check
  check (plan in ('trial', 'freemium', 'hero', 'pro', 'launch'));

-- 2) Pindah tenant sedia ada.
update public.tenants
set plan = 'launch', status = 'active', trial_ends_at = null
where plan in ('trial', 'freemium') or status = 'trial';
