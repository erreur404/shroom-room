import { WeatherGridPoint } from '../types';

export interface ViewportBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export class WeatherService {
  private cache: Map<string, { data: WeatherGridPoint[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

  private getCacheKey(bounds: ViewportBounds, dateStr: string): string {
    const s = bounds.south.toFixed(2);
    const w = bounds.west.toFixed(2);
    const n = bounds.north.toFixed(2);
    const e = bounds.east.toFixed(2);
    return `${s},${w},${n},${e}_${dateStr}`;
  }

  async fetchWeatherForViewport(bounds: ViewportBounds, dateStr: string, steps = 8): Promise<WeatherGridPoint[]> {
    const cacheKey = this.getCacheKey(bounds, dateStr);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const lats: number[] = [];
    const lons: number[] = [];
    const dLat = (bounds.north - bounds.south) / Math.max(1, steps - 1);
    const dLon = (bounds.east - bounds.west) / Math.max(1, steps - 1);

    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < steps; j++) {
        lats.push(Number((bounds.south + i * dLat).toFixed(4)));
        lons.push(Number((bounds.west + j * dLon).toFixed(4)));
      }
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats.join(',')}&longitude=${lons.join(',')}&daily=precipitation_sum,soil_temperature_0_to_10cm_mean,soil_moisture_0_to_7cm_mean&past_days=14&timezone=auto`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawPoints = Array.isArray(data) ? data : [data];

    const results: WeatherGridPoint[] = rawPoints.map((ptData: any, index: number) => {
      const daily = ptData.daily || {};
      const precipArray: number[] = daily.precipitation_sum || [];
      const soilTemps: number[] = daily.soil_temperature_0_to_10cm_mean || [];

      // Sum past 14 days of rain
      const rain14DaysMm = precipArray.reduce((acc, v) => acc + (v || 0), 0);
      
      // Soil temperature calculations
      const currentSoilTempC = soilTemps.length > 0 ? soilTemps[soilTemps.length - 1] : 14.5;
      const pastWeekSlice = soilTemps.slice(0, Math.min(7, soilTemps.length));
      const pastWeekSoilTempC = pastWeekSlice.length > 0 
        ? pastWeekSlice.reduce((acc, v) => acc + (v || 0), 0) / pastWeekSlice.length 
        : currentSoilTempC + 2.0;

      return {
        lat: lats[index],
        lon: lons[index],
        rain14DaysMm: Math.round(rain14DaysMm * 10) / 10,
        currentSoilTempC: Math.round(currentSoilTempC * 10) / 10,
        pastWeekSoilTempC: Math.round(pastWeekSoilTempC * 10) / 10,
        weatherMultiplier: 1.0
      };
    });

    this.cache.set(cacheKey, { data: results, timestamp: Date.now() });
    return results;
  }

  /**
   * Interpolate weather values for a single arbitrary coordinate using Inverse Distance Weighting
   */
  interpolateAt(lat: number, lon: number, grid: WeatherGridPoint[]): { rain14DaysMm: number; currentSoilTempC: number; pastWeekSoilTempC: number } {
    if (!grid || grid.length === 0) {
      return { rain14DaysMm: 38.0, currentSoilTempC: 13.5, pastWeekSoilTempC: 16.0 };
    }

    let totalWeight = 0;
    let wRain = 0;
    let wCurrTemp = 0;
    let wPastTemp = 0;

    for (const pt of grid) {
      const distSq = Math.pow(lat - pt.lat, 2) + Math.pow(lon - pt.lon, 2) + 1e-6;
      const weight = 1.0 / distSq;
      totalWeight += weight;
      wRain += pt.rain14DaysMm * weight;
      wCurrTemp += pt.currentSoilTempC * weight;
      wPastTemp += pt.pastWeekSoilTempC * weight;
    }

    return {
      rain14DaysMm: Math.round((wRain / totalWeight) * 10) / 10,
      currentSoilTempC: Math.round((wCurrTemp / totalWeight) * 10) / 10,
      pastWeekSoilTempC: Math.round((wPastTemp / totalWeight) * 10) / 10
    };
  }
}
