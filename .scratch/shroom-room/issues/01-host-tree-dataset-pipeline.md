# Ticket 01: Host Tree Data Extraction for Niedersachsen & Bretagne

Status: resolved
Type: research
Blocked by: none

## Question

How do we query, filter, and extract host tree spatial distribution layers (*Picea abies*, *Fagus sylvatica*, *Quercus robur*, *Pinus sylvestris*) specifically covering **Niedersachsen** (DE) and **Bretagne** (FR) from Copernicus Forest Type (10m) and EU-Forest / ForestPaths datasets into a lightweight raster or vector format for the **Suitability Map**?

## Answer

Resolved by research saved at [docs/research/host-tree-pipeline-niedersachsen-bretagne.md](file:///d:/William/Documents/git/shroom-room/docs/research/host-tree-pipeline-niedersachsen-bretagne.md).

Key findings:
1. **Dataset**: ForestPaths European Tree Genus Map 2020 (Zenodo 13341104), 10m resolution in EPSG:3035.
2. **Tile Selection**: Filtered Zenodo 100km tiles by bounding box intersection for Bretagne (`ulx_3400`..`ulx_3800`) and Niedersachsen (`ulx_4000`..`ulx_4300`).
3. **Classification**:
   - *Boletus edulis*: classes 1 (Picea), 2 (Pinus), 3 (Fagus), 4 (Quercus).
   - *Cantharellus cibarius*: classes 2 (Pinus), 3 (Fagus), 4 (Quercus).
4. **Proximity Mask**: 20m (~2 pixel) binary dilation using `scipy.ndimage.binary_dilation`.
5. **Output**: Cloud-Optimized GeoTIFFs (COGs) clipped to regional GeoJSON boundaries, deliverable via vector tiles (PMTiles) for frontend preview.
