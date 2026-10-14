-- ============================================================
-- ShiftBro — Skema Database Operasional (Supabase / PostgreSQL)
-- Menyimpan data yang sebelumnya hanya ada di memori aplikasi:
--   outlets, users (pegawai/manager/owner), attendance, swap_requests
-- Jalankan di Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- OUTLETS (kafe)
-- ------------------------------------------------------------
create table if not exists public.outlets (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null unique,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- USERS (pegawai / manager / owner)
-- ------------------------------------------------------------
create table if not exists public.users (
  id                uuid primary key default gen_random_uuid(),
  kode              text unique,          -- EMP-001 / MGR-001 / OWN-001
  nama              text not null,
  role              text not null,        -- pegawai | manager | owner
  posisi            text,
  outlet            text,
  nip               text,
  email             text,
  no_hp             text,
  kode_outlet       text,
  id_supervisor     text,
  pin_hash          text,                 -- pegawai
  passcode_hash     text,                 -- manager
  password_hash     text,                 -- owner
  totp_hash         text,                 -- owner 2FA
  status            text,
  shift_hari_ini    text,
  shift_bertugas    text,
  tingkat_keamanan  text,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ATTENDANCE (absensi / shift)
-- ------------------------------------------------------------
create table if not exists public.attendance (
  id              text primary key,       -- ATT-xxxx
  nama_pegawai    text not null,
  peran_stasiun   text not null,
  shift_type      text not null,
  tanggal_input   date not null,
  hari            text,
  jam_mulai       text,
  jam_selesai     text,
  status          text not null default 'Sedang Bekerja',
  durasi_jam      numeric default 0,
  lembur_jam      numeric default 0,
  lembur_approved boolean default false,
  outlet          text,
  created_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SWAP REQUESTS (pengajuan tukar shift)
-- ------------------------------------------------------------
create table if not exists public.swap_requests (
  id         text primary key,
  pemohon    text not null,
  target     text,
  tanggal    text,
  shift      text,
  alasan     text,
  status     text not null default 'Menunggu Approval',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- RLS: akses HANYA dari server (service role), bukan dari browser
-- ------------------------------------------------------------
alter table public.outlets       enable row level security;
alter table public.users         enable row level security;
alter table public.attendance    enable row level security;
alter table public.swap_requests enable row level security;

-- ============================================================
-- SEED DATA (contoh, boleh diubah/dihapus)
-- ============================================================

insert into public.outlets (nama) values ('Kopi Harmoni')
on conflict (nama) do nothing;

-- Users (hash memakai salt yang sama dengan aplikasi: <kredensial>_shiftbro_salt_2026)
insert into public.users (kode, nama, role, posisi, outlet, nip, email, no_hp, kode_outlet, id_supervisor, pin_hash, passcode_hash, password_hash, totp_hash, status, shift_hari_ini, shift_bertugas, tingkat_keamanan) values
  ('EMP-001', 'Joko', 'pegawai', 'Senior Barista', 'Kopi Harmoni (Yogyakarta)', 'JK-01', null, '081234567890', null, null,
    encode(digest('1234_shiftbro_salt_2026', 'sha256'), 'hex'), null, null, null, 'Aktif', 'Shift Pagi (07:00 - 15:00 WIB)', null, null),
  ('EMP-002', 'Ningsih', 'pegawai', 'Head Kasir', 'Kopi Harmoni (Yogyakarta)', 'NS-02', null, '081298765432', null, null,
    encode(digest('4321_shiftbro_salt_2026', 'sha256'), 'hex'), null, null, null, 'Aktif', 'Shift Pagi (07:00 - 15:00 WIB)', null, null),
  ('MGR-001', 'Rina Kusuma', 'manager', 'Manager Shift Operasional', 'Kopi Harmoni (Yogyakarta)', null, 'rina.manager@kopiharmoni.com', null, 'HRM-YOG-01', 'MGR-RINA',
    null, encode(digest('889900_shiftbro_salt_2026', 'sha256'), 'hex'), null, null, 'Supervisi Aktif', null, 'Shift Pagi & Sore', null),
  ('OWN-001', 'Syifa Azzahra', 'owner', 'Owner & Direktur Bisnis', 'Kopi Harmoni Group', null, 'syifa.owner@kopiharmoni.com', null, null, null,
    null, null, encode(digest('OwnerHarmoni2026!_shiftbro_salt_2026', 'sha256'), 'hex'), encode(digest('552419_shiftbro_salt_2026', 'sha256'), 'hex'), 'Executive Access', null, null, 'Tingkat 3 (2FA Wajib)')
on conflict (kode) do nothing;

-- Attendance
insert into public.attendance (id, nama_pegawai, peran_stasiun, shift_type, tanggal_input, hari, jam_mulai, jam_selesai, status, durasi_jam, lembur_jam, lembur_approved, outlet) values
  ('ATT-101', 'Joko Susanto', 'Barista', 'Shift Pagi (07:00 - 15:00)', '2026-10-14', 'Rabu', '07:00', null, 'Sedang Bekerja', 6.5, 1.5, false, 'Kopi Harmoni'),
  ('ATT-102', 'Siti Ningsih', 'Kasir', 'Shift Pagi (07:00 - 15:00)', '2026-10-14', 'Rabu', '06:55', null, 'Sedang Bekerja', 6.6, 0, false, 'Kopi Harmoni'),
  ('ATT-103', 'Budi Santoso', 'Barista', 'Shift Malam (15:00 - 23:00)', '2026-10-14', 'Rabu', '15:00', null, 'Sedang Bekerja', 1.2, 0, false, 'Kopi Harmoni'),
  ('ATT-099', 'Joko Susanto', 'Barista', 'Shift Pagi (07:00 - 15:00)', '2026-10-13', 'Selasa', '07:00', '15:05', 'Selesai Shift', 8.0, 0, false, 'Kopi Harmoni'),
  ('ATT-098', 'Joko Susanto', 'Barista', 'Shift Malam (15:00 - 23:00)', '2026-10-12', 'Senin', '15:00', '23:02', 'Selesai Shift', 8.0, 0, false, 'Kopi Harmoni'),
  ('ATT-097', 'Ahmad Kitchen', 'Kitchen', 'Shift Pagi (07:00 - 15:00)', '2026-10-13', 'Selasa', '07:00', '15:00', 'Selesai Shift', 8.0, 0, false, 'Kopi Harmoni')
on conflict (id) do nothing;

-- Swap requests
insert into public.swap_requests (id, pemohon, target, tanggal, shift, alasan, status) values
  ('SWP-01', 'Joko Susanto', 'Budi Santoso', 'Kamis, 15 Okt 2026', 'Shift Pagi ⇄ Shift Malam', 'Ada ujian tengah semester', 'Menunggu Approval')
on conflict (id) do nothing;
