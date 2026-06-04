# FineGuide Europe — Feature Roadmap

Prioritized **Now / Next / Later**. Each item has a short **value** and
**effort** note (S ≤ ~3 days, M ≈ 1–2 weeks, L ≈ 3–6 weeks). Sequencing reflects
the strategy in `marketing-program.md`: look premium, earn trust with real data,
then monetize and expand.

> **Disclaimer:** fine amounts in the app are illustrative samples, not legal
> advice. Several features below (calculator, "last updated", sources) exist
> specifically to keep that boundary clear and trustworthy.

---

## NOW — ship to look premium, trustworthy and useful (0–8 weeks)

| Feature | Value | Effort | Notes |
|---|---|---|---|
| **Visual redesign** (apply `design-system.md`) | **High** — biggest lift to conversion everywhere | M | Theme tokens, line icons, flag chips, severity color, dark mode. Highest ROI. |
| **Real sourced data + "last updated" & source link** | **High** — credibility; precondition for paid & B2B | L | Replace `SAMPLE_FINES` with sourced data per country; add `source_url`, `updated_at`. Move to Supabase (anon key only, RLS read-only). |
| **Severity color-coding** of amounts | High — scan severity instantly; ownable mechanic | S | `severityForAmount` helper (in design system). |
| **Category filter pills** on Detail + Compare | Medium-high — faster navigation | S | Reuses existing `CATEGORIES`. |
| **Currency conversion (CHF↔EUR)** | **High** — directly serves CH cross-border commuters | M | Bundle a periodically-updated rate; toggle pill; label "approx." |
| **Penalty calculator** | **High** — the "active" tool tourists search for | M | Inputs: country + violation (+ speed-over band where relevant) → estimated fine + points. Clear "estimate / illustrative" labeling. |
| **Favorites / pinned countries** | High — core for commuters; drives return visits | S | Local persistence (AsyncStorage); pin 2 countries on Home. |
| **Disclaimer banners + plain-language copy pass** | High — legal safety + clarity | S | Standardize across screens; expand i18n. |
| **Empty / loading / error states** | Medium — perceived quality, no white screens | S | Skeletons + signpost empties (design system). |
| **Analytics instrumentation** | Medium — needed to steer everything else | S | Privacy-friendly events (screen views, compare used, calc used). |

---

## NEXT — grow value, monetize, reach (2–4 months)

| Feature | Value | Effort | Notes |
|---|---|---|---|
| **Offline mode** | **High** — works at the border; premium hook | M | Cache data locally; "showing saved data" banner. Pairs with Pro. |
| **Pro tier + paywall** | **High** — revenue | M | RevenueCat or store IAP; gate calculator/currency/offline/unlimited favorites. Annual-first. |
| **More countries (→ 10)** | **High** — broadens addressable market & SEO | L | E.g. ES, NL, BE, CZ, PL. Data model already supports it (`country_code`). |
| **Share / export** | Medium-high — virality + B2B (fleet briefing) | S | Share a fine or a comparison as an image/PDF/link; deep links. |
| **SEO landing pages (PWA)** | **High** — cheap organic acquisition | M | Per country/violation, structured data, hreflang DE/EN/FR/IT. |
| **Push reminders / rule-change alerts** | Medium-high — retention; reason to keep app | M | "Rules updated in your pinned countries"; seasonal road-trip nudge. |
| **Fine detail sheet** | Medium — depth, sources, related rules | S | Tap a fine → bottom sheet with explanation, source, related violations. |
| **Severity / "most expensive" comparison view** | Medium — shareable PR hook | S | Rank countries by a violation; powers data-story PR. |
| **"What's different here" trip view** | Medium-high — tourist hero flow | M | Pick home + destination → highlights the rules that differ most. |

---

## LATER — depth, niches, B2B platform (4+ months)

| Feature | Value | Effort | Notes |
|---|---|---|---|
| **B2B / white-label module** | **High (revenue)** — the sellable-asset thesis | L | Theming, logo, seat/admin; for auto clubs (TCS/ADAC/ÖAMTC), insurers, fleets/rentals. |
| **Maps & location awareness** | Medium-high — "you're in X, here are its rules" | L | Detect country (or speed-camera/low-emission-zone overlays). Privacy-first. |
| **Motorcycle / campervan filters** | Medium — niche, willing-to-pay segments | M | Vehicle-type rules (helmet, dimensions, eco zones). Premium content. |
| **Low-emission / city zones (Umweltzonen, ZTL, Crit'Air)** | Medium-high — common, costly, confusing | L | High search demand; complements fines. |
| **Tolls & vignettes** | Medium — adjacent trip cost | M | CH/AT vignette, IT/FR autoroute — rounds out "cost of driving here." |
| **More languages (ES, NL, PL …)** | Medium — follows country expansion | M | i18n already structured for it. |
| **User accounts & cross-device sync** | Medium — needed once Pro/B2B mature | M | Supabase Auth (anon key only on client). |
| **Premium country guides / content** | Medium — Pro value + SEO | M | Plain-language "driving in X" explainers. |
| **Crowd corrections / "report an update"** | Low-medium — data freshness signal | S | Lightweight feedback to flag stale figures; humans verify. |

---

## Sequencing rationale

1. **NOW** makes the app *look* sellable and *be* trustworthy — the two blockers
   the user named ("doesn't look great," "thin on features"). Redesign + real
   sourced data + calculator + currency + favorites is a coherent, shippable v1.
2. **NEXT** turns that into *revenue and reach*: offline + Pro paywall, more
   countries, SEO, sharing.
3. **LATER** builds the *moat and the high-margin business*: white-label/B2B,
   maps, niche verticals (motorcycle, low-emission zones, tolls).

### Top 3 to start immediately

1. **Visual redesign** (`design-system.md`).
2. **Real sourced data** with "last updated" + source links.
3. **Penalty calculator + currency conversion (CHF↔EUR)** — the most-searched,
   most "active" utility, directly serving the Swiss cross-border audience.

---

See also: [`marketing-program.md`](./marketing-program.md) ·
[`design-system.md`](./design-system.md)
