# MicroVerse: Gut & Food Lab — Architecture

_Last updated: 2026-02-24 (rev 2)_

---

## Overview

Single-page React application. No backend — all logic runs client-side.
Monolithic `App.jsx` (intentional at current scale; split plan below for future reference).

---

## Actual File Structure

```
microverse/
├── src/
│   ├── App.jsx              # Full app — UI, state, components, translations, styles
│   ├── data/
│   │   └── media.js         # Culture media database (MEDIA array + lookup tables)
│   └── main.jsx             # React entry point
├── public/
│   └── favicon.svg
├── PLAN/
│   └── MEMORY.md            # Recurring error patterns log
├── ARCHITECTURE.md
├── CLAUDE.md
├── README.md
├── index.html
├── package.json
└── vite.config.js
```

> Note: `src/data/foods.js`, `src/data/bacteria.js`, `src/engine/`, `src/i18n/`,
> `src/styles/`, and `src/components/` are **planned structure** — not yet extracted.
> All of that currently lives inside `App.jsx`.

---

## App.jsx Internal Structure

Sections in order:

| Section | Description |
|---------|-------------|
| Global styles | Injected via `<style>` tag — CSS variables, animations, utility classes |
| `FOODS` array | 77+ food items with nutrition + microbiome effects |
| `BACTERIA` array | 8 bacteria definitions with SVG positions |
| `SYMPTOMS` array | 12 symptom entries with affected bacteria + food tips |
| `BASELINES_BY_AGE` | 5 age groups (child/teen/young/middle/older) × 8 bacteria scores |
| `getBaselineByAge(age)` | Maps numeric age → baseline object |
| `T` object | RU + EN translations (~60 keys each) |
| Core functions | `calcNutrition`, `calcMicrobiome`, `healthScore`, `scoreColor`, `scoreLabel` |
| `PROTOCOLS` | 5 clinical seeding protocols (UTI, Sepsis, GI, Wound, Resp) |
| Components | `CalculatorTab`, `DiaryTab`, `RecommendationsTab`, `SymptomsTab`, `MediaLabTab`, `ParticleField` |
| `App` (default export) | Root component — lang, tab, calcLog, age state |

---

## Tabs

| Index | Key | Component | Local State |
|-------|-----|-----------|-------------|
| 0 | Calculator | `CalculatorTab` | `query`, `amount` |
| 1 | Diary | `DiaryTab` | `meals`, `query`, `amount`, `activeMeal` |
| 2 | Recommendations | `RecommendationsTab` | — |
| 3 | Symptoms | `SymptomsTab` | `selected` (Set) |
| 4 | MediaLab | `MediaLabTab` | `query`, `sampleFilter`, `typeFilter`, `selected`, `protocolMode`, `activeScenario` |

---

## State Management

State lives in `App` and is passed down as props. No external state library.

| State | Location | Type | Description |
|-------|----------|------|-------------|
| `lang` | App | `"ru"` \| `"en"` | UI language |
| `tab` | App | `0–4` | Active tab index |
| `calcLog` | App | `{id,food,amount}[]` | Calculator food log |
| `age` | App | `number` | User age — drives baseline selection |

---

## Core Engine (inside App.jsx)

### `calcNutrition(log)` → `{cal, prot, fat, carb, fib}`
Sums macros weighted by gram amount.

### `calcMicrobiome(log, baseline)` → `{bif, lac, akk, fae, bac, cdi, eco, can}`
Applies food effects to age-specific baseline:
- `food.boost[]` bacteria gain `(pre×1.6 + pro×9 + fib×0.4) × scale`
- `food.sup[]` bacteria lose `(pre×1.3 + pro×7) × scale`
- Simple sugars (carbs >12g) penalise good bacteria, boost pathogens
- High fibre (>5g, no sugar) gives bonus to bif/lac/fae
- Scores clamped to `[0, 100]`

### `healthScore(mb)` → `0–100`
```
score = good_avg × 0.68 − bad_avg × 0.32 + 4
```
Where `good_avg` = mean of {bif, lac, akk, fae}, `bad_avg` = mean of {cdi, eco, can}.

---

## Data Schemas

### Food item (`FOODS`)
```js
{
  id: "appl",          // unique key
  ic: "🍎",            // emoji icon
  ru: "Яблоко",        // Russian name
  en: "Apple",         // English name
  cal: 52,             // kcal per 100g
  p: 0.3,              // protein g
  f: 0.2,              // fat g
  c: 14,               // carbs g
  fib: 2.4,            // fiber g
  pre: 7,              // prebiotic score 0–10
  pro: false,          // contains live cultures
  boost: ["bif","akk"],// bacteria it promotes
  sup: ["can"],        // bacteria it suppresses
  sug: "simple"        // "simple" | "complex" | "none"
}
```

### Bacteria item (`BACTERIA`)
```js
{
  id: "bif",
  ru: "Бифидобактерии",
  en: "Bifidobacterium",
  lat: "Bifidobacterium spp.",
  role: "good",        // "good" | "bad" | "neutral"
  desc_ru: "...",
  desc_en: "...",
  color: "#64ffda",
  cx: 80, cy: 118      // SVG position in 480×285 viewBox
}
```

### Culture medium item (`MEDIA` in `src/data/media.js`)
```js
{
  id: "chrom_uti",
  name: "CHROMagar Orientation",     // English name
  name_ru: "ХРОМагар Ориентация",    // Russian name
  manufacturer: "CHROMagar",
  type: "chromogenic",               // chromogenic|blood|selective|differential|
                                     // enrichment|broth|fungal|anaerobic|resistance
  sample_types: ["urine"],           // urine|stool|blood|wound|respiratory|
                                     // vaginal|skin|csf|any
  targets_ru: "...",
  targets_en: "...",
  incubation: {
    temp: 37,                        // °C
    hours_min: 18,
    hours_max: 24,
    atmosphere: "aerobic"            // aerobic|anaerobic|microaerophilic|5%CO2|varies
  },
  colony_ru: "...",
  colony_en: "...",
  use_ru: "...",
  use_en: "...",
  resistance_markers: ["ESBL","..."],
  selectivity: "high",               // high | medium | low
  priority: "primary",               // primary | secondary | confirmatory | enrichment
  article: "ESRT2P"                  // optional — catalogue article number
}
```

### Clinical protocol item (`PROTOCOLS`)
```js
{
  id: "uti",
  labelKey: "mediaProtoUTI",         // translation key
  primary:      ["chrom_uti", ...],  // MEDIA ids — first-line media
  confirmatory: ["chrom_esbl", ...], // confirmatory / speciation media
  resistance:   ["mueller_hinton"],  // AMR / susceptibility testing media
}
```

---

## MediaLab lookup tables (exported from `media.js`)

| Export | Type | Purpose |
|--------|------|---------|
| `MEDIA` | `object[]` | Full culture media database |
| `SAMPLE_TYPES` | `{id,ru,en}[]` | Specimen type filter options |
| `MEDIA_TYPES` | `{id,ru,en,color}[]` | Medium type filter options with badge color |
| `PRIORITY_LABELS` | `{[key]:{ru,en,color}}` | Priority badge labels and colors |
| `ATMOS_LABELS` | `{[key]:{ru,en}}` | Atmosphere condition labels |

---

## Age Baseline Groups

| Key | Age range | Notes |
|-----|-----------|-------|
| `child` | ≤ 12 | High bif/lac, low pathogens |
| `teen` | 13–17 | Transitional |
| `young` | 18–35 | Default / reference |
| `middle` | 36–55 | Slight decline in beneficial |
| `older` | 56+ | Lowest beneficial, highest pathogen baseline |

---

## Design System

Styles are injected at runtime via a `<style>` tag in App.jsx (no external CSS file).

### Theme — Light

| Token | Value | Usage |
|-------|-------|-------|
| Body background | `#8fd8cc` | Page background |
| Card background | `linear-gradient(135deg, #d4f5ef, #c2f0e8)` | `.mv-card` |
| Card border | `1px solid rgba(13,148,136,.3)` | `.mv-card` |
| Text primary | `#1e293b` | Headings, values |
| Text secondary | `#475569` | Labels, descriptions |
| Text muted | `#64748b` | Hints, counts |
| Accent teal | `#0d9488` | Active states, highlights |
| Accent cyan | `#00d4ff` | Secondary accents |
| Accent purple | `#a78bfa` | Bacteria / targets |
| Accent green | `#34d399` | Positive values |
| Accent red | `#f87171` | Pathogens, warnings |
| Accent orange | `#fb923c` | Colony morphology, medium types |
| Teal glow | `#64ffda` | Article badges, SVG bacteria glow |

### CSS Classes

| Class | Description |
|-------|-------------|
| `.mv-card` | Standard card — gradient bg, teal border, 12px radius, 16px padding |
| `.mv-btn` | Base button — transparent, no border-radius default |
| `.mv-btn-primary` | Filled teal button |
| `.mv-btn-ghost` | Ghost / outline button |
| `.mv-btn-danger` | Red destructive button |
| `.mv-input` | Text input — light bg, teal focus ring |

### Animations

| Name | Applies to | Effect |
|------|-----------|--------|
| `blobPulse` | Good bacteria SVG circles | Subtle scale + opacity pulse |
| `badPulse` | Pathogen SVG circles | Opacity pulse only |
| `fadeUp` | Tab content, detail views | Fade in + slide up 10px |
| `slideIn` | List items | Fade in + slide right 14px |
| `glow` | Active SVG elements | `drop-shadow` intensity pulse |
| `barGrow` | Bacteria bar charts | Width grow from 0 to `--w` |
| `spin` | Loading indicators | Full rotation |

---

## SVG Visualization

ViewBox: `480 × 285`.
Bacteria circles have fixed `cx`/`cy` positions — do not modify without checking all 8 entries.
Radius is derived from score: `r = 10 + score * 0.18` (good) or `r = 6 + score * 0.14` (bad).
Animations: `blobPulse` (good bacteria), `badPulse` (pathogens).

---

## Planned Enhancements

- [x] Age profile selector (child / teen / adult / senior)
- [x] Symptom mode
- [x] MediaLab — culture media database
- [x] Clinical seeding protocols (UTI / Sepsis / GI / Wound / Respiratory)
- [ ] User profile persistence (localStorage)
- [ ] Export report as PDF
- [ ] Expand food DB to 200+ items
- [ ] Online deploy (Vercel)
- [ ] Extract components into `src/components/` (split App.jsx)
- [ ] Backend API for personalized recommendations
