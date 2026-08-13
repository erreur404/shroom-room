# Host Tree Data Pipeline - Niedersachsen & Bretagne

This document describes the pipeline for querying, downloading, and processing host tree spatial distribution layers for Niedersachsen (Germany) and Bretagne (France) to build the static **Suitability Map** for *Boletus edulis* and *Cantharellus cibarius*.

---

## 1. Datasets & Source Access

### ForestPaths European Tree Genus Map (2020)
- **Source URL**: [Zenodo Record 13341104](https://zenodo.org/records/13341104)
- **Resolution**: 10 meters spatial resolution.
- **Format**: Cloud Optimized GeoTIFFs (COGs) packed into 100km grid ZIP archives.
- **Coordinate Reference System (CRS)**: `EPSG:3035` (ETRS89-extended / LAEA Europe).
- **Classes / Legend**:
  - `0`: *Larix* (Larch)
  - `1`: *Picea* (Spruce)
  - `2`: *Pinus* (Pine)
  - `3`: *Fagus* (Beech)
  - `4`: *Quercus* (Oak)
  - `5`: Other needleleaf
  - `6`: Other broadleaf
  - `7`: No trees (cropland, grassland, water, urban, etc.)

- **Grid Index File**: `grid.gpkg` (contains vector polygons of the 100km tile boundaries).
- **Download Link Format**: 
  - Grid Index: `https://zenodo.org/records/13341104/files/grid.gpkg?download=1`
  - ZIP Archives: `https://zenodo.org/records/13341104/files/ulx_<XXXX>.zip?download=1`

---

## 2. Region-Specific Tile Identification

To avoid downloading the entire dataset, we target only the tiles intersecting the bounding boxes of the test regions in `EPSG:3035`.

### A. Bretagne (France)
- **Projected Bounding Box (EPSG:3035)**:
  - X min: `3,460,000` | X max: `3,850,000`
  - Y min: `2,840,000` | Y max: `3,040,000`
- **Required ZIP Archives (`ulx`)**:
  - `ulx_3400.zip`, `ulx_3500.zip`, `ulx_3600.zip`, `ulx_3700.zip`, `ulx_3800.zip`
- **Relevant Tiles (`uly` range)**:
  - `uly_2840`, `uly_2940`, `uly_3040` (e.g., `spp_pred_ulx_3500_uly_2940.tif`)
- **Boundary GeoJSON Source**:
  - [France GeoJSON (Grégoire David)](https://france-geojson.gregoiredavid.fr/)
  - URL: `https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions/bretagne/communes-bretagne.geojson`

### B. Niedersachsen (Germany)
- **Projected Bounding Box (EPSG:3035)**:
  - X min: `4,031,000` | X max: `4,360,000`
  - Y min: `3,150,000` | Y max: `3,520,000`
- **Required ZIP Archives (`ulx`)**:
  - `ulx_4000.zip`, `ulx_4100.zip`, `ulx_4200.zip`, `ulx_4300.zip`
- **Relevant Tiles (`uly` range)**:
  - `uly_3140`, `uly_3240`, `uly_3340`, `uly_3440`, `uly_3540`
- **Boundary GeoJSON Source**:
  - [deutschlandGeoJSON (isellsoap)](https://github.com/isellsoap/deutschlandGeoJSON)
  - URL: `https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/master/2_bundeslaender/3_mittel.geo.json` (Filter by `NL_NAME_1 == "Niedersachsen"`)

---

## 3. Data Ingestion & Tile Selection Algorithm (Python)

The following Python snippet determines the exact list of tiles to download using the vector boundary of a target region and the dataset's `grid.gpkg`:

```python
import os
import requests
import geopandas as gpd
from shapely.geometry import box

def get_intersecting_tiles(region_geojson_url, grid_gpkg_path, filter_query=None):
    # 1. Load region boundary and project to EPSG:3035
    region = gpd.read_file(region_geojson_url)
    if filter_query:
        region = region.query(filter_query)
    region = region.to_crs(epsg=3035)
    
    # 2. Load ForestPaths grid index
    grid = gpd.read_file(grid_gpkg_path).to_crs(epsg=3035)
    
    # 3. Intersect geometries
    intersecting = gpd.sjoin(grid, region, how="inner", predicate="intersects")
    
    # Extract tile IDs
    return intersecting[['ulx', 'uly']].drop_duplicates().to_dict(orient='records')
```

---

## 4. Host Tree Classification & Proximity Masking

### Species-to-Genus Mappings
1. **Boletus edulis (King Bolete)**:
   - Symbionts: *Picea abies*, *Pinus sylvestris*, *Fagus sylvatica*, *Quercus robur*
   - Target Classes: `1` (Picea), `2` (Pinus), `3` (Fagus), `4` (Quercus)
2. **Cantharellus cibarius (Chanterelle)**:
   - Symbionts: *Pinus sylvestris*, *Fagus sylvatica*, *Quercus robur*
   - Target Classes: `2` (Pinus), `3` (Fagus), `4` (Quercus)

### Proximity Definition
Mushrooms fruit in the immediate root zone of symbiont trees. A proximity threshold of **20 meters** (~2 pixels at 10m resolution) is used to define "near host tree".

---

## 5. End-to-End Processing Pipeline (Python & GDAL)

Below is the complete processing pipeline script using `rasterio`, `numpy`, and `scipy`:

```python
import os
import zipfile
import numpy as np
import rasterio
from rasterio.merge import merge
from rasterio.mask import mask
from scipy.ndimage import binary_dilation
import geopandas as gpd

def process_host_tree_mask(region_geojson, zip_paths, output_cog_path, species="boletus"):
    # Target classes configuration
    if species == "boletus":
        target_classes = {1, 2, 3, 4} # Spruce, Pine, Beech, Oak
    elif species == "cantharellus":
        target_classes = {2, 3, 4}    # Pine, Beech, Oak
    else:
        raise ValueError("Unknown species")

    # 1. Read and project boundary
    boundary_gdf = gpd.read_file(region_geojson)
    boundary_gdf = boundary_gdf.to_crs(epsg=3035)
    geoms = boundary_gdf.geometry.values

    temp_files = []
    
    # 2. Extract relevant TIF files from downloaded ZIPs
    for zip_path in zip_paths:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            for member in zip_ref.namelist():
                if member.endswith('.tif'):
                    zip_ref.extract(member, path="temp_extracted")
                    temp_files.append(os.path.join("temp_extracted", member))

    # 3. Mosaic the extracted tiles
    src_files_to_mosaic = [rasterio.open(f) for f in temp_files]
    mosaic, out_trans = merge(src_files_to_mosaic)
    
    # Update metadata
    out_meta = src_files_to_mosaic[0].meta.copy()
    out_meta.update({
        "driver": "GTiff",
        "height": mosaic.shape[1],
        "width": mosaic.shape[2],
        "transform": out_trans
    })
    
    # Save temporary merged mosaic
    merged_path = "temp_merged.tif"
    with rasterio.open(merged_path, "w", **out_meta) as dest:
        dest.write(mosaic)
        
    for src in src_files_to_mosaic:
        src.close()

    # 4. Crop to target region boundary
    with rasterio.open(merged_path) as src:
        out_image, out_transform = mask(src, geoms, crop=True)
        out_meta = src.meta.copy()
        
    out_meta.update({
        "height": out_image.shape[1],
        "width": out_image.shape[2],
        "transform": out_transform,
        "nodata": 255
    })
    
    # 5. Reclassify & Apply Proximity Mask (20m / 2 pixels buffer)
    raw_raster = out_image[0]
    
    # Create binary mask (True where pixels are host trees)
    host_mask = np.isin(raw_raster, list(target_classes))
    
    # Dilate by 2 pixels to create a 20m proximity buffer
    struct = np.array([[0,0,1,0,0],
                       [0,1,1,1,0],
                       [1,1,1,1,1],
                       [0,1,1,1,0],
                       [0,0,1,0,0]], dtype=bool)
                       
    proximity_mask = binary_dilation(host_mask, structure=struct).astype(np.uint8)
    
    # Set areas outside the region boundary to nodata (255)
    proximity_mask[raw_raster == 255] = 255
    
    # 6. Save as optimized Cloud Optimized GeoTIFF (COG)
    out_meta.update({
        "dtype": "uint8",
        "count": 1,
        "compress": "deflate",
        "tiled": True,
        "blockxsize": 256,
        "blockysize": 256
    })
    
    with rasterio.open(output_cog_path, "w", **out_meta) as dest:
        dest.write(proximity_mask, 1)
        
    # Cleanup temporary files
    os.remove(merged_path)
    for f in temp_files:
        os.remove(f)
```

---

## 6. Output Delivery Formats
For the static **Suitability Map** layer in the browser frontend:
1. **Low-res preview**: Re-project the 10m raster to `EPSG:4326` and convert to PMTiles or Mapbox Vector Tiles (MVT) using `tippecanoe`.
2. **High-res query backend**: Keep the output COG files in local UTM projections (e.g. `EPSG:25832` for Niedersachsen, `EPSG:2154` for Bretagne) stored on cloud storage, queryable dynamically using HTTP range requests.
