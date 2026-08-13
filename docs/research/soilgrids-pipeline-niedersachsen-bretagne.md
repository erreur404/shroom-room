# SoilGrids Ingestion & Tiling Pipeline - Niedersachsen & Bretagne

This document defines the automated pipeline for ingesting, subsetting, and tiling SoilGrids v2.0 pedological data (`phh2o`, `sand`, `clay`, `soc`) for **Niedersachsen (DE)** and **Bretagne (FR)** to power the static **Suitability Map** layer.

---

## 1. Datasets & Ingestion Endpoints

### SoilGrids v2.0 Specifications
- **Provider**: ISRIC – World Soil Information
- **Native Resolution**: 250 meters
- **Native CRS**: Interrupted Goode Homolosine (`+proj=igh`)
- **Key Target Layers (0–5cm Topsoil)**:
  - `phh2o_0-5cm_mean`: Soil pH in water. *Note: Stored as integer values of $\text{pH} \times 10$ (e.g., 58 = pH 5.8).*
  - `sand_0-5cm_mean`: Sand fraction (g/kg).
  - `clay_0-5cm_mean`: Clay fraction (g/kg).
  - `soc_0-5cm_mean`: Soil organic carbon stock (dg/kg).

### Access Protocols & Endpoints

1. **High-Performance Direct WebDAV / VRT (Recommended Pipeline)**:
   ISRIC serves global Virtual Raster (.vrt) files accessible via GDAL's `/vsicurl/` driver without downloading whole-globe rasters:
   - `phh2o`: `https://files.isric.org/soilgrids/latest/data/phh2o/phh2o_0-5cm_mean.vrt`
   - `clay`: `https://files.isric.org/soilgrids/latest/data/clay/clay_0-5cm_mean.vrt`
   - `sand`: `https://files.isric.org/soilgrids/latest/data/sand/sand_0-5cm_mean.vrt`
   - `soc`: `https://files.isric.org/soilgrids/latest/data/soc/soc_0-5cm_mean.vrt`

2. **OGC Web Coverage Service (WCS 2.0.1)**:
   - Endpoint: `https://maps.isric.org/mapserv?map=/map/{property}.map`
   - Example GetCoverage request:
     ```http
     https://maps.isric.org/mapserv?map=/map/phh2o.map&SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage&COVERAGEID=phh2o_0-5cm_mean&FORMAT=GEOTIFF_INT16&SUBSETTINGCRS=http://www.opengis.net/def/crs/EPSG/0/4326&OUTPUTCRS=http://www.opengis.net/def/crs/EPSG/0/3035&SUBSET=Long(-5.2,-1.0)&SUBSET=Lat(47.2,49.0)
     ```

3. **REST Point Query (Validation / Single Probe)**:
   - `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=9.5&lat=52.5&property=phh2o&property=clay&depth=0-5cm`

---

## 2. Regional Extents & Bounding Boxes

To maintain spatial alignment with the 10m ForestPaths host-tree rasters from Ticket 01, SoilGrids rasters are warped directly into `EPSG:3035` (LAEA Europe):

### A. Bretagne (France)
- **Bounding Box (EPSG:4326)**: `[-5.20, 47.15, -0.95, 48.95]`
- **Projected Extent (EPSG:3035)**: `[3460000, 2840000, 3850000, 3040000]`
- **Region Boundary**: `docs/research/host-tree-pipeline-niedersachsen-bretagne.md` commune GeoJSON boundary.

### B. Niedersachsen (Germany)
- **Bounding Box (EPSG:4326)**: `[6.60, 51.25, 11.65, 53.95]`
- **Projected Extent (EPSG:3035)**: `[4031000, 3150000, 4360000, 3520000]`
- **Region Boundary**: `deutschlandGeoJSON` Niedersachsen state polygon.

---

## 3. End-to-End Extraction & Tiling Script (Python)

Below is the Python pipeline using `gdalwarp` / `rasterio` streaming via `/vsicurl/` to fetch, clip, and re-scale SoilGrids data:

```python
import os
import subprocess
import geopandas as gpd
import rasterio
from rasterio.mask import mask
import numpy as np

PROPERTIES = ["phh2o", "clay", "sand", "soc"]

REGIONS = {
    "bretagne": {
        "bbox_3035": [3460000, 2840000, 3850000, 3040000],
        "geojson": "data/boundaries/bretagne.geojson"
    },
    "niedersachsen": {
        "bbox_3035": [4031000, 3150000, 4360000, 3520000],
        "geojson": "data/boundaries/niedersachsen.geojson"
    }
}

def download_and_clip_soilgrids(region_key, prop, output_dir="data/processed/soil"):
    os.makedirs(output_dir, exist_ok=True)
    region = REGIONS[region_key]
    xmin, ymin, xmax, ymax = region["bbox_3035"]
    
    vrt_url = f"/vsicurl/https://files.isric.org/soilgrids/latest/data/{prop}/{prop}_0-5cm_mean.vrt"
    raw_tif = os.path.join(output_dir, f"{region_key}_{prop}_raw.tif")
    clipped_tif = os.path.join(output_dir, f"{region_key}_{prop}_cog.tif")
    
    # 1. Stream & reproject subset directly via gdalwarp
    warp_cmd = [
        "gdalwarp",
        "-t_srs", "EPSG:3035",
        "-te", str(xmin), str(ymin), str(xmax), str(ymax),
        "-tr", "250", "250",
        "-r", "bilinear",
        "-co", "COMPRESS=DEFLATE",
        "-co", "TILED=YES",
        vrt_url,
        raw_tif
    ]
    subprocess.run(warp_cmd, check=True)
    
    # 2. Mask by Region Vector Boundary & Normalize pH values
    gdf = gpd.read_file(region["geojson"]).to_crs(epsg=3035)
    
    with rasterio.open(raw_tif) as src:
        out_image, out_transform = mask(src, gdf.geometry.values, crop=True, nodata=-9999)
        out_meta = src.meta.copy()
        
        # Convert pH to float (pH * 10 -> actual pH)
        data = out_image[0].astype(np.float32)
        valid_mask = data != -9999
        if prop == "phh2o":
            data[valid_mask] = data[valid_mask] / 10.0
            
        out_meta.update({
            "driver": "GTiff",
            "height": data.shape[0],
            "width": data.shape[1],
            "transform": out_transform,
            "dtype": "float32",
            "nodata": -9999,
            "compress": "deflate",
            "tiled": True,
            "blockxsize": 256,
            "blockysize": 256
        })
        
        with rasterio.open(clipped_tif, "w", **out_meta) as dest:
            dest.write(data, 1)
            
    os.remove(raw_tif)
    print(f"[OK] Generated {clipped_tif}")

if __name__ == "__main__":
    for reg in ["bretagne", "niedersachsen"]:
        for p in PROPERTIES:
            download_and_clip_soilgrids(reg, p)
```

---

## 4. Frontend Delivery & Tiling Strategy

1. **Suitability Model Combining (Backend Precomputation)**:
   - The 250m SoilGrids raster is resampled / matched to the 10m host-tree raster grid using nearest-neighbor/bilinear interpolation.
   - Soil pH suitability score $S_{\text{pH}} \in [0, 1]$ is computed per cell based on species curves (e.g. *Boletus edulis* optimal pH 4.5–6.0).
2. **Web Map Serving**:
   - **Raster COG Tiling**: Serve the combined static suitability map as standard XYZ Web Mercator (`EPSG:3857`) raster tiles (PNG/WebP) or Cloud-Optimized GeoTIFFs using `titiler` / static tile pyramids.
   - **Vector PMTiles alternative**: Polygonize suitability classes into PMTiles for styling and hovering in MapLibre / Leaflet.
