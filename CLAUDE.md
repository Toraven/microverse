# CLAUDE.md — MicroVerse: Gut & Food Lab

This file tells Claude how to work with this project.

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
2. `calcMicrobiome(log)` recalculates 8 bacteria scores in real time
3. SVG visualization updates — bacteria "blobs" grow or shrink
4. Health score ring updates (0–100)
5. Recommendations tab shows what to add or reduce

---

## Code Conventions

- All components in `src/components/` organized by feature
- Core engine logic in `src/engine/microbiome.js` — pure functions only, no React
- Food database in `src/data/foods.js` — exported as `FOODS` array
- Bacteria definitions in `src/data/bacteria.js` — exported as `BACTERIA` array and `BASELINE` object
- Translations in `src/i18n/translations.js` — exported as `T` object with `T.ru` and `T.en`
- CSS variables defined in `src/styles/global.css`
- Color palette: `--color-teal: #64ffda`, `--color-cyan: #00d4ff`, `--color-purple: #a78bfa`, `--color-green: #34d399`, `--color-red: #f87171`, `--color-orange: #fb923c`, `--color-bg: #020c1b`
- Fonts: Space Mono (headings, numbers, monospace), DM Sans (body)

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

Baseline scores: `{bif:65, lac:62, akk:52, fae:58, bac:50, cdi:10, eco:8, can:6}`

---

## Key Functions (engine/microbiome.js)

```js
calcNutrition(log)      // → {cal, prot, fat, carb, fib}
calcMicrobiome(log)     // → {bif, lac, akk, fae, bac, cdi, eco, can}
healthScore(mb)         // → 0–100 integer
scoreColor(score)       // → hex color string
scoreLabel(score, t)    // → translated label string
```

---

## When Adding New Foods

Each food object must have ALL these fields:
```js
{ic, id, ru, en, cal, p, f, c, fib, pre, pro, boost:[], sup:[], sug}
```
- `pre` = prebiotic score 0–10 (how well it feeds beneficial bacteria)
- `pro` = boolean (contains live probiotic cultures)
- `boost` = array of bacteria IDs that grow when eating this food
- `sup` = array of bacteria IDs that are suppressed
- `sug` = "simple" | "complex" | "none"

---

## Design Rules

- Dark theme only (`#020c1b` background)
- Bioluminescent aesthetic — glow effects on active elements
- Animations: `blobPulse` for good bacteria, `badPulse` for pathogens
- Never use solid white text — use `#ccd6f6` (light blue-white)
- Cards: `background: rgba(10,22,40,.85)` + `border: 1px solid rgba(100,255,218,.1)`
- Buttons: `.mv-btn` base class + `.mv-btn-primary` / `.mv-btn-ghost` / `.mv-btn-danger`

---

## Planned Features (next iterations)

1. **Age profiles** — different baseline microbiome for child / teen / adult / senior
2. **User profile** — name, age, saved diary history (localStorage)
3. **PDF export** — generate daily report
4. **Extended food DB** — expand from 77 to 200+ items
5. **Online deploy** — Vercel with custom domain
6. **Symptom mode** — user describes symptoms → app suggests foods

---

## Running Locally

```bash
npm create vite@latest microverse -- --template react
cd microverse
npm install
# Copy App.jsx → src/App.jsx
npm run dev
# Opens at http://localhost:5173
```

---

## Important Notes for Claude

- Always preserve trilingual support (ru/en/Latin) when adding features
- The SVG viewBox is `480×285` — bacteria cx/cy positions must stay within these bounds
- `calcMicrobiome` must remain a pure function (no side effects)
- When expanding the food database, verify that bacteria IDs in `boost[]` and `sup[]` match the 8 defined IDs
- Health score formula: `good_avg × 0.68 − bad_avg × 0.32 + 4` — do not change without discussion
