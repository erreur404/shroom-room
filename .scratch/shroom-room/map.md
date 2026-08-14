# Wayfinder Map: Shroom Room

## Destination

Build an interactive web map application allowing users to select an edible mushroom species (*Boletus edulis*, *Cantharellus cibarius*) and view a static **Suitability Map** (based on soil pH, host trees, and elevation) overlaid with a live **Probability Map** (computed dynamically from 14-day rainfall and soil temperature trigger data when in-season), tested initially in **Niedersachsen** (DE) and **Bretagne** (FR).

## Notes

- **Domain Glossary**: Read `CONTEXT.md` before resolving any ticket.
- **Primary Research Sources**:
  - `docs/research/mushroom-growth-parameters.md` (Ecological parameters & triggers)
  - `docs/research/open-datasets-mushroom-habitat.md` (GBIF, SoilGrids, Open-Meteo, Copernicus APIs)
  - `docs/research/host-tree-pipeline-niedersachsen-bretagne.md` (Host tree extraction pipeline for DE/FR)
  - `docs/research/soilgrids-pipeline-niedersachsen-bretagne.md` (SoilGrids ingestion & tiling pipeline for DE/FR)
  - `docs/research/open-meteo-weather-pipeline.md` (Open-Meteo weather querying & fruiting triggers)
  - `docs/research/scoring-algorithm-specification.md` (Suitability & Probability scoring specification)
  - `docs/research/interactive-map-ui-specification.md` (Frontend map UI, trail basemaps & GPX export)
  - `docs/research/field-identification-toxic-lookalikes.md` (Field identification keys, toxic lookalikes & GPX safety metadata)
- **Target Test Regions**: Niedersachsen (Germany), Bretagne (France)
- **Target Species**: *Boletus edulis*, *Cantharellus cibarius*

## Decisions so far

- [Initial Habitat Parameter Research](file:///d:/William/Documents/git/shroom-room/docs/research/mushroom-growth-parameters.md) — Identified key abiotic (soil pH, temp drop, rain pulse) and biotic (host trees) drivers for European edible species.
- [Dataset Selection & Hybrid Architecture](file:///d:/William/Documents/git/shroom-room/docs/research/open-datasets-mushroom-habitat.md) — Selected SoilGrids v2.0 (soil), Copernicus HRL Forest Type + EU-Forest (trees), EU-DEM (elevation), Open-Meteo (live/historical weather), GBIF (occurrences). Recommended hybrid static vector tiles + dynamic weather overlay architecture.
- [Host Tree Extraction Pipeline for Niedersachsen & Bretagne](file:///d:/William/Documents/git/shroom-room/.scratch/shroom-room/issues/01-host-tree-dataset-pipeline.md) — Selected ForestPaths 10m tree genus dataset on Zenodo (13341104); defined tile selection, host tree classification for Boletus and Cantharellus, 20m proximity dilation, and Python/GDAL COG pipeline.
- [SoilGrids Ingestion & Tiling Strategy for Test Regions](file:///d:/William/Documents/git/shroom-room/.scratch/shroom-room/issues/02-soilgrids-ingestion-tiling.md) — Defined ISRIC WebDAV VRT `/vsicurl/` streaming pipeline for `phh2o` ($\div 10$), `clay`, `sand`, `soc`, reprojecting to EPSG:3035 and clipping to Niedersachsen & Bretagne for Suitability Map tiling.
- [Open-Meteo Weather Querying & Fruiting Trigger Scoring](file:///d:/William/Documents/git/shroom-room/.scratch/shroom-room/issues/03-open-meteo-weather-integration.md) — Defined multi-coordinate viewport sampling ($8\times 8$ to $12\times 12$ grid), 14-day rainfall and cold-shock trigger math, and client-side IDW canvas overlay rendering.
- [Suitability & Probability Algorithm Scoring Specification](file:///d:/William/Documents/git/shroom-room/.scratch/shroom-room/issues/04-suitability-probability-algorithm-spec.md) — Defined pluggable architecture (`ISuitabilityPipeline`, `IProbabilityPipeline`), with per-species suitability models and two probability strategies (`RainColdShockTriggerPipeline` for Porcini, `RainPulseTriggerPipeline` for Chanterelles).
- [Interactive Map UI & Layer Switcher Harness](file:///d:/William/Documents/git/shroom-room/.scratch/shroom-room/issues/05-interactive-map-ui-harness.md) — Selected Vite + TypeScript + Leaflet/Canvas architecture with OpenTopoMap/CyclOSM trail layers, Red (Suitability) + Blue (Weather) = Purple (Prime Hotspot) visual paradigm, and GPX 1.1 waypoint route export.
- [GPX Field Guide Metadata & Toxic Lookalike Safety Research](file:///d:/William/Documents/git/shroom-room/.scratch/shroom-room/issues/06-gpx-field-guide-toxic-lookalikes.md) — Embedded diagnostic field identification checklists, toxic lookalike warnings (*Rubroboletus satanas*, *Tylopilus felleus*, *Omphalotus*), and regional poison control hotlines directly into GPX waypoint `<desc>` tags for offline field safety.
- [Unified TypeScript Backend Architecture](file:///d:/William/Documents/git/shroom-room/.scratch/shroom-room/issues/07-backend-architecture-shared-ts.md) — Selected Node.js/TypeScript backend runtime sharing scoring engine, types, and using `geotiff.js` for raster window reading. Codified in [ADR-0002](file:///d:/William/Documents/git/shroom-room/docs/adr/0002-unified-typescript-progressive-baking-backend.md).
- [Tile Grid Sizing & Landuse Filter Gating](file:///d:/William/Documents/git/shroom-room/.scratch/shroom-room/issues/08-tile-grid-sizing-landuse-filter.md) — Sized tiles to $0.05^\circ \times 0.05^\circ$ (~19 km²) with 50m resolution cells. Implemented 2-tier landuse kill-gate: tiles with 0% forest immediately bake as empty in <100ms with zero downstream API calls.
- [Progressive Fog-of-War UI & Status Protocol](file:///d:/William/Documents/git/shroom-room/.scratch/shroom-room/issues/09-fog-of-war-bake-status-protocol.md) — Defined translucent white fog overlay with click-to-bake triggers, real-time step status badges (`landuse_check`, `downloading_trees`, `downloading_soil`, `computing_probabilities`), and smooth fog dissolution upon completion.
- [Baked Tile Persistence & Retrieval](file:///d:/William/Documents/git/shroom-room/.scratch/shroom-room/issues/10-baked-tile-persistence.md) — Pre-computed 50m cell matrices stored as JSON in `data/tiles/{tileId}.json` with atomic writes and fast static retrieval.

## Not yet specified

- Multi-country scaling beyond DE/FR to Italy and rest of Europe. *(on hold — get MVP working first)*
- Advanced ML Species Distribution Model (MaxEnt/Random Forest) training pipeline using GBIF occurrences. Pluggable scoring engine ready per [ADR-0001](file:///d:/William/Documents/git/shroom-room/docs/adr/0001-pluggable-scoring-pipeline.md).

## Out of scope

- Cultivated / non-wild mushroom growth modeling.
- Toxic / non-edible species identification and mapping.
- User report submission / crowd-sourced occurrence logging.
