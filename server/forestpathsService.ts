import { TileBounds } from './tileConfig';

export interface TreeObservation {
  lat: number;
  lon: number;
  genusId: number; // 0: Larix, 1: Picea, 2: Pinus, 3: Fagus, 4: Quercus, 5: Other Conifer, 6: Other Deciduous, 7: Non-forest
  species: string;
}

export interface TileTreeSampler {
  totalObservations: number;
  genusCounts: Record<number, number>;
  oakCount: number;
  resolveGenusForCell: (
    lat: number,
    lon: number,
    osmGenus: number,
    osmTags?: Record<string, string>
  ) => { genus: number; source: 'gbif' | 'osm' | 'fallback' };
}

const GBIF_GENUS_KEYS: Record<number, number> = {
  2878688: 4, // Quercus (Oak)
  2684241: 2, // Pinus (Pine)
  2882316: 3, // Fagus (Beech)
  2684880: 1, // Picea (Spruce)
  2686156: 0, // Larix (Larch)
  2876125: 6, // Betula (Birch / Other Broadleaf)
};

export class ForestpathsService {
  private cache: Map<string, TileTreeSampler> = new Map();

  /**
   * Queries the GBIF Biodiversity Occurrence API (api.gbif.org) for all recorded
   * host tree occurrences (Quercus, Pinus, Fagus, Picea, Larix, Betula) within the tile bounding box.
   * Falls back gracefully to OSM species and broad regional classifications if unavailable.
   */
  async sampleTileTrees(bounds: TileBounds): Promise<TileTreeSampler> {
    const key = `${bounds.south.toFixed(3)}_${bounds.west.toFixed(3)}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const taxonParams = Object.keys(GBIF_GENUS_KEYS).map(k => `taxonKey=${k}`).join('&');
    const bboxParam = `decimalLatitude=${bounds.south},${bounds.north}&decimalLongitude=${bounds.west},${bounds.east}`;
    const url = `https://api.gbif.org/v1/occurrence/search?${taxonParams}&${bboxParam}&hasCoordinate=true&limit=300`;

    const startTime = Date.now();
    console.log(`[ForestpathsService] [${key}] Querying GBIF tree occurrence API for bounds [${bounds.south}, ${bounds.west}] to [${bounds.north}, ${bounds.east}]...`);

    const observations: TreeObservation[] = [];
    const genusCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'ShroomRoom/1.0 (https://github.com/shroom-room)' }
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const duration = Date.now() - startTime;
        console.log(`[ForestpathsService] [${key}] GBIF responded in ${duration}ms with ${data.count} total occurrences (${data.results?.length || 0} fetched)`);

        for (const r of data.results || []) {
          const lat = r.decimalLatitude;
          const lon = r.decimalLongitude;
          let genusId = -1;

          if (r.genusKey && GBIF_GENUS_KEYS[r.genusKey] !== undefined) {
            genusId = GBIF_GENUS_KEYS[r.genusKey];
          } else if (r.genus) {
            const gLower = r.genus.toLowerCase();
            if (gLower === 'quercus') genusId = 4;
            else if (gLower === 'pinus') genusId = 2;
            else if (gLower === 'fagus') genusId = 3;
            else if (gLower === 'picea') genusId = 1;
            else if (gLower === 'larix') genusId = 0;
            else if (gLower === 'betula') genusId = 6;
          }

          if (genusId >= 0 && lat && lon) {
            observations.push({
              lat,
              lon,
              genusId,
              species: r.species || r.scientificName || ''
            });
            genusCounts[genusId] = (genusCounts[genusId] || 0) + 1;
          }
        }
      } else {
        console.warn(`[ForestpathsService] [${key}] GBIF returned HTTP ${res.status}, using OSM/regional fallback`);
      }
    } catch (err: any) {
      clearTimeout(timeout);
      const errMsg = err?.name === 'AbortError' ? 'Timeout (20s exceeded)' : (err?.message || String(err));
      console.warn(`[ForestpathsService] [${key}] GBIF request failed: ${errMsg}, using OSM/regional fallback`);
    }

    const oakCount = genusCounts[4] || 0;
    console.log(`[ForestpathsService] [${key}] Verified tree observations parsed: ${observations.length} (Oaks: ${oakCount}, Beech: ${genusCounts[3]}, Pine: ${genusCounts[2]}, Spruce: ${genusCounts[1]})`);

    const sampler: TileTreeSampler = {
      totalObservations: observations.length,
      genusCounts,
      oakCount,
      resolveGenusForCell: (lat: number, lon: number, osmGenus: number, osmTags?: Record<string, string>) => {
        // 1. Explicit genus/species in OSM tags takes highest priority for this specific parcel
        if (osmGenus >= 0 && osmGenus !== 5 && osmGenus !== 6) {
          return { genus: osmGenus, source: 'osm' };
        }

        // 2. Real GBIF tree observations in this area
        if (observations.length > 0) {
          const leafType = (osmTags?.leaf_type || '').toLowerCase();
          const isConiferOnly = leafType === 'needleleaved' || osmGenus === 5;
          const isDeciduousOnly = leafType === 'broadleaved' || osmGenus === 6;

          const genusWeights: Record<number, number> = {};
          let totalWeight = 0;
          let closestDist = Infinity;
          let closestGenus = -1;

          for (const obs of observations) {
            if (isConiferOnly && ![0, 1, 2, 5].includes(obs.genusId)) continue;
            if (isDeciduousOnly && ![3, 4, 6].includes(obs.genusId)) continue;

            const dLatM = (obs.lat - lat) * 111320;
            const dLonM = (obs.lon - lon) * 111320 * Math.cos(lat * Math.PI / 180);
            const dist = Math.sqrt(dLatM * dLatM + dLonM * dLonM);

            if (dist < closestDist) {
              closestDist = dist;
              closestGenus = obs.genusId;
            }

            // Spatial influence kernel (distance decay with 350m characteristic radius)
            if (dist <= 3000) {
              const weight = 1 / (1 + Math.pow(dist / 350, 2));
              genusWeights[obs.genusId] = (genusWeights[obs.genusId] || 0) + weight;
              totalWeight += weight;
            }
          }

          if (totalWeight > 0) {
            let bestGenus = closestGenus;
            let maxWeight = -1;
            for (const [gid, w] of Object.entries(genusWeights)) {
              if (w > maxWeight) {
                maxWeight = w;
                bestGenus = Number(gid);
              }
            }
            return { genus: bestGenus, source: 'gbif' };
          }

          if (closestGenus >= 0) {
            return { genus: closestGenus, source: 'gbif' };
          }
        }

        // 3. Fallback when GBIF has no local records: preserve broad classification without fake specific species
        const leafType = (osmTags?.leaf_type || '').toLowerCase();
        if (leafType === 'needleleaved' || osmGenus === 5) {
          return { genus: 5, source: 'fallback' }; // Other Conifer
        }
        if (leafType === 'broadleaved' || osmGenus === 6) {
          return { genus: 6, source: 'fallback' }; // Other Deciduous
        }

        // Default broadleaf/mixed forest representation
        return { genus: 4, source: 'fallback' };
      }
    };

    this.cache.set(key, sampler);
    return sampler;
  }
}
