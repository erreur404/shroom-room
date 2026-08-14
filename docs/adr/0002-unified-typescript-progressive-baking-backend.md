# ADR-0002: Unified TypeScript Backend for Progressive Tile Baking

## Status
Accepted

## Context
In our initial prototype, client-side suitability relied on synthetic trigonometric noise, causing non-forest areas (e.g. Brunswick/Braunschweig urban core) to erroneously display mushroom suitability. Transitioning to real spatial datasets (ForestPaths 10m tree genus, ISRIC SoilGrids v2.0 pH, Open-Meteo weather) requires an asynchronous, progressive tile baking pipeline.

We evaluated two backend runtimes:
1. **Python (FastAPI + GDAL/rasterio)**: High-performance GIS ecosystem, but introduces dual-language maintenance where scoring formulas, types, and species definitions must be duplicated between Python and TypeScript.
2. **Node.js / TypeScript (Fastify/Express + `geotiff.js`)**: Single-language stack where domain models (`EnvironmentalInputs`, `ScoringResult`), scoring algorithms (`ISuitabilityPipeline`, `IProbabilityPipeline`), and weather interpolation are 100% shared directly between frontend and backend.

## Decision
We select **Node.js / TypeScript** for the backend progressive baking service.

### Key Components
1. **Shared Runtime**:
   - Backend imports `src/types/index.ts` and `src/scoring/pipelines.ts` directly.
   - Any modification to scoring weights, pH curves, or host tree tables immediately applies to both real-time UI preview and backend tile baking.
2. **GeoTIFF Raster Access**:
   - Uses `geotiff.js` for reading windowed chunks of ForestPaths 10m tree genus GeoTIFFs (supporting both local disk and remote HTTP range requests).
3. **Atomic Job Queue & Status Streaming**:
   - In-memory job manager ensures identical tile requests from multiple clients or re-renders are deduplicated.
   - Emits step-by-step progress events (`landuse_check`, `downloading_trees`, `downloading_soil`, `computing_probabilities`, `persisted`).

## Consequences
- **Positive**: Single codebase, no type drift, simplified developer workflow (`npm run dev:all`), native JSON serialization.
- **Negative**: For extremely large continental raster reprojections (multi-gigabyte EPSG transformations), Node.js is less optimized than native C++/GDAL binaries. We mitigate this by working directly in source CRS bounding boxes and caching downsampled 50m cell matrices.
