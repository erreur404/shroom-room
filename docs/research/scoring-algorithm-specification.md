# Scoring Algorithm Specification: Suitability & Probability Pipelines

This specification defines the exact mathematical models, parameters, and pluggable architecture for computing the static **Suitability Map** and dynamic **Probability Map** across species in Shroom Room.

---

## 1. Pluggable Pipeline Architecture (ADR-0001)

Per [ADR-0001](file:///d:/William/Documents/git/shroom-room/docs/adr/0001-pluggable-scoring-pipeline.md), scoring models are decoupled into modular strategy pipelines:

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                      INPUT ENVIRONMENT                      │
 │   - Soil: pH (0-14), clay (%), sand (%), soc (dg/kg)        │
 │   - Trees: forest_genus (0-7), distance_to_host_meters (m)   │
 │   - Weather: rain_14d (mm), soil_temp_curr (°C), delta_T (°C)│
 └──────────────────────────────┬──────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│     SUITABILITY PIPELINE      │       │     PROBABILITY PIPELINE      │
│  (Static Habitat Potential)   │       │   (Live Fruiting Trigger)     │
│                               │       │                               │
│ - BoletusEdulisSuitability    │       │ - RainOnlyTrigger (Summer)    │
│ - CantharellusSuitability     │       │ - RainColdShockTrigger(Autumn)│
└───────────────┬───────────────┘       └───────────────┬───────────────┘
                │                                       │
                ▼                                       ▼
        Suitability Score S(x, y)               Weather Multiplier M(t)
                │                                       │
                └───────────────────┬───────────────────┘
                                    ▼
                        ┌───────────────────────┐
                        │   FINAL PROBABILITY   │
                        │  P = S * Season * M   │
                        └───────────────────────┘
```

---

## 2. Static Suitability Pipelines (`ISuitabilityPipeline`)

### Core Formula
```text
S(x, y) = M_host * ( w_pH * f_pH(pH) + w_texture * f_texture(clay, sand) + w_topo * f_topo(elevation, aspect) )
```

### Parameters & Species Pipelines

| Parameter | *Boletus edulis* Pipeline | *Cantharellus cibarius* Pipeline |
|---|---|---|
| **Host Tree Classes** | `1` (Spruce), `2` (Pine), `3` (Beech), `4` (Oak) | `2` (Pine), `3` (Beech), `4` (Oak) |
| **Host Proximity Gate (`M_host`)** | `1.0` if distance $\le 20\text{m}$, else `0.0` | `1.0` if distance $\le 20\text{m}$, else `0.0` |
| **Optimal pH Center (`mu_pH`)** | `5.5` | `4.6` |
| **pH Tolerance Width (`sigma_pH`)**| `0.7` (acceptable: 4.8 – 6.2) | `0.5` (acceptable: 4.0 – 5.2) |
| **Weight: pH (`w_pH`)** | `0.70` | `0.70` |
| **Weight: Texture (`w_texture`)**| `0.15` (prefers well-drained sand/loam) | `0.15` (prefers siliceous/acid litter) |
| **Weight: Topo (`w_topo`)** | `0.15` (bonus for North/NE facing slopes)| `0.15` (bonus for moist valleys/slopes) |

---

## 3. Dynamic Probability Pipelines (`IProbabilityPipeline`)

Because different fungal guilds trigger on different meteorological phenomena, probability calculations are separated into dedicated strategies:

### Strategy A: `RainColdShockTriggerPipeline` (Autumn / Bolete Guild)
Used for autumn flushes (*Boletus edulis*) where fruiting is stimulated by significant rain pulses combined with an autumn soil temperature drop (cold shock):

```text
R_14     = sum of daily precipitation_sum over past 14 days (mm)
T_soil   = current 0-10cm mean soil temperature (°C)
T_prev   = mean 0-10cm soil temperature from 7 to 14 days ago (°C)
delta_T  = max(0.0, T_prev - T_soil)  # thermal drop

# 1. Rain Pulse Index (0.0 to 1.0)
I_rain = clamp( (R_14 - 15.0) / 35.0, 0.0, 1.0 )

# 2. Temperature & Cold Shock Index (0.0 to 1.0)
thermal_bell = exp( - (T_soil - 13.5)^2 / (2 * 3.5^2) )
shock_bonus  = 0.60 + 0.40 * clamp( delta_T / 3.0, 0.0, 1.0 )
I_temp       = thermal_bell * shock_bonus

# 3. Weather Multiplier
M_weather = (I_rain ^ 0.60) * (I_temp ^ 0.40)
```

### Strategy B: `RainPulseTriggerPipeline` (Summer / Chanterelle Guild)
Used for summer/early-autumn species (*Cantharellus cibarius*) that fruit throughout warm weather given sufficient sustained precipitation, without requiring an autumn cold shock:

```text
R_14   = sum of daily precipitation_sum over past 14 days (mm)
T_soil = current 0-10cm mean soil temperature (°C)

# 1. Rain Pulse Index (0.0 to 1.0)
I_rain = clamp( (R_14 - 12.0) / 30.0, 0.0, 1.0 )

# 2. Summer Temperature Window (0.0 to 1.0, optimal 14°C - 22°C)
I_temp = exp( - (T_soil - 17.5)^2 / (2 * 4.0^2) )

# 3. Weather Multiplier (Rain-dominated)
M_weather = (I_rain ^ 0.75) * (I_temp ^ 0.25)
```

---

## 4. Final Probability Composition

For any species at coordinates $(x, y)$ on date $t$:

```text
SeasonActive = 1.0 if date in species active window, else 0.0:
  - Boletus edulis: Aug 15 to Nov 15
  - Cantharellus cibarius: Jun 15 to Oct 31

P(x, y, t) = S(x, y) * SeasonActive * M_weather * 100%
```

---

## 5. TypeScript Pipeline Interface Implementation

```typescript
export interface EnvironmentalInputs {
  soilPH: number;
  clayPct: number;
  sandPct: number;
  hostTreeGenus: number; // 1: Picea, 2: Pinus, 3: Fagus, 4: Quercus
  distToHostMeters: number;
  rain14DaysMm: number;
  currentSoilTempC: number;
  pastWeekSoilTempC: number;
  elevationMeters: number;
  aspectDegrees: number;
}

export interface ISuitabilityPipeline {
  name: string;
  computeSuitability(env: EnvironmentalInputs): number; // Returns 0.0 - 1.0
}

export interface IProbabilityPipeline {
  name: string;
  computeWeatherMultiplier(env: EnvironmentalInputs): number; // Returns 0.0 - 1.0
}

// Concrete Implementations
export class BoletusSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'boletus-edulis-suitability-v1';
  computeSuitability(env: EnvironmentalInputs): number {
    if (env.distToHostMeters > 20 || ![1, 2, 3, 4].includes(env.hostTreeGenus)) {
      return 0.0;
    }
    const fPH = Math.exp(-Math.pow(env.soilPH - 5.5, 2) / (2 * 0.49));
    const fTexture = (env.clayPct <= 35 && env.sandPct >= 20) ? 1.0 : 0.5;
    const fTopo = 1.0;
    return 0.70 * fPH + 0.15 * fTexture + 0.15 * fTopo;
  }
}

export class CantharellusSuitabilityPipeline implements ISuitabilityPipeline {
  name = 'cantharellus-cibarius-suitability-v1';
  computeSuitability(env: EnvironmentalInputs): number {
    if (env.distToHostMeters > 20 || ![2, 3, 4].includes(env.hostTreeGenus)) {
      return 0.0;
    }
    const fPH = Math.exp(-Math.pow(env.soilPH - 4.6, 2) / (2 * 0.25));
    const fTexture = (env.clayPct <= 30) ? 1.0 : 0.6;
    const fTopo = 1.0;
    return 0.70 * fPH + 0.15 * fTexture + 0.15 * fTopo;
  }
}
```
