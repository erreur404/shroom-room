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
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`SoilGrids HTTP ${res.status}`);
    }

    const data = await res.json();
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
