-- The dataset now holds several rows per category (e.g. the same speeding band
-- on different road types), and the sync does a full replace, so the old
-- (country_code, description) uniqueness constraint is no longer needed.
alter table public.fines drop constraint if exists fines_country_description_key;
