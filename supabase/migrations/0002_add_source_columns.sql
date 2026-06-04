-- Add provenance columns so each fine can show its official source and the
-- date it was last verified ("Stand" / "last updated").

alter table public.fines
  add column if not exists source_url text,
  add column if not exists updated_at date;
