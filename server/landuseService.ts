import { TileBounds } from './tileConfig';

export interface ForestFeature {
  ring: [number, number][]; // [lat, lon]
  dominantGenus: number;
  tags?: Record<string, string>;
}

export interface LanduseCheckResult {
  isForest: boolean;
  forestCoveragePct: number;
  forestPolygons?: [number, number][][]; // Array of polygon coordinate rings [lat, lon]
  forestFeatures?: ForestFeature[];
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

function parseGenusFromOSMTags(tags: Record<string, string> | undefined, lat: number, lon: number): number {
  if (!tags) return defaultGenusByRegion(lat, lon);

  const str = `${tags.species || ''} ${tags.genus || ''} ${tags.trees || ''} ${tags.taxon || ''} ${tags.name || ''} ${tags.description || ''}`.toLowerCase();

  if (str.includes('quercus') || str.includes('oak') || str.includes('chêne') || str.includes('chene') || str.includes('eiche')) {
    return 4; // Oak (Quercus)
  }
  if (str.includes('fagus') || str.includes('beech') || str.includes('hêtre') || str.includes('hetre') || str.includes('buche')) {
    return 3; // Beech (Fagus)
  }
  if (str.includes('picea') || str.includes('spruce') || str.includes('épicéa') || str.includes('epicea') || str.includes('fichte')) {
    return 1; // Spruce (Picea)
  }
  if (str.includes('pinus') || str.includes('pine') || str.includes('pin') || str.includes('kiefer') || str.includes('foehre') || str.includes('föhre')) {
    return 2; // Pine (Pinus)
  }
  if (str.includes('betula') || str.includes('birch') || str.includes('bouleau') || str.includes('birke')) {
    return 6; // Birch / Deciduous
  }
  if (str.includes('larix') || str.includes('larch') || str.includes('mélèze') || str.includes('meleze') || str.includes('laerche') || str.includes('lärche')) {
    return 0; // Larch (Larix)
  }
  if (str.includes('hutewald') || str.includes('schäferei') || str.includes('schaferei')) {
    // Historic wood pastures in Northern Germany (e.g. Neustädter Holz) are mixed Oak & Scots Pine
    return (lat > 52.0 && lon > 9.5 && lon < 10.5) ? 4 : 3;
  }

  const leafType = (tags['leaf_type'] || '').toLowerCase();
  const wood = (tags['wood'] || '').toLowerCase();

  if (leafType === 'needleleaved' || wood === 'conifer') {
    return (lat > 51.5 && lon > 10.0) ? 1 : 2; // Spruce in high elevation/east, Pine elsewhere
  }
  if (leafType === 'broadleaved' || wood === 'deciduous') {
    // Temperate Atlantic / Western Europe deciduous woods are primarily Oak & Beech
    return (Math.abs(Math.sin(lat * 123.45 + lon * 678.9)) > 0.4) ? 4 : 3;
  }
  if (leafType === 'mixed') {
    // In Lüneburg Heath & Aller valley sand dunes (Celle, Gifhorn), mixed stands are Oak & Scots Pine
    if (lat >= 52.4 && lat <= 53.4 && lon >= 9.6 && lon <= 10.8) {
      return (Math.abs(Math.cos(lat * 89.1 + lon * 23.4)) > 0.4) ? 4 : 2; // Oak (4) & Pine (2)
    }
    return (Math.abs(Math.cos(lat * 89.1 + lon * 23.4)) > 0.5) ? 4 : 2;
  }

  return defaultGenusByRegion(lat, lon);
}

function defaultGenusByRegion(lat: number, lon: number): number {
  if (lat >= 52.50 && lat <= 52.80 && lon >= 9.85 && lon <= 10.25) {
    // Celle / Aller valley / Südheide dunes (Neustädter Holz): Scots Pine & Oak
    return (Math.abs(Math.sin(lat * 45 + lon * 78)) > 0.4) ? 2 : 4;
  }
  if (lat >= 51.70 && lat <= 51.90 && lon >= 10.35 && lon <= 10.65) {
    return (lat > 51.78) ? 1 : 3; // Harz: Spruce / Beech
  }
  if (lat >= 53.08 && lat <= 53.22 && lon >= 10.75 && lon <= 10.95) {
    return (lon > 10.85) ? 4 : 3; // Göhrde: Oak / Beech
  }
  if (lat >= 53.10 && lat <= 53.25 && lon >= 9.85 && lon <= 10.15) {
    return 2; // Lüneburg: Scots Pine
  }
  if (lat >= 47.5 && lat <= 49.0 && lon >= -4.8 && lon <= -1.0) {
    // Brittany / Armorican Massif (e.g. Brocéliande, Huelgoat, Léguer valley)
    return (Math.abs(Math.sin(lat * 77 + lon * 33)) > 0.35) ? 4 : 3; // Oak (4) & Beech (3)
  }
  return 4; // Default Oak
}

/**
 * Reconstructs closed boundary polygon rings from an OSM multipolygon relation.
 * Handles both standalone closed outer ways and stitched chains of open outer segments.
 */
function assembleRingsFromRelation(rel: any): [number, number][][] {
  const rings: [number, number][][] = [];
  if (!rel.members || !Array.isArray(rel.members)) return rings;

  // Exterior boundaries have role 'outer' (or empty)
  const outerMembers = rel.members.filter(
    (m: any) => (m.role === 'outer' || !m.role) && m.geometry && Array.isArray(m.geometry) && m.geometry.length >= 2
  );

  const openSegments: [number, number][][] = [];

  for (const m of outerMembers) {
    const geom: [number, number][] = m.geometry.map((pt: any) => [pt.lat, pt.lon]);
    const first = geom[0];
    const last = geom[geom.length - 1];

    if (Math.abs(first[0] - last[0]) < 1e-6 && Math.abs(first[1] - last[1]) < 1e-6 && geom.length >= 3) {
      rings.push(geom);
    } else {
      openSegments.push(geom);
    }
  }

  // Stitch unclosed outer segments into closed polygon rings
  while (openSegments.length > 0) {
    let currentRing = openSegments.shift()!;
    let extended = true;

    while (extended && openSegments.length > 0) {
      extended = false;
      const startPt = currentRing[0];
      const endPt = currentRing[currentRing.length - 1];

      // Check if ring is already closed
      if (Math.abs(startPt[0] - endPt[0]) < 1e-6 && Math.abs(startPt[1] - endPt[1]) < 1e-6 && currentRing.length >= 3) {
        break;
      }

      for (let i = 0; i < openSegments.length; i++) {
        const seg = openSegments[i];
        const segStart = seg[0];
        const segEnd = seg[seg.length - 1];
        const eps = 1e-5;

        if (Math.hypot(endPt[0] - segStart[0], endPt[1] - segStart[1]) < eps) {
          currentRing = currentRing.concat(seg.slice(1));
          openSegments.splice(i, 1);
          extended = true;
          break;
        } else if (Math.hypot(endPt[0] - segEnd[0], endPt[1] - segEnd[1]) < eps) {
          currentRing = currentRing.concat(seg.slice(0, -1).reverse());
          openSegments.splice(i, 1);
          extended = true;
          break;
        } else if (Math.hypot(startPt[0] - segEnd[0], startPt[1] - segEnd[1]) < eps) {
          currentRing = seg.slice(0, -1).concat(currentRing);
          openSegments.splice(i, 1);
          extended = true;
          break;
        } else if (Math.hypot(startPt[0] - segStart[0], startPt[1] - segStart[1]) < eps) {
          currentRing = seg.slice(1).reverse().concat(currentRing);
          openSegments.splice(i, 1);
          extended = true;
          break;
        }
      }
    }

    if (currentRing.length >= 3) {
      rings.push(currentRing);
    }
  }

  return rings;
}

export class LanduseService {
  private memoryCache: Map<string, LanduseCheckResult> = new Map();

  /**
   * Tier-1 Landuse Gating Check
   * Queries OpenStreetMap Overpass / landcover masks to verify if any forest/woodland exists in the tile.
   * Recognizes forests, woods, wood pastures (Hutewald), and stands with leaf_type.
   * Supports both simple ways and complex multipolygon relations.
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
      way["leaf_type"](${bboxStr});
      relation["leaf_type"](${bboxStr});
      way["wood"](${bboxStr});
      relation["wood"](${bboxStr});
      way["landcover"="trees"](${bboxStr});
      relation["landcover"="trees"](${bboxStr});
      way["meadow"="wood_pasture"](${bboxStr});
      relation["meadow"="wood_pasture"](${bboxStr});
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
        console.log(`[LanduseService] [${tileId}] Mirror ${mirrorName} succeeded in ${duration}ms (${elements.length} raw forest elements found)`);

        if (elements.length === 0) {
          // Zero forest features found in bounding box
          const emptyResult: LanduseCheckResult = {
            isForest: false,
            forestCoveragePct: 0,
            forestPolygons: [],
            forestFeatures: []
          };
          this.memoryCache.set(tileId, emptyResult);
          return emptyResult;
        }

        // Extract polygon rings from ways and multipolygon relations
        const forestPolygons: [number, number][][] = [];
        const forestFeatures: ForestFeature[] = [];

        for (const el of elements) {
          if (el.type === 'way' && el.geometry && el.geometry.length >= 3) {
            const ring: [number, number][] = el.geometry.map((pt: any) => [pt.lat, pt.lon]);
            const dominantGenus = parseGenusFromOSMTags(el.tags, ring[0][0], ring[0][1]);
            forestPolygons.push(ring);
            forestFeatures.push({
              ring,
              dominantGenus,
              tags: el.tags || {}
            });
          } else if (el.type === 'relation') {
            const rings = assembleRingsFromRelation(el);
            for (const ring of rings) {
              const dominantGenus = parseGenusFromOSMTags(el.tags, ring[0][0], ring[0][1]);
              forestPolygons.push(ring);
              forestFeatures.push({
                ring,
                dominantGenus,
                tags: el.tags || {}
              });
            }
          }
        }

        console.log(`[LanduseService] [${tileId}] Extracted ${forestFeatures.length} closed forest polygon rings from OSM`);

        if (forestFeatures.length === 0) {
          const emptyResult: LanduseCheckResult = {
            isForest: false,
            forestCoveragePct: 0,
            forestPolygons: [],
            forestFeatures: []
          };
          this.memoryCache.set(tileId, emptyResult);
          return emptyResult;
        }

        const estimatedCoveragePct = Math.min(95, Math.max(5, Math.floor(forestFeatures.length * 5)));

        const result: LanduseCheckResult = {
          isForest: true,
          forestCoveragePct: estimatedCoveragePct,
          forestPolygons,
          forestFeatures
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
   * Spatial check for an individual cell coordinate:
   * 1. Checks if point is inside any OSM forest polygon (Ray-casting containment).
   * 2. For mixed stands (leaf_type=mixed), dynamically selects dominant genus for the cell location.
   * 3. If outside, computes real distance in meters to the nearest forest edge.
   */
  evaluateCellForest(
    lat: number,
    lon: number,
    features?: ForestFeature[]
  ): { isForest: boolean; dominantGenus: number; distToHostMeters: number } {
    if (!features || features.length === 0) {
      return { isForest: false, dominantGenus: 7, distToHostMeters: 500 };
    }

    // 1. Ray-casting point-in-polygon check for containment
    for (const feature of features) {
      const poly = feature.ring;
      if (poly.length < 3) continue;

      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0], yi = poly[i][1];
        const xj = poly[j][0], yj = poly[j][1];

        const intersect = ((yi > lon) !== (yj > lon)) &&
          (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }

      if (inside) {
        // If this stand is explicitly tagged mixed, compute fine-scale spatial mosaic
        let cellGenus = feature.dominantGenus;
        if (feature.tags?.leaf_type === 'mixed') {
          cellGenus = parseGenusFromOSMTags(feature.tags, lat, lon);
        }

        return {
          isForest: true,
          dominantGenus: cellGenus,
          distToHostMeters: 5
        };
      }
    }

    // 2. Proximity check: Calculate Euclidean distance in meters to the closest forest vertex
    let minDistanceMeters = 999999;
    let closestGenus = 4; // Default Oak

    const metersPerLat = 111320;
    const metersPerLon = 111320 * Math.cos(lat * (Math.PI / 180));

    for (const feature of features) {
      for (let i = 0; i < feature.ring.length; i++) {
        const dLatM = (feature.ring[i][0] - lat) * metersPerLat;
        const dLonM = (feature.ring[i][1] - lon) * metersPerLon;
        const dist = Math.sqrt(dLatM * dLatM + dLonM * dLonM);

        if (dist < minDistanceMeters) {
          minDistanceMeters = dist;
          closestGenus = feature.dominantGenus;
        }
      }
    }

    const roundedDist = Math.round(minDistanceMeters);

    if (roundedDist <= 25) {
      // Within forest margin canopy drip line (<= 25m)
      return {
        isForest: true,
        dominantGenus: closestGenus,
        distToHostMeters: Math.max(5, roundedDist)
      };
    }

    // Outside forest in agricultural fields / urban land
    return {
      isForest: false,
      dominantGenus: 7, // Non-forest
      distToHostMeters: roundedDist
    };
  }
}

