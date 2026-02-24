# CLAUDE.md — MicroVerse: Gut & Food Lab

This file tells Claude how to work with this project.

---

## Error Patterns & Memory

Recurring mistakes and their fixes are logged in **[PLAN/MEMORY.md](PLAN/MEMORY.md)**.
Read it before starting any non-trivial change to this codebase.

---

## Project Identity

**Name:** MicroVerse: Gut & Food Lab
**Type:** React SPA — educational microbiology + nutrition platform
**Language:** Trilingual UI — Russian (primary), English, Latin (scientific names)
**Stack:** React 18, Vite, Tailwind CSS (utility classes only), D3.js (SVG animations)
**Author:** Octavian, Kharkiv

---

## What This App Does

Users enter food they eat → the app shows how that food affects their gut microbiome.

Core loop:
1. User searches and adds foods with gram amounts
2. `calcMicrobiome(log, baseline)` recalculates 8 bacteria scores in real time
3. SVG visualization updates — bacteria "blobs" grow or shrink
4. Health score ring updates (0–100)
5. Recommendations tab shows what to add or reduce

---

## Actual File Structure

Everything currently lives in `src/App.jsx` (monolith). The only separate data file is:

| File | Contents |
|------|----------|
| `src/App.jsx` | All UI, state, components, translations, inline styles |
| `src/data/media.js` | Culture media DB — `MEDIA`, `SAMPLE_TYPES`, `MEDIA_TYPES`, `PRIORITY_LABELS`, `ATMOS_LABELS` |
| `src/main.jsx` | React entry point |
| `PLAN/MEMORY.md` | Recurring error log |
| `ARCHITECTURE.md` | Full architecture reference |

> `src/components/`, `src/engine/`, `src/i18n/`, `src/styles/`, `src/data/foods.js`
> are **planned** structure — not yet extracted from App.jsx.

---

## Bacteria IDs

| ID | Latin name | Role |
|----|-----------|------|
| bif | Bifidobacterium spp. | good |
| lac | Lactobacillus spp. | good |
| akk | Akkermansia muciniphila | good |
| fae | Faecalibacterium prausnitzii | good |
| bac | Bacteroides fragilis | neutral |
| cdi | Clostridioides difficile | bad |
| eco | Escherichia coli O157 | bad |
| can | Candida albicans | bad |

Baseline is age-dependent (see `BASELINES_BY_AGE` in App.jsx).
Young adult reference: `{bif:65, lac:62, akk:52, fae:58, bac:50, cdi:10, eco:8, can:6}`

---

## Key Functions (all in App.jsx)

```js
calcNutrition(log)             // → {cal, prot, fat, carb, fib}
calcMicrobiome(log, baseline)  // → {bif, lac, akk, fae, bac, cdi, eco, can}
healthScore(mb)                // → 0–100 integer
scoreColor(score)              // → hex color string
scoreLabel(score, t)           // → translated label string
getBaselineByAge(age)          // → baseline object for given numeric age
```

---

## When Adding New Foods

Each food object must have ALL these fields:
```js
{ic, id, ru, en, cal, p, f, c, fib, pre, pro, boost:[], sup:[], sug}
```
- `pre` = prebiotic score 0–10
- `pro` = boolean (live cultures)
- `boost` = bacteria IDs that grow
- `sup` = bacteria IDs that are suppressed
- `sug` = `"simple"` | `"complex"` | `"none"`

---

## When Adding New Media (src/data/media.js)

Each medium object must have ALL these fields:
```js
{id, name, name_ru, manufacturer, type, sample_types,
 targets_ru, targets_en, incubation:{temp,hours_min,hours_max,atmosphere},
 colony_ru, colony_en, use_ru, use_en,
 resistance_markers:[], selectivity, priority}
```
- `article` is optional — catalogue number shown as badge
- Verify `id` is unique before adding
- After adding to `PROTOCOLS`, run: `PROTOCOLS.flatMap(p=>[...p.primary,...p.confirmatory,...p.resistance]).filter(id=>!MEDIA.find(m=>m.id===id))` — must return `[]`

---

## Design Rules

- **Light theme** — body background `#8fd8cc`, cards `linear-gradient(135deg,#d4f5ef,#c2f0e8)`
- Bioluminescent accents — teal glows on active elements
- Animations: `blobPulse` for good bacteria, `badPulse` for pathogens
- Text: primary `#1e293b`, secondary `#475569`, muted `#64748b`
- Cards: class `mv-card` — gradient bg + `border: 1px solid rgba(13,148,136,.3)`
- Buttons: `.mv-btn` base + `.mv-btn-primary` / `.mv-btn-ghost` / `.mv-btn-danger`
- Fonts: Space Mono (headings, numbers, monospace), DM Sans (body)
- Accent colors: teal `#0d9488`, cyan `#00d4ff`, purple `#a78bfa`, green `#34d399`, red `#f87171`, orange `#fb923c`

---

## Planned Features (next iterations)

- [x] Age profiles — child / teen / adult / senior baselines
- [x] Symptom mode — symptoms → food recommendations
- [x] MediaLab — culture media database with search + filters
- [x] Clinical seeding protocols (UTI / Sepsis / GI / Wound / Respiratory)
- [ ] User profile — name, age, diary history (localStorage)
- [ ] PDF export — daily report
- [ ] Extended food DB — 200+ items
- [ ] Online deploy — Vercel with custom domain

---

## Running Locally

```bash
cd "Work /microverse"
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## Important Notes for Claude

- Always preserve trilingual support (ru/en/Latin) when adding features
- The SVG viewBox is `480×285` — bacteria cx/cy positions must stay within these bounds
- `calcMicrobiome` must remain a pure function (no side effects)
- `calcMicrobiome` now takes `baseline` as second argument — always pass it
- When expanding the food database, verify that bacteria IDs in `boost[]` and `sup[]` match the 8 defined IDs
- Health score formula: `good_avg × 0.68 − bad_avg × 0.32 + 4` — do not change without discussion
- Translation keys must be added in both `T.ru` and `T.en` simultaneously
- After any JSX structural change, call `getDiagnostics` before proceeding
