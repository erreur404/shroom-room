export interface TileBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface BakedCell {
  row: number;
  col: number;
  lat: number;
  lon: number;
  treeGenus: number; // 0: Larix, 1: Picea, 2: Pinus, 3: Fagus, 4: Quercus, 5: Other Conifer, 6: Other Deciduous, 7: Non-forest
  distToHostMeters: number;
  soilPH: number;
  clayPct: number;
  sandPct: number;
  socDgKg: number;
  isForest: boolean;
  boletusSuitability: number;     // 0..100
  chanterelleSuitability: number; // 0..100
}

export interface BakedTileData {
  tileId: string; // e.g. "51.750_10.450"
  bounds: TileBounds;
  baseCellMeters: number; // 250
  rows: number; // e.g. 22
  cols: number; // e.g. 14
  forestCoveragePct: number; // 0..100
  isEmpty: boolean; // true if 0% forest
  cells: BakedCell[];
  fused1000m?: {
    rows: number;
    cols: number;
    cells: {
      row: number;
      col: number;
      lat: number;
      lon: number;
      isForest: boolean;
      boletusSuitability: number;
      chanterelleSuitability: number;
    }[];
  };
  bakedAt: string;
}

export const TILE_CONFIG = {
  TILE_DEGREE_SPAN: 0.05,        // 0.05° bounding box
  BASE_CELL_METERS: 250,        // 250m native SoilGrids grid
  OVERVIEW_CELL_METERS: 1000,   // 1000m (4x4 quadtree fusion)
};

/**
 * Computes canonical Tile ID from any lat/lon coordinate
 * Example: 51.782, 10.451 -> "51.750_10.450"
 */
export function getTileId(lat: number, lon: number): string {
  const span = TILE_CONFIG.TILE_DEGREE_SPAN;
  const south = Math.floor(lat / span) * span;
  const west = Math.floor(lon / span) * span;
  return `${south.toFixed(3)}_${west.toFixed(3)}`;
}

/**
 * Returns exact bounding box for a Tile ID
 */
export function parseTileBounds(tileId: string): TileBounds {
  const [southStr, westStr] = tileId.split('_');
  const south = parseFloat(southStr);
  const west = parseFloat(westStr);
  const span = TILE_CONFIG.TILE_DEGREE_SPAN;
  return {
    south: Number(south.toFixed(3)),
    west: Number(west.toFixed(3)),
    north: Number((south + span).toFixed(3)),
    east: Number((west + span).toFixed(3)),
  };
}

/**
 * Generates all Tile IDs that intersect a given viewport bounding box
 */
export function getTileIdsForViewport(bounds: TileBounds): string[] {
  const span = TILE_CONFIG.TILE_DEGREE_SPAN;
  const tileIds: string[] = [];

  const startLat = Math.floor(bounds.south / span) * span;
  const endLat = Math.floor(bounds.north / span) * span;
  const startLon = Math.floor(bounds.west / span) * span;
  const endLon = Math.floor(bounds.east / span) * span;

  for (let lat = startLat; lat <= endLat + 1e-6; lat += span) {
    for (let lon = startLon; lon <= endLon + 1e-6; lon += span) {
      tileIds.push(`${lat.toFixed(3)}_${lon.toFixed(3)}`);
    }
  }

  return Array.from(new Set(tileIds));
}
