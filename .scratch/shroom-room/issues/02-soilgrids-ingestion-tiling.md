# Ticket 02: SoilGrids Ingestion & Tiling Strategy for Test Regions

Status: resolved
Type: prototype
Blocked by: none

## Question

What is the most efficient pipeline to ingest SoilGrids v2.0 `phh2o` (pH) and soil texture (`sand`, `clay`, `soc`) layers via ISRIC WCS for Niedersachsen and Bretagne, clip them to region boundaries, and serve them as static vector/raster tiles for the client-side **Suitability Map**?

## Answer

Resolved by research and prototype pipeline at [docs/research/soilgrids-pipeline-niedersachsen-bretagne.md](file:///d:/William/Documents/git/shroom-room/docs/research/soilgrids-pipeline-niedersachsen-bretagne.md).

Key findings:
1. **Source & Protocol**: High-performance `/vsicurl/` streaming against ISRIC WebDAV VRT files (`https://files.isric.org/soilgrids/latest/data/{property}/{property}_0-5cm_mean.vrt`) avoiding full globe downloads.
2. **Key Target Properties**: `phh2o` (topsoil pH in water, scaled by $\div 10$), `sand`, `clay`, and `soc` (organic carbon).
3. **Projection & Alignment**: Reprojected directly to `EPSG:3035` matching the 10m ForestPaths host-tree grid extent for Niedersachsen and Bretagne.
4. **Processing Pipeline**: Automated GDAL/Rasterio pipeline masks against regional GeoJSON boundaries and generates Cloud-Optimized GeoTIFFs (COGs).
5. **Tiling Strategy**: Pre-combined with host-tree suitability and served as XYZ raster tiles (PNG/WebP) or vector PMTiles for the web map frontend.
