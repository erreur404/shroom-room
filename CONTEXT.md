# Domain Context & Ubiquitous Language: Shroom Room

This document defines the core domain terminology and concepts for the `shroom-room` mushroom habitat and fruiting prediction system.

---

## Glossary of Ubiquitous Language

### Suitability Map
The **static, persistent spatial model** (0–100%) indicating where a given fungal species *can* establish mycelium and potentially grow. It is derived entirely from long-term, slow-changing environmental parameters:
- Soil pH (`phh2o`) and texture (clay/sand ratio)
- Proximity to host tree species (e.g. *Picea abies*, *Fagus sylvatica*, *Quercus robur*)
- Elevation, slope angle, and Topographic Wetness Index (TWI)

### Probability Map
The **dynamic, temporal model** (0–100%) indicating the live likelihood of active sporocarp (fruiting body) emergence on a specific date. The Probability Map is computed by evaluating real-time/historical 14-day meteorological trigger formulas (soil temperature drop, 10-day cumulative precipitation pulse, volumetric soil moisture) on top of the **Suitability Map** layer, provided the target date falls within the species' active **Growth Season**.

### Growth Season
The annual temporal window during which temperature and daylength conditions permit sporocarp emergence for a given species (e.g. June–October for *Cantharellus cibarius*, August–November for *Boletus edulis* in Western Europe). Outside of this window, the Probability Map score evaluates to 0%.

### Fruiting Trigger
The combination of weather events (typically a 5-10cm soil temperature drop below a species-specific threshold combined with >30mm of cumulative rain over 10 days) that signals mycelia to initiate primordia and form harvestable mushrooms.

---

## Geographic & Species Scope (MVP Phase)

- **Target Species**:
  1. *Boletus edulis* (King Bolete / Cèpe / Steinpilz)
  2. *Cantharellus cibarius* (Golden Chanterelle / Girolle / Pfifferling)
- **Initial Test Regions**:
  1. **Niedersachsen** (Lower Saxony, Germany)
  2. **Bretagne** (Brittany, France)
