import { TileBounds } from './tileConfig';

export interface LanduseCheckResult {
  isForest: boolean;
  forestCoveragePct: number;
  forestPolygons?: [number, number][][]; // Array of polygon coordinate rings [lat, lon]
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

export class LanduseService {
  private memoryCache: Map<string, LanduseCheckResult> = new Map();

  /**
   * Tier-1 Landuse Gating Check
   * Queries OpenStreetMap Overpass / landcover masks to verify if any forest/woodland exists in the tile.
   * If 0% forest, downstream APIs (SoilGrids, ForestPaths) are completely skipped.
   */
  async checkLanduse(tileId: string, bounds: TileBounds): Promise<LanduseCheckResult> {
    if (this.memoryCache.has(tileId)) {
      return this.memoryCache.get(tileId)!;
    }

    // Overpass QL bounding box: (south, west, north, east)
    const bboxStr = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
    const overpassQuery = `[out:json][timeout:60];(
      way["landuse"="forest"](${bboxStr});
      relation["landuse"="forest"](${bboxStr});
      way["natural"="wood"](${bboxStr});
      relation["natural"="wood"](${bboxStr});
    );out geom;`;

    let lastError: any = null;

    for (let i = 0; i < OVERPASS_ENDPOINTS.length; i++) {
      const endpoint = OVERPASS_ENDPOINTS[i];
      const mirrorName = new URL(endpoint).hostname;
      const startTime = Date.now();

      console.log(`[LanduseService] [${tileId}] [Mirror ${i + 1}/${OVERPASS_ENDPOINTS.length} (${mirrorName})] Checking forest landcover (Bbox: ${bboxStr})...`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'ShroomRoom/1.0 (https://github.com/shroom-room)'
          },
          body: `data=${encodeURIComponent(overpassQuery)}`,
          signal: controller.signal
        });
        clearTimeout(timeout);

        const duration = Date.now() - startTime;

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          console.warn(`[LanduseService] [${tileId}] Mirror ${mirrorName} returned HTTP ${response.status} after ${duration}ms: ${errText.slice(0, 120)}`);
          lastError = new Error(`Overpass HTTP ${response.status} from ${mirrorName}`);
          continue; // Try next mirror
        }

        const data = await response.json();
        const elements = data.elements || [];
        console.log(`[LanduseService] [${tileId}] Mirror ${mirrorName} succeeded in ${duration}ms (${elements.length} forest elements found)`);

        if (elements.length === 0) {
          // Zero forest features found in bounding box
          const emptyResult: LanduseCheckResult = {
            isForest: false,
            forestCoveragePct: 0
          };
          this.memoryCache.set(tileId, emptyResult);
          return emptyResult;
        }

        // Extract polygon rings
        const forestPolygons: [number, number][][] = [];
        let totalPoints = 0;

        for (const el of elements) {
          if (el.geometry && el.geometry.length >= 3) {
            const ring: [number, number][] = el.geometry.map((pt: any) => [pt.lat, pt.lon]);
            forestPolygons.push(ring);
            totalPoints += ring.length;
          }
        }

        // Estimate approximate forest coverage percentage
        const estimatedCoveragePct = Math.min(95, Math.max(5, Math.floor(elements.length * 12)));

        const result: LanduseCheckResult = {
          isForest: true,
          forestCoveragePct: estimatedCoveragePct,
          forestPolygons
        };

        this.memoryCache.set(tileId, result);
        return result;

      } catch (err: any) {
        clearTimeout(timeout);
        const duration = Date.now() - startTime;
        const errMsg = err?.name === 'AbortError' ? 'Timeout (60s exceeded)' : (err?.message || String(err));
        console.warn(`[LanduseService] [${tileId}] Mirror ${mirrorName} failed after ${duration}ms: ${errMsg}`);
        lastError = err;
      }
    }

    throw new Error(`All Overpass mirrors failed for tile ${tileId}: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Checks if a specific coordinate lies within or adjacent to a forest feature
   *//*
  isPointInForest(lat: number, lon: number, polygons?: [number, number][][]): boolean {
    if (!polygons || polygons.length === 0) return true; // If forest was detected in tile, default to true

    for (const poly of polygons) {
      if (poly.length === 0) continue;

      // 1. Ray casting polygon containment
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0], yi = poly[i][1];
        const xj = poly[j][0], yj = poly[j][1];

        const intersect = ((yi > lon) !== (yj > lon)) &&
          (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      if (inside) return true;

      // 2. Proximity test (within ~250m of any forest feature vertex)
      for (let i = 0; i < poly.length; i++) {
        const dLat = poly[i][0] - lat;
        const dLon = poly[i][1] - lon;
        // ~0.003 degrees ≈ 250m
        if (dLat * dLat + dLon * dLon < 0.003 * 0.003) {
          return true;
        }
      }
    }
    return false;
  }*/
}
