# 🍄 Guide: Adding a New Mushroom Species to Shroom Room

This comprehensive guide documents the exact methodology, AI prompts, data sources, required parameters, and code locations needed to add a new mushroom species to **Shroom Room**, either **manually** or **via an AI coding assistant**.

---

## 📑 Table of Contents

1. [Architecture Overview & Modeling Philosophy](#1-architecture-overview--modeling-philosophy)
2. [AI Prompts for Species Research & Code Generation](#2-ai-prompts-for-species-research--code-generation)
3. [Authoritative Data Sources](#3-authoritative-data-sources)
4. [Required Species Data Schema](#4-required-species-data-schema)
5. [Code Places: Step-by-Step File Checklist](#5-code-places-step-by-step-file-checklist)
6. [Concrete Walkthrough Example: Adding *Morchella esculenta*](#6-concrete-walkthrough-example-adding-morchella-esculenta)
7. [Verification, Testing & Deployment](#7-verification-testing--deployment)

---

## 1. Architecture Overview & Modeling Philosophy

Shroom Room evaluates mushroom habitat and fruiting likelihood through a decoupled **two-tier spatial model**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SHROOM ROOM SCORING                             │
│                                                                        │
│   [ Static Habitat Suitability ]      [ Dynamic Weather Trigger ]       │
│        (0.0 to 1.0 / 0–100%)              (0.0 to 1.0 / 0–100%)        │
│   • Soil pH (Gaussian bell curve)    • 14-day cumulative rainfall      │
│   • Host tree genus & root gate      • Topsoil (0–10cm) temperature    │
│   • Soil texture (clay / sand)       • Cold-shock thermal drop         │
│   • Organic carbon / humus (SOC)                                       │
│                 \                            /                         │
│                  \                          /                          │
│                   ▼                        ▼                           │
│        [ Active Season Gate ]  (0 outside season window, 1 inside)     │
│                                │                                       │
│                                ▼                                       │
│             [ Overall Fruiting Probability: 0–100% ]                   │
│                                                                        │
│   [ Field Safety & Diagnostic Keys ]  [ Offline GPX 1.1 Export ]       │
│   • Positive 4-point ID checklist     • Embedded waypoint field guide  │
│   • Toxic lookalike warnings          • Regional poison hotlines       │
└────────────────────────────────────────────────────────────────────────┘
```

### Zero-Disruption Backward Compatibility
- **Pre-baked Tiles**: Existing baked JSON tiles without the new species are evaluated **on the fly** and memoized in memory by `MapHarness.ts`. No re-baking of existing regions is strictly required to view new species.
- **New Tile Bakes**: Server-side tile baker (`server/bakeWorker.ts`) evaluates all registered species pipelines during tile ingestion and persists them to disk.
- **Dynamic UI**: The navigation bar, species modal, and dropdown automatically discover, localize, and sort all registered species according to **proximity to their seasonal peak**.

---

## 2. AI Prompts for Species Research & Code Generation

When using an AI assistant (such as Antigravity or Claude Code) to add new species, execute the following prompt sequences:

### Prompt 1: Candidate Selection & Ranking
Use this prompt to find high-value candidate species tailored to your target geographic scope:

```text
Act as an expert European mycologist and geospatial modeling engineer.
I want to expand the species list in Shroom Room.
Suggest the top European wild mushroom species to add next, strictly sorted by:
1. Culinary edibility (choice / gourmet)
2. Abundance across European forests (Germany, France, Italy, Central Europe)
3. Ease and safety of field identification (minimal to zero lethal lookalike risk)

For each candidate, output:
- Binomial Latin name and common names in EN, FR, DE
- Ecological guild (Ectomycorrhizal, Saprotrophic, or Lignicolous)
- Primary host tree symbionts or substrate
- Optimal soil pH range and texture
- Active fruiting season window (start/end dates)
- The #1 foolproof diagnostic feature that separates it from toxic lookalikes
```

### Prompt 2: Ecological & Phenological Parameter Extraction
Use this prompt once a species is chosen to extract the exact mathematical variables needed by the scoring engine:

```text
Provide the exact biological and environmental parameters for [Species Latin Name] to implement a suitability and fruiting trigger pipeline:

1. Host Tree Associations:
   Map to tree genus IDs: 0: Larix, 1: Picea, 2: Pinus, 3: Fagus, 4: Quercus, 5: Other Conifer, 6: Other Broadleaf, 7: None.
   Specify if ECM root zone distance gate applies (e.g. <= 20m) or trunk distance (<= 15m).

2. Soil Chemistry (ISRIC SoilGrids properties):
   - Optimal soil pH in H2O: center value (mean) and tolerance (standard deviation sigma) for a Gaussian curve.
   - Soil texture constraints: max clay percentage, min sand percentage.
   - Soil Organic Carbon (SOC in dg/kg) threshold if saprotrophic.

3. Phenology & Growth Season:
   - Exact calendar dates (startMonth, startDay, endMonth, endDay) in Western/Central Europe.
   - Proximity midpoint formula.

4. Meteorological Trigger:
   - Required 14-day cumulative rainfall threshold (mm).
   - Soil temperature optimum (°C) and tolerance (sigma).
   - Does it require a cold-shock drop (past week temp - current temp)?

5. Field Identification & Safety Guide:
   - 4-point diagnostic key: Cap, Underside (gills/tubes/folds/teeth), Stem, Flesh (odor/staining).
   - Dangerous/toxic lookalikes with specific differentiating signs.
   - Foolproof rule of thumb for beginners.
```

### Prompt 3: Autonomous Implementation Prompt
Provide this prompt directly to an agent working in this repository:

```text
Please add [Species Latin Name] (ID: '[species_id]') to the Shroom Room codebase:

1. Add '[species_id]' to SpeciesId union in src/types/index.ts.
2. Add Latin, French, English, and German translations (common + short) to SPECIES_I18N in src/i18n/translations.ts.
3. Add full metadata entry to SPECIES_DETAILS in src/services/habitatDataService.ts (guild, symbionts, optimalPH, seasonWindow, badgeColor).
4. Register the species fruiting window in src/scoring/season.ts (SPECIES_SEASONS and isSeasonActive).
5. Implement [SpeciesName]SuitabilityPipeline and assign an appropriate weather trigger in src/scoring/pipelines.ts, registering both in ScoringEngine. If the triggers of this species are not available in the current implementation, explain the issue and *ask* if you should create it. Then register them in ScoringEngine.
6. Add field identification keys, toxic lookalikes, and rule of thumb to FIELD_GUIDE_DATA in src/services/fieldGuideService.ts (with fr, en, de, ja translations). Both main.ts (web UI modal) and gpxService.ts (offline GPX export) automatically consume this service.
7. Add the suitability field to server/tileConfig.ts (BakedCell and fused1000m), server/bakeWorker.ts, and server/tileStore.ts.
8. Document the species in docs/research/field-identification-toxic-lookalikes.md.
9. Verify with `npm.cmd run build` and run an automated evaluation test.
```

---

## 3. Authoritative Data Sources

The scoring pipelines and tile baker rely on four primary open data sources:

| Layer | Primary Source | Protocol / Endpoint | Spatial Resolution | Used In Pipeline |
|---|---|---|---|---|
| **Host Trees** | **GBIF Occurrence API** & **ForestPaths 10m** | REST API (`api.gbif.org/v1/occurrence/search`) + High-res Sentinel-2 tree genus classification | 10m – 250m | Evaluates host tree presence (`Picea`, `Pinus`, `Fagus`, `Quercus`, `Larix`) and root distance |
| **Forest Boundaries** | **OpenStreetMap Overpass API** | Overpass QL query (`interpreter`) | Vector polygons | Forest landcover gating (`landuse=forest`, `natural=wood`) & distance to forest edge |
| **Soil Chemistry** | **ISRIC SoilGrids v2.0** | REST OGC WCS API (`rest.isric.org/soilgrids/v2.0/properties/query`) | 250m native | Topsoil pH (`phh2o`), sand/clay fractions (`sand`, `clay`), and soil organic carbon (`soc`) |
| **Weather & Climate** | **Open-Meteo Historical & Forecast API** | REST API (`archive-api.open-meteo.com` / `api.open-meteo.com`) | Point / 10km grid | 14-day cumulative rainfall sum, 0–10cm soil temperature, and 7-day thermal shock delta |
| **Field Safety & Mycology** | **DGfM**, **SMF**, **Scientific Mycological Literature** | Cited research notes in `docs/research/` | Field level | Macroscopic identification checklists, toxic lookalike risks, and poison control info |

---

## 4. Required Species Data Schema

Every species added to Shroom Room requires the following data fields:

### A. Identity & Localization
- **`speciesId`**: Unique alphanumeric slug (e.g. `'hydnum'`, `'craterellus_cornucopioides'`, `'morchella_esculenta'`).
- **`latin`**: Binomial scientific name (e.g. `Hydnum repandum`).
- **`common`**: Multilingual full common names (`fr`, `en`, `de`).
- **`short`**: Short 1–2 word names for mobile header buttons and badges (`fr`, `en`, `de`).
- **`badgeColor`**: Distinctive hex color code for map markers and UI cards (e.g. `#d97706`).

### B. Ecological Habitat Parameters (Static Suitability)
- **Host Tree Genera**: Numeric IDs accepted:
  - `0`: *Larix* (Larch)
  - `1`: *Picea* (Spruce)
  - `2`: *Pinus* (Pine)
  - `3`: *Fagus* (Beech)
  - `4`: *Quercus* (Oak)
  - `5`: Other Conifers / Needleleaf
  - `6`: Other Broadleaf / Hardwoods
  - `7`: Non-forest / None
- **Root Zone Distance Threshold**: Proximity gate in meters (typically `20` meters for mycorrhizal roots; `15` meters for wood brackets).
- **Soil pH Response Curve**: Gaussian function parameters:
  $$\text{Score}_{\text{pH}} = \exp\left( -\frac{(\text{pH} - \mu)^2}{2\sigma^2} \right)$$
  - $\mu$: Center optimal pH (e.g. `5.5`)
  - $\sigma$: Tolerance spread (e.g. `0.7`)
- **Soil Texture Tolerance**: Clay maximum (e.g. $\le 35\%$) and sand minimum (e.g. $\ge 20\%$).
- **Organic Carbon (SOC)**: Minimum humus threshold in dg/kg (for saprotrophs).

### C. Phenology & Fruiting Triggers (Dynamic Probability)
- **Season Window**: Start month/day and End month/day.
- **Weather Trigger Pipeline**:
  - `RainColdShockTriggerPipeline`: Requires rain pulse + sudden soil temp drop (e.g. Boletes, Black Trumpet).
  - `RainPulseTriggerPipeline`: Moderate warm rain without cold shock (e.g. Golden Chanterelle).
  - `WinterChanterelleWeatherTriggerPipeline`: Cold-hardy down to near-freezing (e.g. Yellowfoot).
  - `WarmSeasonWoodTriggerPipeline`: High thermal threshold for wood decay (e.g. Chicken of the Woods).
  - `ParasolWeatherTriggerPipeline`: Warm-to-mild meadow and clearing flush (e.g. Parasol).

### D. Safety Guardrails & Diagnostic Keys
- **4-Point Diagnostic Checklist**:
  1. Cap (color, shape, surface texture, margin)
  2. Underside / Hymenophore (gills vs pores vs ridges/folds vs spines/teeth)
  3. Stem / Stipe (netting, ring, snakeskin pattern, hollow vs solid)
  4. Flesh (smell, taste, bruising color reaction)
- **Toxic Lookalike Warnings**: Explicit list of toxic or inedible species that share similarities, with the specific features that distinguish them.
- **Foolproof Rule of Thumb**: One simple rule that guarantees safe foraging.

---

## 5. Code Places: Step-by-Step File Checklist

Follow this exact order when modifying the codebase:

### 1. `src/types/index.ts`
Add the new species ID to the `SpeciesId` union:
```typescript
export type SpeciesId =
  | 'boletus'
  | 'cantharellus'
  | 'hydnum'
  // ...
  | 'your_species_id';
```

### 2. `src/i18n/translations.ts`
Add multilingual entries to `SPECIES_I18N`:
```typescript
export const SPECIES_I18N: Record<SpeciesId, SpeciesNameEntry> = {
  // ...
  your_species_id: {
    latin: 'Scientific name',
    common: {
      fr: 'Nom commun en français',
      en: 'Common English name',
      de: 'Deutscher Name'
    },
    short: {
      fr: 'Nom court',
      en: 'Short name',
      de: 'Kurzname'
    }
  }
};
```

### 3. `src/services/habitatDataService.ts`
Add the habitat and ecological record to `SPECIES_DETAILS`:
```typescript
export const SPECIES_DETAILS: Record<SpeciesId, { ... }> = {
  // ...
  your_species_id: {
    name: 'Scientific name',
    commonName: 'English / French / German common names',
    guild: 'Ectomycorrhizal (ECM) | Saprotrophic | Lignicolous',
    symbionts: ['Host tree 1', 'Host tree 2'],
    optimalPH: 'pH X.X – Y.Y (Description)',
    seasonWindow: 'Month Day – Month Day (Season details)',
    badgeColor: '#hexcolor'
  }
};
```

### 4. `src/scoring/season.ts`
1. Add the calendar dates to `SPECIES_SEASONS`:
```typescript
export const SPECIES_SEASONS: Record<SpeciesId, SpeciesSeasonWindow> = {
  // ...
  your_species_id: { startMonth: 8, startDay: 15, endMonth: 11, endDay: 15 }
};
```
2. Add a `case` in `isSeasonActive()`:
```typescript
case 'your_species_id':
  return (month === 8 && day >= 15) || month === 9 || month === 10 || (month === 11 && day <= 15);
```

### 5. `src/scoring/pipelines.ts`
1. Implement the concrete suitability pipeline class:
```typescript
export class YourSpeciesSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'your-species-suitability-v1';
  speciesId: SpeciesId = 'your_species_id';

  computeSuitability(env: EnvironmentalInputs) {
    const isHostTree = [/* genus IDs */].includes(env.hostTreeGenus);
    const hostTreeScore = (isHostTree && env.distToHostMeters <= 20) ? 1.0 : 0.0;
    if (hostTreeScore === 0.0) return { suitabilityScore: 0.0, pHScore: 0.0, hostTreeScore: 0.0 };

    const pHScore = Math.exp(-Math.pow(env.soilPH - OPTIMAL_PH, 2) / (2 * SIGMA_SQUARED));
    const textureScore = (env.clayPct <= 35 && env.sandPct >= 20) ? 1.0 : 0.6;
    const suitabilityScore = hostTreeScore * (0.70 * pHScore + 0.15 * textureScore + 0.15 * 1.0);

    return {
      suitabilityScore: Math.min(1.0, Math.max(0.0, suitabilityScore)),
      pHScore,
      hostTreeScore
    };
  }
}
```
2. Register the suitability pipeline and weather trigger in `ScoringEngine`:
```typescript
constructor() {
  // ...
  this.suitabilityPipelines.set('your_species_id', new YourSpeciesSuitabilityPipeline());
  this.probabilityPipelines.set('your_species_id', new RainColdShockTriggerPipeline()); // or custom
}
```

### 6. `src/services/fieldGuideService.ts`
Add the species identification checklist, toxic lookalike warnings, and fail-safe rule of thumb to `FIELD_GUIDE_DATA` with translations (`fr`, `en`, `de`, `ja`):
```typescript
export const FIELD_GUIDE_DATA: Record<SpeciesId, SpeciesFieldGuideContent> = {
  // ...
  your_species_id: {
    idKeys: {
      fr: ['Chapeau : ...', 'Sous le chapeau : ...', 'Pied : ...', 'Chair : ...'],
      en: ['Cap: ...', 'Underside: ...', 'Stem: ...', 'Flesh: ...'],
      de: ['Hut: ...', 'Hutunterseite: ...', 'Stiel: ...', 'Fleisch: ...'],
      ja: ['傘：...', '傘の裏面：...', '柄：...', '肉：...']
    },
    lookalikes: {
      fr: ['❌ Sosie toxique : ...'],
      en: ['❌ Toxic lookalike: ...'],
      de: ['❌ Giftiger Doppelgänger: ...'],
      ja: ['❌ 類似する毒キノコ：...']
    },
    ruleOfThumb: {
      fr: 'RÈGLE D’OR : ...',
      en: 'RULE OF THUMB: ...',
      de: 'FAUSTREGEL: ...',
      ja: '安全の鉄則：...'
    }
  }
};
```
> **Single Source of Truth**: Both `src/main.ts` (web UI modal) and `src/services/gpxService.ts` (offline GPX trail export) automatically consume this service. The text is generated once using i18n and converted into clean plain text for GPX tags, ensuring speakers of any language (including Japanese) receive their localized field guide in GPX and web alike.

### 7. `server/tileConfig.ts`
Add the optional suitability score property to `BakedCell` and `fused1000m.cells`:
```typescript
export interface BakedCell {
  // ...
  your_species_idSuitability?: number; // 0..100
}
```

### 8. `server/bakeWorker.ts`
In `BakeWorker.processTile()` (Step 4 cell evaluation loop):
1. Evaluate score:
```typescript
const yourSpeciesScore = this.scoringEngine.evaluate('your_species_id', envInputs);
```
2. Append to cell object:
```typescript
cells.push({
  // ...
  your_species_idSuitability: Math.round(yourSpeciesScore.suitabilityScore * 100),
});
```

### 9. `server/tileStore.ts`
In `TileStore.createFused1000m()`:
```typescript
const avgYourSpecies = calcAvg('your_species_idSuitability');
fusedCells.push({
  // ...
  ...(avgYourSpecies !== undefined ? { your_species_idSuitability: avgYourSpecies } : {})
});
```

### 10. `docs/research/field-identification-toxic-lookalikes.md`
Add a dedicated section documenting the morphology, key identifying traits, toxic lookalikes, and culinary notes.

---

## 6. Concrete Walkthrough Example: Adding *Morchella esculenta*

Below is a complete specification for adding **Morels** (*Morchella esculenta* / Common Morel / Morille / Speise-Morchel):

### Step 1: Types (`src/types/index.ts`)
```typescript
export type SpeciesId =
  // ...
  | 'morchella_esculenta';
```

### Step 2: Translations (`src/i18n/translations.ts`)
```typescript
morchella_esculenta: {
  latin: 'Morchella esculenta',
  common: {
    fr: 'Morille commune',
    en: 'Common Morel',
    de: 'Speise-Morchel'
  },
  short: {
    fr: 'Morille',
    en: 'Morel',
    de: 'Morchel'
  }
}
```

### Step 3: Metadata (`src/services/habitatDataService.ts`)
```typescript
morchella_esculenta: {
  name: 'Morchella esculenta',
  commonName: 'Common Morel / Morille / Speise-Morchel',
  guild: 'Saprotrophic / Facultative Mycorrhizal',
  symbionts: ['Ash (Fraxinus)', 'Elm (Ulmus)', 'Apple (Malus)', 'Old Orchards', 'Riverbanks'],
  optimalPH: 'pH 6.5 – 7.8 (Calcareous & alkaline alluvial soils)',
  seasonWindow: 'April 1 – May 31 (Spring Flush)',
  badgeColor: '#ca8a04'
}
```

### Step 4: Season Phenology (`src/scoring/season.ts`)
```typescript
// in SPECIES_SEASONS
morchella_esculenta: { startMonth: 4, startDay: 1, endMonth: 5, endDay: 31 }

// in isSeasonActive()
case 'morchella_esculenta':
  return month === 4 || month === 5;
```

### Step 5: Scoring Pipeline (`src/scoring/pipelines.ts`)
```typescript
export class MorchellaSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'morchella-esculenta-suitability-v1';
  speciesId: SpeciesId = 'morchella_esculenta';

  computeSuitability(env: EnvironmentalInputs) {
    // Favors broadleaf deciduous, river floodplains, and ash/elm (genera 6 & 4)
    const isBroadleaf = [4, 6].includes(env.hostTreeGenus);
    const treeScore = isBroadleaf ? 1.0 : 0.6;

    // Alkaline to neutral soil (center 7.1, sigma 0.6)
    const pHScore = Math.exp(-Math.pow(env.soilPH - 7.1, 2) / (2 * 0.36));

    // Prefers rich organic soil
    const socScore = env.socDgKg >= 200 ? 1.0 : 0.7;

    const suitabilityScore = treeScore * (0.65 * pHScore + 0.20 * socScore + 0.15 * 1.0);
    return {
      suitabilityScore: Math.min(1.0, Math.max(0.0, suitabilityScore)),
      pHScore,
      hostTreeScore: treeScore
    };
  }
}

// In ScoringEngine constructor:
this.suitabilityPipelines.set('morchella_esculenta', new MorchellaSuitabilityPipeline());
this.probabilityPipelines.set('morchella_esculenta', new RainPulseTriggerPipeline());
```

### Step 6: Diagnostic & Safety Rules (`src/services/fieldGuideService.ts`)
Add entry to `FIELD_GUIDE_DATA` in `src/services/fieldGuideService.ts`:
```typescript
morchella_esculenta: {
  idKeys: {
    fr: [
      'Chapeau : Alvéoles creuses et côtes régulières rappelant un nid d’abeilles, base soudée au pied.',
      'Intérieur : ENTIÈREMENT CREUSE d’un seul tenant du chapeau jusqu’au bas du pied (cavité unique).'
    ],
    en: [
      'Cap: Honeycomb-like pits and ridges, margins completely fused to the stem.',
      'Interior: Single continuous HOLLOW CHAMBER from cap tip to stem base.'
    ],
    de: [
      'Hut: Bienenwabenartig gefeldert mit Rippen und Gruben, Hutrand mit Stiel verwachsen.',
      'Innen: Ein einziger DURCHGEHEND HOHLER Hohlraum von der Spitze bis zur Stielbasis.'
    ],
    ja: [
      '傘：蜂の巣状（ハニカム状）の網目とくぼみがあり、傘の縁は柄に完全に癒合する。',
      '内部：傘の頂点から柄の根元まで、仕切りのない完全な「単一の中空の空洞」になっている。'
    ]
  },
  lookalikes: {
    fr: [
      '❌ Gyromitra esculenta (Fausse morille) - MORTELLE : Chapeau plissé et cérébriforme (en forme de cerveau), intérieur cloisonné ou farci de ouate (NON creux).'
    ],
    en: [
      '❌ Gyromitra esculenta (False Morel) - DEADLY: Brain-like convoluted folds (not honeycomb), interior chambered or cottony-filled (NOT hollow).'
    ],
    de: [
      '❌ Gyromitra esculenta (Frühjahrslorchel) - TÖDLICH GIFTIG: Hirnartig gewundener Hut, innen gekammert oder wattig gefüllt (NICHT hohl).'
    ],
    ja: [
      '❌ シャグマアミガサタケ (Gyromitra esculenta) - 猛毒（死亡例多数）：脳胞状のしわ（網目ではない）、内部は多数の部屋に分かれスポンジ状（完全な中空ではない）。'
    ]
  },
  ruleOfThumb: {
    fr: 'RÈGLE D’OR : Si le champignon n’est pas creux d’un seul tenant en le coupant en deux, NE LE MANGEZ PAS.',
    en: 'RULE OF THUMB: If the cap and stem are not one single continuous hollow cavity, NEVER EAT IT.',
    de: 'FAUSTREGEL: Wenn der Pilz beim Längsschnitt nicht durchgehend hohl ist, KEINESFALLS ESSEN.',
    ja: '安全の鉄則：縦に切って頭から柄までスッキリとした単一の中空空洞でなければ絶対に口にしないでください。'
  }
}
```
*(Both `src/main.ts` and `src/services/gpxService.ts` automatically render and export this data without further changes).*

---

## 7. Verification, Testing & Deployment

Always complete these validation checks before committing:

### 1. Compile Client & Server
Execute the build command:
```powershell
npm.cmd run build
```
Confirm that:
- `vite build` completes with zero TypeScript errors.
- `esbuild` bundles `dist/index.js` cleanly.

### 2. Automated Evaluation Test
Run a quick tsx verification script to assert the scoring engine and phenology:
```powershell
npx.cmd tsx -e "
import { ScoringEngine } from './src/scoring/pipelines';
const engine = new ScoringEngine();
console.log('Season Active (May 1):', engine.isSeasonActive('morchella_esculenta', '2026-05-01'));
console.log('Season Active (Aug 1):', engine.isSeasonActive('morchella_esculenta', '2026-08-01'));
"
```

### 3. Interactive UI Verification
Start the development server:
```powershell
npm.cmd run dev
```
1. Open `http://localhost:5173`.
2. Verify the species appears in:
   - The desktop `#species-select` dropdown.
   - The mobile `🍄` Species Selector modal.
   - The Field Guide modal (`📖`).
3. Toggle the date picker to the species' active season and confirm the status pill turns green (`🟢 Peak Season` or `🟢 In Season`).
4. Click on a forest tile and verify the suitability and probability scores calculate properly.

### 4. Production Deployment to DietPi Server
Deploy to your production environment:
```bash
./deploy.sh
```
The server will build frontend assets, bundle the production server, SCP the build to the Raspberry Pi / server, and restart the PM2 service.
