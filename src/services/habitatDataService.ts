import { EnvironmentalInputs, SpeciesId, WeatherGridPoint } from '../types';
import { WeatherService } from './weatherService';


export const SPECIES_DETAILS: Record<SpeciesId, {
  name: string;
  commonName: string;
  guild: string;
  symbionts: string[];
  optimalPH: string;
  seasonWindow: string;
  badgeColor: string;
}> = {
  boletus: {
    name: 'Boletus edulis',
    commonName: 'King Bolete / Porcini / Cèpe / Steinpilz',
    guild: 'Ectomycorrhizal (ECM)',
    symbionts: ['Spruce (Picea)', 'Beech (Fagus)', 'Oak (Quercus)', 'Pine (Pinus)'],
    optimalPH: 'pH 4.8 – 6.2 (Acidic to sub-neutral)',
    seasonWindow: 'August 15 – November 15 (Autumn Peak)',
    badgeColor: '#ef4444'
  },
  cantharellus: {
    name: 'Cantharellus cibarius',
    commonName: 'Golden Chanterelle / Girolle / Pfifferling',
    guild: 'Ectomycorrhizal (ECM)',
    symbionts: ['Oak (Quercus)', 'Beech (Fagus)', 'Pine (Pinus)', 'Birch (Betula)'],
    optimalPH: 'pH 4.0 – 5.2 (Strongly acidophilic)',
    seasonWindow: 'June 15 – October 31 (Summer/Autumn)',
    badgeColor: '#f59e0b'
  },
  hydnum: {
    name: 'Hydnum repandum',
    commonName: 'Wood Hedgehog / Pied-de-mouton / Semmel-Stoppelpilz',
    guild: 'Ectomycorrhizal (ECM)',
    symbionts: ['Beech (Fagus)', 'Spruce (Picea)', 'Pine (Pinus)', 'Oak (Quercus)'],
    optimalPH: 'pH 4.5 – 6.5 (Sub-acidic to neutral)',
    seasonWindow: 'August 15 – December 15 (Late Autumn / Frost-tolerant)',
    badgeColor: '#d97706'
  },
  craterellus_cornucopioides: {
    name: 'Craterellus cornucopioides',
    commonName: 'Black Trumpet / Trompette de la mort / Totentrompete',
    guild: 'Ectomycorrhizal (ECM)',
    symbionts: ['Beech (Fagus)', 'Oak (Quercus)'],
    optimalPH: 'pH 5.2 – 6.8 (Moist loam & calcareous/neutral soils)',
    seasonWindow: 'August 15 – November 30 (Autumn Peak)',
    badgeColor: '#475569'
  },
  craterellus_tubaeformis: {
    name: 'Craterellus tubaeformis',
    commonName: 'Trumpet Chanterelle / Yellowfoot / Chanterelle en tube',
    guild: 'Ectomycorrhizal (ECM)',
    symbionts: ['Spruce (Picea)', 'Pine (Pinus)', 'Beech (Fagus)'],
    optimalPH: 'pH 4.0 – 5.5 (Acidophilic moss cushions)',
    seasonWindow: 'September 15 – January 15 (Extreme Frost-hardy)',
    badgeColor: '#eab308'
  },
  imleria_badia: {
    name: 'Imleria badia',
    commonName: 'Bay Bolete / Cèpe bai / Maronen-Röhrling',
    guild: 'Ectomycorrhizal (ECM)',
    symbionts: ['Spruce (Picea)', 'Pine (Pinus)', 'Beech (Fagus)'],
    optimalPH: 'pH 3.8 – 5.4 (Strongly acidophilic sandy soils)',
    seasonWindow: 'August 1 – November 15 (Late Summer & Autumn)',
    badgeColor: '#92400e'
  },
  laetiporus_sulphureus: {
    name: 'Laetiporus sulphureus',
    commonName: 'Chicken of the Woods / Polypore soufré / Schwefelporling',
    guild: 'Parasitic / Lignicolous Saprotroph',
    symbionts: ['Oak (Quercus)', 'Sweet Chestnut (Castanea)', 'Beech (Fagus)'],
    optimalPH: 'pH 4.5 – 7.0 (Hardwood trunk dweller)',
    seasonWindow: 'May 15 – October 15 (Spring through Autumn)',
    badgeColor: '#f97316'
  },
  macrolepiota_procera: {
    name: 'Macrolepiota procera',
    commonName: 'Parasol Mushroom / Coulemelle / Parasolpilz',
    guild: 'Saprotrophic (Humus & Litter)',
    symbionts: ['Woodland Openings', 'Forest Edges', 'Rich Humus Clearings'],
    optimalPH: 'pH 5.0 – 7.2 (Humus-rich loams & meadows)',
    seasonWindow: 'July 15 – November 15 (Summer to Mid-Autumn)',
    badgeColor: '#a8a29e'
  },
  suillus_luteus: {
    name: 'Suillus luteus / grevillei',
    commonName: 'Slippery Jack & Larch Bolete / Butterpilz & Lärchen-Röhrling',
    guild: 'Ectomycorrhizal (ECM)',
    symbionts: ['Pine (Pinus)', 'Larch (Larix)'],
    optimalPH: 'pH 4.2 – 6.0 (Sandy pine litter)',
    seasonWindow: 'August 1 – November 15 (Autumn Peak)',
    badgeColor: '#b45309'
  },
  coprinus_comatus: {
    name: 'Coprinus comatus',
    commonName: 'Shaggy Mane / Coprin chevelu / Schopftintling',
    guild: 'Saprotrophic (Ruderal / Nitrophilic Humus)',
    symbionts: ['Grassy Forest Margins', 'Meadows & Path Edges', 'Nitrogen-rich Humus & Lawns'],
    optimalPH: 'pH 6.0 – 7.8 (Sub-neutral to calcareous nitrophilic soils)',
    seasonWindow: 'August 15 – November 15 (Autumn Peak)',
    badgeColor: '#64748b'
  },
  sparassis_crispa: {
    name: 'Sparassis crispa',
    commonName: 'Cauliflower Mushroom / Sparassis crépu / Krause Glucke',
    guild: 'Lignicolous / Parasitic Brown-rot Saprotroph',
    symbionts: ['Pine (Pinus)', 'Spruce (Picea)', 'Conifer Stumps & Root Collars'],
    optimalPH: 'pH 4.0 – 5.5 (Acidic sandy pine soils)',
    seasonWindow: 'September 1 – November 30 (Autumn Peak)',
    badgeColor: '#ca8a04'
  }
};

import { BakedTileData, getTileId, getTileIdsForViewport } from '../../server/tileConfig';
import { API_BASE_URL } from '../config';

export class HabitatDataService {
  private tileCache: Map<string, BakedTileData> = new Map();
  private pendingFetches: Set<string> = new Set();
  private onTileUpdateCallbacks: (() => void)[] = [];

  constructor() { }

  /**
   * Register a listener to be notified when new tile data arrives from the backend
   */
  onTileUpdate(cb: () => void) {
    this.onTileUpdateCallbacks.push(cb);
  }

  private notifyUpdate() {
    for (const cb of this.onTileUpdateCallbacks) {
      cb();
    }
  }

  /**
   * Ingests a baked tile directly (e.g. from FogOfWarLayer) and notifies subscribers
   */
  setBakedTile(data: BakedTileData) {
    this.tileCache.set(data.tileId, data);
    this.notifyUpdate();
  }

  /**
   * Fetches tile data from backend server (if already baked).
   * Does NOT trigger automatic baking.
   */
  async fetchTile(tileId: string): Promise<BakedTileData | null> {
    if (this.tileCache.has(tileId)) {
      return this.tileCache.get(tileId)!;
    }

    if (this.pendingFetches.has(tileId)) {
      return null;
    }

    this.pendingFetches.add(tileId);

    try {
      // Check if tile is already baked
      const res = await fetch(`${API_BASE_URL}/api/tiles/${tileId}`);

      if (res.ok) {
        const data = await res.json();
        if (data && data.status !== 'unbaked' && data.cells) {
          this.tileCache.set(tileId, data as BakedTileData);
          this.notifyUpdate();
          return data as BakedTileData;
        }
      }
    } catch (err) {
      // Backend server may be starting or offline
      console.warn(`[HabitatDataService] Could not fetch tile ${tileId} from backend`, err);
    } finally {
      this.pendingFetches.delete(tileId);
    }

    return null;
  }

  /**
   * Explicitly triggers baking for a tile (upon user click)
   */
  async bakeTile(tileId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/tiles/bake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tileId })
      });
    } catch (err) {
      console.warn(`[HabitatDataService] Could not trigger bake for ${tileId}`, err);
    }
  }

  getAllLoadedTiles(): BakedTileData[] {
    return Array.from(this.tileCache.values());
  }

  getLoadedTile(tileId: string): BakedTileData | undefined {
    return this.tileCache.get(tileId);
  }

  /**
   * Prefetches all already-baked tiles in the given viewport from the backend
   */
  async prefetchViewport(bounds: { south: number; west: number; north: number; east: number }) {
    const tileIds = getTileIdsForViewport(bounds);
    // Limit prefetch to a maximum of 40 tiles per batch to avoid browser network saturation
    const cappedTileIds = tileIds.slice(0, 40);
    await Promise.all(cappedTileIds.map(tid => this.fetchTile(tid)));
  }

  /**
   * Evaluates spatial environmental conditions using real baked tile data from the server
   */
  getEnvironmentalInputs(
    lat: number,
    lon: number,
    dateStr: string,
    weatherGrid: WeatherGridPoint[],
    weatherService: WeatherService
  ): EnvironmentalInputs | null {
    const tileId = getTileId(lat, lon);
    const tile = this.tileCache.get(tileId);

    if (!tile) {
      // Trigger async fetch for next render
      this.fetchTile(tileId);
      return null;
    }

    const weather = weatherService.interpolateAt(lat, lon, weatherGrid);

    // 1. If 100% Non-forest tile (e.g. city / open water)
    if (tile.isEmpty || !tile.cells || tile.cells.length === 0) {
      return {
        lat,
        lon,
        soilPH: 6.8,
        clayPct: 20,
        sandPct: 40,
        socDgKg: 100,
        hostTreeGenus: 7, // Non-forest
        distToHostMeters: 200,
        elevationMeters: 80,
        aspectDegrees: 180,
        rain14DaysMm: weather.rain14DaysMm,
        currentSoilTempC: weather.currentSoilTempC,
        pastWeekSoilTempC: weather.pastWeekSoilTempC,
        date: dateStr
      };
    }

    // 2. Find closest baked 250m cell in the matrix
    let closest = tile.cells[0];
    let minD = 999999;
    for (const cell of tile.cells) {
      const d = Math.pow(cell.lat - lat, 2) + Math.pow(cell.lon - lon, 2);
      if (d < minD) {
        minD = d;
        closest = cell;
      }
    }

    return {
      lat,
      lon,
      soilPH: closest.soilPH,
      clayPct: closest.clayPct,
      sandPct: closest.sandPct,
      socDgKg: closest.socDgKg,
      hostTreeGenus: closest.treeGenus,
      distToHostMeters: closest.distToHostMeters,
      elevationMeters: 250,
      aspectDegrees: 180,
      rain14DaysMm: weather.rain14DaysMm,
      currentSoilTempC: weather.currentSoilTempC,
      pastWeekSoilTempC: weather.pastWeekSoilTempC,
      date: dateStr
    };
  }

  getHostTreeName(genusId: number): string {
    switch (genusId) {
      case 0: return 'Larch (Larix)';
      case 1: return 'Norway Spruce (Picea abies)';
      case 2: return 'Scots Pine (Pinus sylvestris)';
      case 3: return 'European Beech (Fagus sylvatica)';
      case 4: return 'Oak (Quercus robur/petraea)';
      case 5: return 'Other Conifer';
      case 6: return 'Other Deciduous';
      default: return 'No host trees nearby (Clearcut/Grass)';
    }
  }
}
