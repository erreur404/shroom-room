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

    // Open-Meteo parameters:
    // daily supports precipitation_sum, temperature_2m_mean
    // hourly supports soil_temperature_0cm, soil_temperature_6cm
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats.join(',')}&longitude=${lons.join(',')}&daily=precipitation_sum,temperature_2m_mean&hourly=soil_temperature_0cm,soil_temperature_6cm&past_days=14&timezone=auto`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (err: any) {
      clearTimeout(timeout);
      throw new Error(`Open-Meteo network error: ${err?.message || err}`);
    }
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Open-Meteo HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`Open-Meteo error: ${data.reason || 'Unknown error'}`);
    }

    const rawPoints = Array.isArray(data) ? data : [data];

    const results: WeatherGridPoint[] = rawPoints.map((ptData: any, index: number) => {
      const daily = ptData.daily || {};
      const hourly = ptData.hourly || {};
      const precipArray: number[] = daily.precipitation_sum || [];
      const dailyTemps: number[] = daily.temperature_2m_mean || [];
      const hourlySoil: number[] = hourly.soil_temperature_6cm || hourly.soil_temperature_0cm || [];

      // Sum past 14 days of rain (first 14 entries in precipitation_sum)
      const pastPrecip = precipArray.slice(0, 14);
      const rain14DaysMm = pastPrecip.reduce((acc, v) => acc + (v || 0), 0);
      
      // Soil temperature calculations (past 14 days of hourly data = 14 * 24 = 336 values)
      let currentSoilTempC = 14.5;
      let pastWeekSoilTempC = 16.5;

      if (hourlySoil.length >= 14 * 24) {
        const past14Slice = hourlySoil.slice(0, 14 * 24);
        currentSoilTempC = past14Slice[past14Slice.length - 1] ?? 14.5;
        const pastWeekSlice = hourlySoil.slice(0, 7 * 24);
        pastWeekSoilTempC = pastWeekSlice.reduce((acc, v) => acc + (v || 0), 0) / Math.max(1, pastWeekSlice.length);
      } else if (dailyTemps.length > 0) {
        const past14Temps = dailyTemps.slice(0, 14);
        currentSoilTempC = past14Temps[past14Temps.length - 1] ?? 14.5;
        const pastWeekTemps = past14Temps.slice(0, Math.min(7, past14Temps.length));
        pastWeekSoilTempC = pastWeekTemps.reduce((acc, v) => acc + (v || 0), 0) / Math.max(1, pastWeekTemps.length);
      }

      return {
        lat: lats[index] ?? 0,
        lon: lons[index] ?? 0,
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
