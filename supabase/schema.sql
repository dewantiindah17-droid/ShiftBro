-- ============================================================
-- ShiftBro — Skema Database Lisensi Premium (Supabase / PostgreSQL)
-- Jalankan SQL ini di Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- Ekstensi untuk gen_random_uuid()
create extension if not exists "pgcrypto";

-- Tabel lisensi
create table if not exists public.licenses (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  plan          text not null default 'premium',
  status        text not null default 'unused', -- unused | active | expired | revoked
  duration_days integer not null default 30,
  redeemed_by   text,
  outlet        text,
  activated_at  timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- RLS aktif: tabel HANYA diakses dari server (service role), bukan dari browser
alter table public.licenses enable row level security;

-- ============================================================
-- Kode lisensi demo / contoh (boleh diubah atau dihapus)
-- Setelah user bayar di lynk.id, generator kode bisa insert baris baru ke tabel ini.
-- ============================================================
insert into public.licenses (code, duration_days) values
  ('SHIFTBRO-PRO-DEMO25', 30),
  ('SHIFTBRO-PRO-2026', 30),
  ('SHIFTBRO-PRO-KOPI01', 30)
on conflict (code) do nothing;

-- ============================================================
-- Contoh membuat kode baru secara massal (opsional)
-- ============================================================
-- insert into public.licenses (code, duration_days)
-- select 'SHIFTBRO-PRO-' || upper(substring(md5(random()::text) from 1 for 8)), 30
-- from generate_series(1, 20);
