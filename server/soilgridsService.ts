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
    const timeout = setTimeout(() => controller.abort(), 60000);

    let res: Response;
    try {
      res = await fetch(url, { signal: controller.signal });
    } catch (err: any) {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      const errMsg = err?.name === 'AbortError' ? 'Timeout (60s exceeded)' : (err?.message || String(err));
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
   * bilinear-interpolated soil chemistry for every individual cell
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

    try {
      const [sw, se, nw, ne] = await Promise.all([
        this.getSoilProperties(swCoords.lat, swCoords.lon),
        this.getSoilProperties(seCoords.lat, seCoords.lon),
        this.getSoilProperties(nwCoords.lat, nwCoords.lon),
        this.getSoilProperties(neCoords.lat, neCoords.lon)
      ]);

      return (r: number, c: number): SoilProperties => {
        // r goes 0 (north) to rows-1 (south)
        // ty: 0 at south, 1 at north
        const ty = 1 - (r / Math.max(1, rows - 1));
        // tx: 0 at west, 1 at east
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

    } catch (err) {
      // Fallback to center point if multiple queries fail
      const centerSoil = await this.getSoilProperties(
        (bounds.south + bounds.north) / 2,
        (bounds.west + bounds.east) / 2
      );
      return () => centerSoil;
    }
  }
}
