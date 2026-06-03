-- Sample fines for FineGuide Europe.
-- Placeholder values for demo purposes only — NOT legal advice.
--
-- Uses on_conflict so re-running merges duplicates instead of erroring
-- (matches the "Prefer: resolution=merge-duplicates" rule in CLAUDE.md).

insert into public.fines (country_code, category, description, amount, currency, points) values
  -- Switzerland (CHF)
  ('ch', 'speeding', 'Tempo 16–20 km/h zu schnell (innerorts)', 250, 'CHF', null),
  ('ch', 'redlight', 'Missachten eines Rotlichts',              250, 'CHF', null),
  ('ch', 'phone',    'Telefonieren ohne Freisprechanlage',      100, 'CHF', null),
  ('ch', 'parking',  'Parkieren auf dem Trottoir',              120, 'CHF', null),

  -- Germany (EUR)
  ('de', 'speeding', 'Bis 20 km/h zu schnell (innerorts)',       70, 'EUR', 0),
  ('de', 'phone',    'Handy am Steuer',                         100, 'EUR', 1),
  ('de', 'redlight', 'Rote Ampel überfahren',                    90, 'EUR', 1),
  ('de', 'parking',  'Unerlaubtes Parken',                       25, 'EUR', 0),

  -- Austria (EUR)
  ('at', 'speeding', 'Bis 30 km/h zu schnell',                   45, 'EUR', null),
  ('at', 'phone',    'Handy am Steuer',                         100, 'EUR', null),
  ('at', 'alcohol',  'Alkohol am Steuer (0,5–0,8 ‰)',           300, 'EUR', null),

  -- France (EUR)
  ('fr', 'speeding', 'Excès de vitesse < 20 km/h',               68, 'EUR', 1),
  ('fr', 'phone',    'Téléphone tenu en main au volant',        135, 'EUR', 3),
  ('fr', 'redlight', 'Non-respect d’un feu rouge',              135, 'EUR', 4),

  -- Italy (EUR)
  ('it', 'speeding', 'Eccesso di velocità fino a 10 km/h',       42, 'EUR', null),
  ('it', 'phone',    'Uso del cellulare alla guida',            165, 'EUR', null),
  ('it', 'redlight', 'Passaggio con semaforo rosso',            167, 'EUR', null)
on conflict (country_code, description) do update set
  category = excluded.category,
  amount   = excluded.amount,
  currency = excluded.currency,
  points   = excluded.points;
