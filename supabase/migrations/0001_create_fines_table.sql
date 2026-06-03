-- FineGuide Europe — traffic fines ("Verkehrsbussen") schema.
--
-- Rules (see CLAUDE.md):
--  * The text column is `description`, never `desc` (reserved word in PostgreSQL).
--  * The client only ever uses the anon key, so RLS grants READ access only.

create table if not exists public.fines (
  id           uuid primary key default gen_random_uuid(),
  country_code text not null,
  category     text not null,
  description  text not null,
  amount       numeric(10, 2) not null,
  currency     text not null,
  points       integer,
  created_at   timestamptz not null default now(),
  -- Unique target enables conflict-free upserts
  -- (Prefer: resolution=merge-duplicates / on_conflict).
  constraint fines_country_description_key unique (country_code, description)
);

create index if not exists fines_country_code_idx on public.fines (country_code);

-- Row Level Security: anon clients may read, never write.
alter table public.fines enable row level security;

drop policy if exists "Public read access to fines" on public.fines;
create policy "Public read access to fines"
  on public.fines
  for select
  using (true);
