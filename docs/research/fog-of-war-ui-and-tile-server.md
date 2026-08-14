# Fog-of-War UI & Real-Time Tile Server Specification

## 1. REST & Status Protocol Endpoints

```text
GET  /api/tiles/status?bbox={south},{west},{north},{east}
     Response: {
       "tiles": {
         "51.750_10.450": { "status": "baked", "forestCoveragePct": 84 },
         "51.750_10.500": { "status": "baking", "step": "ingesting_soil", "progressPct": 65 },
         "51.800_10.450": { "status": "unbaked" }
       }
     }

POST /api/tiles/bake
     Body: { "tileId": "51.800_10.450" }
     Response: { "status": "queued", "tileId": "51.800_10.450" }

GET  /api/tiles/:tileId
     Response: BakedTileData (JSON)
```

---

## 2. Fog-of-War Leaflet Layer Behavior

1. **Tile Grid Alignment**:
   - Leaflet listens to viewport pan/zoom, computing all $0.05^\circ \times 0.05^\circ$ tile bounds intersecting the screen.
2. **Visual States**:
   - `unbaked`: Translucent white fog veil (`rgba(240, 245, 255, 0.40)`) with dashed boundary and click prompt.
   - `baking`: Shimmering/pulsing overlay with step badge (`"🧪 SoilGrids (65%)..."`).
   - `baked`: Fog removed; actual suitability overlay rendered; persisted on disk.
3. **Deduplication**:
   - Clicking an already baking tile is a no-op (subscribes to existing job).
