# FineGuide Europe — Design System

A concrete, implementable UI/UX spec to elevate the app from "functional" to
"premium." Token names map cleanly to a `lib/theme.ts` object and StyleSheet
values, so developers can adopt this incrementally without rewriting screens.

> **Disclaimer surface:** every screen that shows amounts must display the
> "illustrative values — not legal advice" microcopy (see Components → Disclaimer
> banner). Fine amounts are samples, not legal advice.

---

## 1. Design principles

1. **Clarity first.** Amounts and severity must be scannable in under a second.
2. **Comparison is the hero.** Lay out information so cross-country differences
   pop (consistent columns, tabular figures, severity color).
3. **Calm trust.** Restrained palette, generous spacing, real iconography — not
   emoji-as-data.
4. **One system, light + dark.** Every token has a light and dark value.
5. **Accessible by default.** AA contrast, 44pt targets, dynamic type.

---

## 2. Color tokens

Replace the current ad-hoc colors (`#0a7ea4`, `#11181C`, `#687076`, `#9BA1A6`,
`#ffffff`) with these tokens. Implement as `theme.light` / `theme.dark`.

### Brand / semantic

| Token | Light | Dark | Use |
|---|---|---|---|
| `brand.primary` | `#1B5FCC` | `#5B8DEF` | Buttons, active tab, links, headers |
| `brand.primaryPressed` | `#1748A0` | `#3F73D6` | Pressed/active state |
| `brand.onPrimary` | `#FFFFFF` | `#0B1B2B` | Text/icon on primary |
| `accent.amber` | `#F5A524` | `#F7B955` | Highlights, "watch out", points badge |
| `severity.low` | `#1FA971` | `#2FBF86` | Low fine (green) |
| `severity.mid` | `#F5A524` | `#F7B955` | Medium fine (amber) |
| `severity.high` | `#E5484D` | `#F16A6F` | High fine (red) |

### Surfaces & text (neutrals)

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg.canvas` | `#F7F8FA` | `#0E1620` | Screen background (not pure white) |
| `bg.surface` | `#FFFFFF` | `#16212E` | Cards, list rows |
| `bg.surfaceAlt` | `#EFF2F6` | `#1E2B3A` | Pills, inputs, table stripes |
| `border.subtle` | `#E3E8EE` | `#26323F` | Hairlines, card borders |
| `text.primary` | `#0B1B2B` | `#F2F5F9` | Headings, amounts |
| `text.secondary` | `#5A6776` | `#9FB0C0` | Descriptions, captions |
| `text.tertiary` | `#8A97A6` | `#6B7B8C` | Hints, disabled, chevrons |

**Contrast:** `text.primary` on `bg.surface` ≥ 12:1; `text.secondary` ≥ 4.5:1;
`brand.onPrimary` on `brand.primary` ≥ 4.5:1. Verify on dark too.

### Severity helper

```
severityForAmount(amount, currencyMaxRef):
  ratio = amount / referenceMax   // reference per category/country
  ratio < 0.33  -> severity.low
  ratio < 0.66  -> severity.mid
  else          -> severity.high
```

Use it on the amount text color and on a 3px left accent bar on the fine card.

---

## 3. Spacing scale

4-pt base. Use tokens, not raw numbers.

| Token | px |
|---|---|
| `space.0` | 0 |
| `space.1` | 4 |
| `space.2` | 8 |
| `space.3` | 12 |
| `space.4` | 16 |
| `space.5` | 20 |
| `space.6` | 24 |
| `space.8` | 32 |
| `space.10` | 40 |

**Radii:** `radius.sm` 8 · `radius.md` 12 · `radius.lg` 16 · `radius.pill` 999.
**Screen padding:** `space.4` (16) horizontal.
**Card padding:** `space.4` (16). **List gap:** `space.3` (12).

### Elevation

| Token | Light shadow | Dark |
|---|---|---|
| `elevation.card` | y2, blur 8, `rgba(11,27,43,0.06)` | border `border.subtle`, no shadow |
| `elevation.raised` | y6, blur 16, `rgba(11,27,43,0.10)` | subtle inner highlight |

In dark mode prefer borders over shadows.

---

## 4. Typography scale

**Pairing:** Display/headlines in **"Geist"** or **"Plus Jakarta Sans"**; body/UI
in **Inter**. Load via `expo-font`. **Amounts use tabular figures**
(`fontVariant: ['tabular-nums']`) so columns align.

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `type.display` | 28 / 34 | 700 | Screen title (Home hero) |
| `type.h1` | 22 / 28 | 700 | Headers |
| `type.h2` | 18 / 24 | 600 | Section / country name |
| `type.body` | 15 / 22 | 400 | Descriptions |
| `type.bodyStrong` | 15 / 22 | 600 | Emphasis |
| `type.amount` | 18 / 22 | 800 (tabular) | Fine amount |
| `type.label` | 12 / 16 | 700 (uppercase, +0.5 tracking) | Category eyebrow, table headers |
| `type.caption` | 13 / 18 | 400 | Points, hints, disclaimer |

Respect OS dynamic type / `allowFontScaling`.

---

## 5. Component specs

### Flag chip (replaces bare unicode flag)

- Rounded-rect 28×20, `radius.sm`, 1px `border.subtle`, slight clip.
- Render emoji flag centered, or (preferred) an SVG flag asset for crisp web.
- Used in list rows, headers, comparison rows, search results.

### List row — Country (`CountryListItem`)

Current: white row, flag, name, `›`. Upgrade:

- Background `bg.surface`, `radius.md`, 1px `border.subtle`, `elevation.card`.
- Left: **flag chip**. Center: country name `type.h2` `text.primary` + a small
  subtitle `type.caption` `text.secondary` (e.g. "EUR · point system" or
  "CHF · no points"). Right: chevron icon (Lucide `chevron-right`)
  `text.tertiary`.
- Padding `space.4`; row gap `space.4`; min height 64; `radius.md`.
- Pressed: background `bg.surfaceAlt`, scale 0.99 (not opacity 0.6).

### Card — Fine (`FineListItem`)

Current: white card, category eyebrow, amount, description, points. Upgrade:

- `bg.surface`, `radius.md`, `elevation.card`, padding `space.4`,
  **3px left accent bar** colored by `severityForAmount`.
- Top row: category line-icon (20, `brand.primary`) + category label
  `type.label` `brand.primary`  |  right: amount `type.amount`, colored by
  severity, currency in `text.secondary`.
- Description `type.body` `text.primary`.
- Footer chips: **points pill** (only if `points != null && > 0`) — amber pill,
  `type.caption`, label "N points / Punkte". Optional severity word.
- Tappable to open a detail sheet (see roadmap) — add `chevron-right` affordance.

### Buttons

| Variant | Bg | Text | Border | Use |
|---|---|---|---|---|
| Primary | `brand.primary` | `brand.onPrimary` | none | Main CTA |
| Secondary | `bg.surfaceAlt` | `text.primary` | `border.subtle` | Secondary |
| Ghost | transparent | `brand.primary` | none | Inline/link |

Height 48, `radius.md`, horizontal padding `space.5`, pressed → `primaryPressed`
/ darken 6%. Min target 44×44.

### Pills / chips

- Height 28, `radius.pill`, padding `space.3` horizontal, `type.caption`.
- **Filter pill** (category filter): default `bg.surfaceAlt`/`text.secondary`;
  selected `brand.primary`/`onPrimary`.
- **Points pill:** `accent.amber` bg tint (`rgba(245,165,36,0.15)`), amber text.
- **Currency toggle pill:** CHF / EUR segmented.

### Tab bar (`(tabs)/_layout.tsx`)

- Background `bg.surface`, top hairline `border.subtle`, blur on iOS.
- Active `brand.primary`, inactive `text.tertiary`.
- **Replace emoji tab icons** (🌍 📊 🔍) with Lucide: `globe`, `bar-chart-3`,
  `search`. Label `type.label` (10–11pt).

### Header

- Replace flat teal (`#0a7ea4`) header. Use `bg.canvas` with a large-title style:
  title `type.display` `text.primary`, optional flag chip + currency on detail.
- Keep the **LanguageSwitcher** in the header right; restyle as a ghost pill with
  a `globe`/`languages` icon + current language code.
- Tint icons `brand.primary`; remove the white-on-teal look.

### Comparison table (Compare tab)

- Sticky header row: `type.label`, `bg.surfaceAlt`.
- Each country row: flag chip + name | amount (tabular, severity color) | points
  pill. Zebra stripe with `bg.surfaceAlt` at 50% for readability.
- Category selector at top as horizontal scroll of **filter pills** (with the
  category icon).
- Add a "sort by amount" affordance and a "convert to EUR/CHF" toggle.

### Search

- Search field: `bg.surfaceAlt`, `radius.md`, leading `search` icon, clear `×`,
  height 44, placeholder `text.tertiary`.
- Result rows reuse the Fine card with the **country flag chip** prefixed and the
  country name shown, since search spans all countries.

### Disclaimer banner

- Subtle info bar: `bg.surfaceAlt`, `info` icon `text.secondary`, `type.caption`:
  "Illustrative values — not legal advice." Pinned under headers on Detail,
  Compare, Search.

---

## 6. States

| State | Treatment |
|---|---|
| **Loading** | Skeleton rows/cards (shimmer on `bg.surfaceAlt`), not a bare spinner. 3–5 placeholder cards. |
| **Empty** | Centered line illustration (signpost) + `type.h2` headline + `type.body` subtext + optional CTA. Reuse i18n `detail.empty`, `search.noResults`. |
| **Error** | `alert-triangle` icon `severity.high`, message (`detail.error`), "Retry" secondary button. |
| **Offline** | Banner "Showing saved data" when cached; never a white screen. |
| **Pressed** | `bg.surfaceAlt` + scale 0.99. |
| **Disabled** | 40% opacity, no shadow. |

---

## 7. Accessibility

- **Contrast:** AA (4.5:1 text, 3:1 large/icons) in both themes.
- **Targets:** ≥ 44×44pt; rows ≥ 48 tall.
- **Don't encode meaning in color alone:** severity also shown via the amount and
  a word/label, so color-blind users aren't excluded.
- **Labels:** `accessibilityRole`/`accessibilityLabel` on rows, pills, switcher.
  Country rows already use `accessibilityRole="link"` — keep and extend.
- **Dynamic type:** allow scaling; test at 130%.
- **Focus order & screen readers:** logical order; announce amount+currency+
  points together ("Switzerland, speeding, 250 Swiss francs").
- **Reduced motion:** disable shimmer/scale when `prefers-reduced-motion`.

---

## 8. Screen-by-screen redesign

### Home (`(tabs)/index.tsx`)

- Large title "FineGuide Europe" (`type.display`) + subtitle (existing
  `home.subtitle`) in `text.secondary`.
- Optional **search shortcut** field below the title (jumps to Search).
- Country list as upgraded rows (flag chip + name + currency/points subtitle +
  chevron) on `bg.canvas`, cards `bg.surface`.
- Add a **"Compare countries"** primary CTA card at the top that deep-links to the
  Compare tab — surfaces the hero feature immediately.

### Country Detail (`country/[id].tsx`)

- Header: flag chip + country name + currency badge; disclaimer banner beneath.
- **Category filter pills** (horizontal scroll) to filter the fine list.
- Fine cards with severity accent + points pills, sorted by amount (as today).
- Add a sticky **"Compare this country"** button → Compare tab preset to this
  country.

### Comparison (`(tabs)/compare.tsx`)

- Title + subtitle (existing `compare.*` keys).
- Category selector as filter pills (with icons).
- Comparison table per spec: flag chip rows, severity-colored tabular amounts,
  points pills, zebra striping, sort + currency toggle.
- Footer disclaimer.

### Search (`(tabs)/search.tsx`)

- Prominent styled search field; existing hint as empty state with a signpost
  illustration.
- Results = Fine cards prefixed with country flag chip + name.
- Highlight the matched term in the description.
- `search.noResults` empty state styled per States section.

---

## 9. Implementation notes for developers

1. Add `lib/theme.ts` exporting `light`/`dark` token objects + a `useTheme()`
   hook (driven by `useColorScheme()`); replace hard-coded hex in components.
2. Add a `severityForAmount` helper in `lib/` and a `<FlagChip>` component.
3. Swap emoji category/tab icons for a line-icon set (`lucide-react-native`),
   keeping `categoryIcon()` as a mapping from `CategoryId` → icon name.
4. Add `expo-font` loading for Inter + the display face; set tabular figures on
   amount styles.
5. Introduce skeleton components for loading states.
6. Keep all existing i18n keys; add only new ones (e.g. `common.retry`,
   `common.disclaimer`, currency toggle labels) across de/en/fr/it.

These are additive, low-risk changes that dramatically lift perceived quality.
