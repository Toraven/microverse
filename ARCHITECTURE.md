# MicroVerse: Gut & Food Lab — Architecture

## Overview

Single-page React application. No backend required — all logic runs client-side.

```
microverse/
├── src/
│   ├── App.jsx              # Main app (currently monolithic, see split plan below)
│   ├── data/
│   │   ├── foods.js         # 77+ food items database
│   │   └── bacteria.js      # 8 bacteria definitions + baseline values
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   └── ParticleField.jsx
│   │   ├── calculator/
│   │   │   ├── CalculatorTab.jsx
│   │   │   ├── FoodSearch.jsx
│   │   │   ├── FoodLog.jsx
│   │   │   └── NutritionSummary.jsx
│   │   ├── diary/
│   │   │   └── DiaryTab.jsx
│   │   ├── recommendations/
│   │   │   └── RecommendationsTab.jsx
│   │   └── shared/
│   │       ├── MicrobiomeViz.jsx   # SVG animated bacteria
│   │       ├── HealthRing.jsx      # Score ring
│   │       ├── BacteriaPanel.jsx   # Bacteria list with bars
│   │       └── PrebioticRow.jsx
│   ├── engine/
│   │   └── microbiome.js    # Core calculation logic
│   ├── i18n/
│   │   └── translations.js  # RU / EN strings
│   └── styles/
│       └── global.css       # CSS variables, animations, utilities
├── public/
├── package.json
└── vite.config.js
```

---

## Core Engine — microbiome.js

### calcNutrition(log) → {cal, prot, fat, carb, fib}
Sums macros from food log weighted by amount (grams).

### calcMicrobiome(log) → {bif, lac, akk, fae, bac, cdi, eco, can}
Applies food effects to baseline bacteria scores (0–100):
- Each `food.boost[]` bacteria gets `(prebiotic × 1.6 + probiotic × 9 + fiber × 0.4) × scale`
- Each `food.sup[]` bacteria loses `(prebiotic × 1.3 + probiotic × 7) × scale`
- Simple sugars (>12g carbs) penalize good bacteria, boost pathogens
- High fiber (>5g, no sugar) gives bonus to bif/lac/fae

### healthScore(mb) → 0–100
`score = good_avg × 0.68 − bad_avg × 0.32 + 4`

---

## Data Schema

### Food item
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
  boost: ["bif","akk"],// bacteria it feeds
  sup: ["can"],        // bacteria it suppresses
  sug: "simple"        // "simple" | "complex" | "none"
}
```

### Bacteria item
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

---

## State Management

State lives in App.jsx and is passed down as props. No external state library needed at current scale.

| State | Location | Description |
|-------|----------|-------------|
| `lang` | App | "ru" or "en" |
| `tab` | App | 0=Calculator, 1=Diary, 2=Recommendations |
| `calcLog` | App → CalculatorTab | Array of {id, food, amount} |
| `meals` | DiaryTab (local) | {0:[], 1:[], 2:[], 3:[]} per meal slot |

---

## Planned Enhancements

- [ ] Age profile selector (child / teen / adult / senior)
- [ ] User profile persistence (localStorage)
- [ ] Export report as PDF
- [ ] Expand food DB to 200+ items
- [ ] Online deploy (Vercel / Netlify)
- [ ] Backend API for personalized recommendations
