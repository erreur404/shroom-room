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
}
