# Open Datasets for European Mushroom Habitat Prediction (Germany, France, Italy)

## Executive Summary

To model mushroom habitat suitability and real-time fruiting probability across **Germany (DE), France (FR), and Italy (IT)**, we require four core categories of open spatial data:

1. **Species Occurrence (Ground Truth)**: Training data for distribution models (MaxEnt, Random Forest).
2. **Pedological Data (Soil)**: Static soil parameters (pH, texture, organic carbon, bulk density).
3. **Vegetation & Forestry Data**: Host tree distribution, canopy cover, land use.
4. **Meteorological Data (Weather)**: Dynamic triggers (precipitation pulses, air/soil temperature, soil moisture).

This document evaluates the best open datasets, their API access parameters, spatial resolution, and licensing.

---

## Master Datasets Summary Table

| Category | Dataset Name | Provider | Spatial Res. | Temporal Res. / Range | Access Method | License |
|---|---|---|---|---|---|---|
| **Occurrences** | GBIF Occurrence API | GBIF | Point coords | 1900 – Present | REST API / Parquet | CC-BY 4.0 / CC0 |
| **Occurrences** | INPN / MycoDB | MNHN (France) | Point / Grid | 1950 – Present | API / Web | Open Data |
| **Occurrences** | Pilze-Deutschland | DGfM (Germany) | TK25 / Point | 1970 – Present | Web / Download | Open Data |
| **Soil** | SoilGrids v2.0 | ISRIC | 250 m | Static | REST API / WCS | CC-BY 4.0 |
| **Land / Forest**| Copernicus Forest Type | EEA | 10 m | 2018 (3-yr update)| GeoTIFF / WMS | Open (Copernicus) |
| **Land / Forest**| EU-Forest / ForestPaths| EFI / JRC / Zenodo | 10 m – 1 km | Static / 2020 | NetCDF / GeoTIFF | CC-BY 4.0 |
| **Weather** | Open-Meteo ERA5-Land | Open-Meteo | 9 km (0.1°) | 1940 – Present | REST API (Free) | CC-BY 4.0 |
| **Elevation** | EU-DEM v1.1 / Cop-DEM | EEA / Copernicus | 25 m – 30 m | Static | GeoTIFF download | Open (Copernicus) |

---

## 1. Species Occurrence Data (Ground Truth)

### Global Biodiversity Information Facility (GBIF)

- **Provider**: GBIF Secretariat
- **Scope**: Millions of fungal records across DE, FR, IT (iNaturalist, national herbarium collections, mycological societies).
- **Key Parameters**: `taxonKey` (e.g. *Boletus edulis* = 5284517), `country` (`DE`, `FR`, `IT`), `hasCoordinate=true`.
- **API Endpoint**:
  ```http
  GET https://api.gbif.org/v1/occurrence/search?taxonKey=5284517&country=FR&hasCoordinate=true&limit=100
  ```
- **Python / R SDK**: `pygbif` (Python), `rgbif` (R).
- **Data Format**: JSON, GeoPackage, Apache Parquet (for bulk analysis).

### National Mycological Repositories

- **France — INPN (Inventaire National du Patrimoine Naturel)**:
  - API: `https://inpn.mnhn.fr/api`
  - Excellent coverage for French truffle (*Tuber melanosporum*) and bolete occurrences.
- **Germany — Pilze-Deutschland (DGfM)**:
  - Database: `https://www.pilze-deutschland.de`
  - High-density distribution maps based on TK25 (Topographische Karte 1:25,000 grid).

---

## 2. Soil Properties (SoilGrids v2.0)

- **Provider**: ISRIC – World Soil Information
- **Description**: Global 250m resolution predictions of soil properties at standard depth intervals (0-5cm, 5-15cm, 15-30cm).
- **Key Variables for Fungi**:
  - `phh2o`: Soil pH in water (crucial for distinguishing acidophilic *Cantharellus* vs basophilic *Tuber*).
  - `soc`: Soil organic carbon content (g/kg).
  - `clay`, `sand`, `silt`: Soil texture fractions (%).
  - `bdod`: Bulk density (cg/cm³).
- **API Endpoint (Point Query)**:
  ```http
  GET https://rest.isric.org/soilgrids/v2.0/properties/query?lon=6.12&lat=48.69&property=phh2o&property=soc&property=clay&depth=0-5cm
  ```
- **Raster Access**: Web Coverage Service (WCS) for cropping regional bounding boxes across DE/FR/IT.

---

## 3. Land Cover & Tree Species Distribution

### Copernicus High Resolution Layer (HRL) Forest Type

- **Provider**: European Environment Agency (EEA)
- **Resolution**: 10 meters
- **Description**: Classifies land into:
  1. Broadleaved forest
  2. Coniferous forest
  3. Non-forest tree cover
- **Access**: Copernicus Land Monitoring Service (WMS / WMTS / Direct Download GeoTIFF).

### EU-Forest & ForestPaths Tree Species Distribution

- **Provider**: Joint Research Centre (JRC) / European Forest Institute / Zenodo
- **Description**: High-resolution (10m - 1km) probability raster maps for major European host trees (*Picea abies*, *Fagus sylvatica*, *Quercus robur*, *Quercus ilex*, *Pinus sylvestris*, *Fraxinus excelsior*).
- **Zenodo Repository Link**: [Harmonized Tree Species Distribution Maps for Europe](https://doi.org/10.5281/zenodo.3779201)
- **Format**: Cloud-Optimized GeoTIFF (COG) / NetCDF.

---

## 4. Meteorological & Soil Climate Data (Open-Meteo & ERA5)

### Open-Meteo Historical & Forecast APIs

- **Provider**: Open-Meteo (built on ECMWF ERA5-Land reanalysis and DWD ICON / Météo-France models).
- **License**: CC-BY 4.0 (Free, no API key required for non-commercial/open source up to 10,000 calls/day).
- **Key Variables for Mushroom Trigger Modeling**:
  - `temperature_2m` / `temperature_2m_mean`: Daily air temperature.
  - `soil_temperature_0_to_7cm`: Soil temperature trigger for fruiting.
  - `precipitation_sum`: Daily rainfall accumulation.
  - `soil_moisture_0_to_7cm`: Volumetric soil water content.
  - `relative_humidity_2m`: Air humidity.

- **Historical ERA5 API Example (Querying 30-day rainfall prior to a find)**:
  ```http
  GET https://archive-api.open-meteo.com/v1/archive?latitude=48.85&longitude=2.35&start_date=2023-09-01&end_date=2023-10-01&daily=temperature_2m_mean,precipitation_sum,soil_temperature_0_to_7cm_mean,soil_moisture_0_to_7cm_mean&timezone=Europe%2FParis
  ```

- **Live 7-Day Forecast API Example**:
  ```http
  GET https://api.open-meteo.com/v1/forecast?latitude=48.85&longitude=2.35&hourly=temperature_2m,precipitation,soil_temperature_0cm,soil_moisture_0_to_1cm&timezone=Europe%2FParis
  ```

---

## 5. Elevation & Topography (EU-DEM v1.1)

- **Provider**: European Environment Agency (EEA)
- **Resolution**: 25 meters
- **Description**: Digital Elevation Model derived from SRTM and SPOT elevation data covering all EU member states.
- **Derived Topographic Layers**:
  - Slope angle (in degrees)
  - Aspect (North/East/South/West orientation)
  - Topographic Wetness Index (TWI) — computes water accumulation areas.
- **Access**: Free GeoTIFF tiles via Copernicus Land Service.

---

## Architecture Recommendation: On-Demand vs Precomputed Map

Based on data structure analysis:

```
┌────────────────────────────────────────────────────────┐
│                   HYBRID ARCHITECTURE                   │
├────────────────────────────────────────────────────────┤
│ 1. PRECOMPUTED BASE MAP (Static Habitat Suitability)   │
│    - Layers: SoilGrids pH, Forest Type, Elevation, TWI │
│    - Resolution: ~250m grid across DE/FR/IT            │
│    - Stored as Vector Tiles (PMTiles / Mapbox Vector)  │
│                                                        │
│ 2. DYNAMIC ON-DEMAND OVERLAY (Fruiting Trigger Index)  │
│    - Queries Open-Meteo API for 14-day rain & temp     │
│    - Computes live fruiting score on user viewport     │
└────────────────────────────────────────────────────────┘
```

- **Static Layer (Precomputed)**: Soil pH, tree host proximity, slope aspect don't change month-to-month. Pre-bake these into vector tiles or a Cloud-Optimized GeoTIFF (COG).
- **Dynamic Layer (On-demand)**: Fetch live weather from Open-Meteo API for the user's viewport bounding box to compute the current 7-day "Fruiting Index" multiplier.

---

## Citations & Links

1. **GBIF Developer API Documentation**: [https://techdocs.gbif.org/en/openapi/](https://techdocs.gbif.org/en/openapi/)
2. **SoilGrids v2.0 REST API Documentation**: [https://rest.isric.org/soilgrids/v2.0/docs](https://rest.isric.org/soilgrids/v2.0/docs)
3. **Open-Meteo Historical Weather API**: [https://open-meteo.com/en/docs/historical-weather-api](https://open-meteo.com/en/docs/historical-weather-api)
4. **Copernicus High Resolution Land Monitoring**: [https://land.copernicus.eu](https://land.copernicus.eu)
5. **Zenodo EU-Forest Dataset**: [https://doi.org/10.5281/zenodo.3779201](https://doi.org/10.5281/zenodo.3779201)
