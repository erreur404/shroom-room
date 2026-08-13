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
- **Target Test Regions**: Niedersachsen (Germany), Bretagne (France)
- **Target Species**: *Boletus edulis*, *Cantharellus cibarius*

## Decisions so far

- [Initial Habitat Parameter Research](file:///d:/William/Documents/git/shroom-room/docs/research/mushroom-growth-parameters.md) — Identified key abiotic (soil pH, temp drop, rain pulse) and biotic (host trees) drivers for European edible species.
- [Dataset Selection & Hybrid Architecture](file:///d:/William/Documents/git/shroom-room/docs/research/open-datasets-mushroom-habitat.md) — Selected SoilGrids v2.0 (soil), Copernicus HRL Forest Type + EU-Forest (trees), EU-DEM (elevation), Open-Meteo (live/historical weather), GBIF (occurrences). Recommended hybrid static vector tiles + dynamic weather overlay architecture.
- [Host Tree Extraction Pipeline for Niedersachsen & Bretagne](file:///d:/William/Documents/git/shroom-room/.scratch/shroom-room/issues/01-host-tree-dataset-pipeline.md) — Selected ForestPaths 10m tree genus dataset on Zenodo (13341104); defined tile selection, host tree classification for Boletus and Cantharellus, 20m proximity dilation, and Python/GDAL COG pipeline.
- [SoilGrids Ingestion & Tiling Strategy for Test Regions](file:///d:/William/Documents/git/shroom-room/.scratch/shroom-room/issues/02-soilgrids-ingestion-tiling.md) — Defined ISRIC WebDAV VRT `/vsicurl/` streaming pipeline for `phh2o` ($\div 10$), `clay`, `sand`, `soc`, reprojecting to EPSG:3035 and clipping to Niedersachsen & Bretagne for Suitability Map tiling.
- [Open-Meteo Weather Querying & Fruiting Trigger Scoring](file:///d:/William/Documents/git/shroom-room/.scratch/shroom-room/issues/03-open-meteo-weather-integration.md) — Defined multi-coordinate viewport sampling ($8\times 8$ to $12\times 12$ grid), 14-day rainfall and cold-shock trigger math, and client-side IDW canvas overlay rendering.

## Not yet specified

- Multi-country scaling beyond DE/FR to Italy and rest of Europe. *(on hold — get MVP working first)*
- Advanced ML Species Distribution Model (MaxEnt/Random Forest) training pipeline using GBIF occurrences. The scoring architecture must be **pluggable** from day one so alternative pipelines (rule-based, MaxEnt, Random Forest, etc.) can be swapped and compared — see [ADR-0001](file:///d:/William/Documents/git/shroom-room/docs/adr/0001-pluggable-scoring-pipeline.md).

## Out of scope

- Cultivated / non-wild mushroom growth modeling (commercial indoor farming).
- Toxic / non-edible species identification and mapping.
- User report submission / crowd-sourced occurrence logging — foragers don't share their best spots.
