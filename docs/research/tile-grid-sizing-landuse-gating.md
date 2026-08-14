# Tile Grid Sizing & Landuse Pre-Filtering Specification

## 1. Spatial Grid Sizing ($0.05^\circ \times 0.05^\circ$)

Tiles are indexed by their South-West corner rounded to multiples of $0.05^\circ$:
$$\text{Tile ID} = \lfloor \text{lat} / 0.05 \rfloor \times 0.05 \text{ \_ } \lfloor \text{lon} / 0.05 \rfloor \times 0.05$$
*Example*: `51.750_10.450` spans $\text{lat} \in [51.750, 51.800]$, $\text{lon} \in [10.450, 10.500]$.

### Physical Dimensions
- **Latitude Span**: $0.05^\circ \approx 5.55\text{ km}$
- **Longitude Span (at } 52^\circ\text{N)}$: $0.05^\circ \approx 3.42\text{ km}$
- **Area**: $\approx 19.0\text{ km}^2$ per tile.
- **Matrix Resolution**: 50m cell size $\implies 110 \text{ rows} \times 70 \text{ cols} = 7,700\text{ cells}$.
- **Payload Size**: $\approx 20\text{–}35\text{ KB}$ per baked tile JSON (gzip $\approx 6\text{ KB}$).

---

## 2. Two-Tier Landuse Pre-Filtering ("The Kill Gate")

To prevent wasting API quotas and compute on urban centers (like Braunschweig), lakes, or agricultural plains:

```
[User Requests Tile]
        │
        ▼
[Tier 1: Forest Landuse Query (OSM / Corine)]
        │
   Forest Coverage == 0% ?
   ├── YES ──► [Instant Minimal Bake: { is_empty: true, forest_pct: 0 }] (< 100ms)
   │           (Zero calls to SoilGrids or heavy tree rasters)
   └── NO
        │
        ▼
[Tier 2: Targeted Extraction]
   - Query ForestPaths 10m Tree Genus for forested cells only
   - Query SoilGrids REST for bounding forest polygons
   - Compute Boletus & Chanterelle suitability matrices
   - Persist to data/tiles/{tile_id}.json
```

---

## 3. Baked Tile Schema

```typescript
export interface BakedTileData {
  tileId: string; // e.g. "51.750_10.450"
  bounds: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
  resolutionMeters: number; // 50
  rows: number; // 110
  cols: number; // 70
  forestCoveragePct: number; // 0..100
  isEmpty: boolean; // true if 0% forest
  cells: {
    treeGenus: number; // 1: Picea, 2: Pinus, 3: Fagus, 4: Quercus, 7: Non-forest
    soilPH: number;    // e.g. 5.2
    boletusSuitability: number;     // 0..100
    chanterelleSuitability: number; // 0..100
  }[];
  bakedAt: string; // ISO 8601
}
```
