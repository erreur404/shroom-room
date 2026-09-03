export interface SoilProperties {
  soilPH: number;
  clayPct: number;
  sandPct: number;
  socDgKg: number;
}

export class SoilgridsService {
  private cache: Map<string, SoilProperties> = new Map();

  /**
   * Queries SoilGrids v2.0 REST API for topsoil properties (0-5cm)
   */
  async getSoilProperties(lat: number, lon: number): Promise<SoilProperties> {
    const key = `${lat.toFixed(3)}_${lon.toFixed(3)}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=phh2o&property=clay&property=sand&property=soc&depth=0-5cm`;
    const startTime = Date.now();
    console.log(`[SoilgridsService] [${key}] Querying SoilGrids chemistry for coordinates (${lat.toFixed(3)}, ${lon.toFixed(3)})...`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

    let res: Response;
    try {
      res = await fetch(url, { signal: controller.signal });
    } catch (err: any) {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      const errMsg = err?.name === 'AbortError' ? 'Timeout (25s exceeded)' : (err?.message || String(err));
      console.warn(`[SoilgridsService] [${key}] SoilGrids request failed after ${duration}ms: ${errMsg}`);
      throw new Error(`SoilGrids request failed: ${errMsg}`);
    }
    clearTimeout(timeout);

    const duration = Date.now() - startTime;
    if (!res.ok) {
      console.warn(`[SoilgridsService] [${key}] SoilGrids returned HTTP ${res.status} after ${duration}ms`);
      throw new Error(`SoilGrids HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log(`[SoilgridsService] [${key}] SoilGrids responded in ${duration}ms (Status 200)`);
    const layers = data?.properties?.layers || [];

    let rawPH = 50;
    let rawClay = 200;
    let rawSand = 550;
    let rawSOC = 240;

    for (const layer of layers) {
      const meanVal = layer?.depths?.[0]?.values?.mean;
      if (meanVal !== undefined && meanVal !== null) {
        if (layer.name === 'phh2o') rawPH = meanVal;
        if (layer.name === 'clay') rawClay = meanVal;
        if (layer.name === 'sand') rawSand = meanVal;
        if (layer.name === 'soc') rawSOC = meanVal;
      }
    }

    const props: SoilProperties = {
      soilPH: Math.round((rawPH / 10.0) * 10) / 10,
      clayPct: Math.round(rawClay / 10.0),
      sandPct: Math.round(rawSand / 10.0),
      socDgKg: Math.round(rawSOC)
    };

    this.cache.set(key, props);
    return props;
  }

  /**
   * Samples SoilGrids at 4 spatial quadrants across the tile and provides
   * bilinear-interpolated soil chemistry for every individual cell.
   * If any quadrant fails or times out, seamlessly infers from successful quadrants
   * or regional soil baseline.
   */
  async sampleTileSoilGrid(
    bounds: { south: number; west: number; north: number; east: number },
    rows: number,
    cols: number
  ): Promise<(r: number, c: number) => SoilProperties> {
    const dLat = bounds.north - bounds.south;
    const dLon = bounds.east - bounds.west;

    // 4 quadrant coordinates across the tile
    const swCoords = { lat: bounds.south + 0.25 * dLat, lon: bounds.west + 0.25 * dLon };
    const seCoords = { lat: bounds.south + 0.25 * dLat, lon: bounds.west + 0.75 * dLon };
    const nwCoords = { lat: bounds.south + 0.75 * dLat, lon: bounds.west + 0.25 * dLon };
    const neCoords = { lat: bounds.south + 0.75 * dLat, lon: bounds.west + 0.75 * dLon };

    const results = await Promise.allSettled([
      this.getSoilProperties(swCoords.lat, swCoords.lon),
      this.getSoilProperties(seCoords.lat, seCoords.lon),
      this.getSoilProperties(nwCoords.lat, nwCoords.lon),
      this.getSoilProperties(neCoords.lat, neCoords.lon)
    ]);

    const successfulProps: SoilProperties[] = [];
    results.forEach(r => {
      if (r.status === 'fulfilled') {
        successfulProps.push(r.value);
      }
    });

    // Default regional baseline fallback if SoilGrids is unreachable
    const midLat = (bounds.south + bounds.north) / 2;
    const midLon = (bounds.west + bounds.east) / 2;
    const defaultBaseline = this.getRegionalSoilBaseline(midLat, midLon);

    const fallbackProp: SoilProperties = successfulProps.length > 0
      ? {
          soilPH: Number((successfulProps.reduce((a, b) => a + b.soilPH, 0) / successfulProps.length).toFixed(1)),
          clayPct: Math.round(successfulProps.reduce((a, b) => a + b.clayPct, 0) / successfulProps.length),
          sandPct: Math.round(successfulProps.reduce((a, b) => a + b.sandPct, 0) / successfulProps.length),
          socDgKg: Math.round(successfulProps.reduce((a, b) => a + b.socDgKg, 0) / successfulProps.length)
        }
      : defaultBaseline;

    const sw = results[0].status === 'fulfilled' ? results[0].value : fallbackProp;
    const se = results[1].status === 'fulfilled' ? results[1].value : fallbackProp;
    const nw = results[2].status === 'fulfilled' ? results[2].value : fallbackProp;
    const ne = results[3].status === 'fulfilled' ? results[3].value : fallbackProp;

    console.log(`[SoilgridsService] Bilinear grid established with ${successfulProps.length}/4 live quadrant samples (Tile avg pH: ${fallbackProp.soilPH}, Sand: ${fallbackProp.sandPct}%, Clay: ${fallbackProp.clayPct}%, SOC: ${fallbackProp.socDgKg})`);

    return (r: number, c: number): SoilProperties => {
      const ty = 1 - (r / Math.max(1, rows - 1));
      const tx = c / Math.max(1, cols - 1);

      const interp = (vSW: number, vSE: number, vNW: number, vNE: number) => {
        const bottom = vSW * (1 - tx) + vSE * tx;
        const top = vNW * (1 - tx) + vNE * tx;
        return bottom * (1 - ty) + top * ty;
      };

      return {
        soilPH: Number(interp(sw.soilPH, se.soilPH, nw.soilPH, ne.soilPH).toFixed(1)),
        clayPct: Math.round(interp(sw.clayPct, se.clayPct, nw.clayPct, ne.clayPct)),
        sandPct: Math.round(interp(sw.sandPct, se.sandPct, nw.sandPct, ne.sandPct)),
        socDgKg: Math.round(interp(sw.socDgKg, se.socDgKg, nw.socDgKg, ne.socDgKg))
      };
    };
  }

  private getRegionalSoilBaseline(lat: number, lon: number): SoilProperties {
    if (lat >= 52.4 && lat <= 53.4 && lon >= 9.6 && lon <= 10.8) {
      // Aller valley / Südheide / Lüneburg dunes: acidic sandy soils (Podzol / Arenosol)
      return { soilPH: 5.4, sandPct: 72, clayPct: 13, socDgKg: 680 };
    }
    if (lat >= 51.6 && lat <= 52.0 && lon >= 10.2 && lon <= 10.8) {
      // Harz Mountains: acidic Cambisols
      return { soilPH: 4.8, sandPct: 45, clayPct: 22, socDgKg: 950 };
    }
    if (lat >= 47.5 && lat <= 49.0 && lon >= -4.8 && lon <= -1.0) {
      // Brittany: acidic granite / schists
      return { soilPH: 5.1, sandPct: 40, clayPct: 26, socDgKg: 820 };
    }
    return { soilPH: 5.5, sandPct: 50, clayPct: 20, socDgKg: 500 };
  }
}
