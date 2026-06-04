-- Sample fines for FineGuide Europe.
-- Placeholder values for demo purposes only — NOT legal advice.
-- Mirrors lib/fines.ts (SAMPLE_FINES): every country has each category so the
-- comparison table lines up.
--
-- Uses on_conflict so re-running merges duplicates instead of erroring
-- (matches the "Prefer: resolution=merge-duplicates" rule in CLAUDE.md).

insert into public.fines (country_code, category, description, amount, currency, points) values
  -- Switzerland (CHF) — no demerit-point system
  ('ch', 'speeding', 'Tempo 16–20 km/h zu schnell (innerorts)', 250, 'CHF', null),
  ('ch', 'redlight', 'Missachten eines Rotlichts',              250, 'CHF', null),
  ('ch', 'phone',    'Telefonieren ohne Freisprechanlage',      100, 'CHF', null),
  ('ch', 'parking',  'Parkieren auf dem Trottoir',              120, 'CHF', null),
  ('ch', 'alcohol',  'Fahren mit 0,5–0,79 ‰',                   600, 'CHF', null),
  ('ch', 'seatbelt', 'Nicht angegurtet',                         60, 'CHF', null),

  -- Germany (EUR) — points = Punkte in Flensburg
  ('de', 'speeding', 'Bis 20 km/h zu schnell (innerorts)',       70, 'EUR', 0),
  ('de', 'redlight', 'Rote Ampel überfahren',                    90, 'EUR', 1),
  ('de', 'phone',    'Handy am Steuer',                         100, 'EUR', 1),
  ('de', 'parking',  'Unerlaubtes Parken',                       25, 'EUR', 0),
  ('de', 'alcohol',  '0,5-‰-Grenze (Erstverstoß)',              500, 'EUR', 2),
  ('de', 'seatbelt', 'Nicht angeschnallt',                       30, 'EUR', 0),

  -- Austria (EUR)
  ('at', 'speeding', 'Bis 30 km/h zu schnell',                   45, 'EUR', null),
  ('at', 'redlight', 'Rotlichtmissachtung',                      70, 'EUR', null),
  ('at', 'phone',    'Handy am Steuer',                         100, 'EUR', null),
  ('at', 'parking',  'Vorschriftswidriges Parken',               36, 'EUR', null),
  ('at', 'alcohol',  'Alkohol 0,5–0,79 ‰',                      300, 'EUR', null),
  ('at', 'seatbelt', 'Gurtpflicht missachtet',                   35, 'EUR', null),

  -- France (EUR) — points = permis à points
  ('fr', 'speeding', 'Excès de vitesse < 20 km/h',               68, 'EUR', 1),
  ('fr', 'redlight', 'Non-respect d’un feu rouge',              135, 'EUR', 4),
  ('fr', 'phone',    'Téléphone tenu en main au volant',        135, 'EUR', 3),
  ('fr', 'parking',  'Stationnement gênant',                     35, 'EUR', 0),
  ('fr', 'alcohol',  'Alcoolémie 0,5–0,8 g/L',                  135, 'EUR', 6),
  ('fr', 'seatbelt', 'Ceinture non bouclée',                    135, 'EUR', 3),

  -- Italy (EUR) — points = patente a punti
  ('it', 'speeding', 'Eccesso di velocità fino a 10 km/h',       42, 'EUR', 0),
  ('it', 'redlight', 'Passaggio con semaforo rosso',            167, 'EUR', 6),
  ('it', 'phone',    'Uso del cellulare alla guida',            165, 'EUR', 5),
  ('it', 'parking',  'Sosta vietata',                            42, 'EUR', 0),
  ('it', 'alcohol',  'Tasso alcolemico 0,5–0,8 g/L',            544, 'EUR', 10),
  ('it', 'seatbelt', 'Cintura non allacciata',                   83, 'EUR', 5)
on conflict (country_code, description) do update set
  category = excluded.category,
  amount   = excluded.amount,
  currency = excluded.currency,
  points   = excluded.points;
