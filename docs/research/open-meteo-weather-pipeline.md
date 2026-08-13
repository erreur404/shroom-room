# Open-Meteo Weather Integration & Dynamic Fruiting Trigger Pipeline

This document defines the architecture and client/server query pipeline for retrieving real-time & recent meteorological data from Open-Meteo and computing the dynamic **Probability Map** overlay across user map viewports.

---

## 1. Open-Meteo API Specifications & Endpoint Configuration

### Target API Endpoint
- **Base URL**: `https://api.open-meteo.com/v1/forecast`
- **License**: CC-BY 4.0 (Free open tier supports up to 10,000 calls/day, no API key required).
- **Spatial Resolution**: ~9–11 km ($0.1^\circ$) using ECMWF IFS / DWD ICON-EU models across Western Europe (Germany, France).

### Target Meteorological Variables
For fungal fruiting triggers (as defined in `docs/research/mushroom-growth-parameters.md`):

1. `precipitation_sum` (mm): Daily accumulated rainfall. Used to calculate 14-day cumulative moisture pulses.
2. `soil_temperature_0_to_10cm_mean` (°C) or `soil_temperature_6cm` (°C): Topsoil temperature at mycelial depth. Used to detect the essential autumn thermal drop (cold shock).
3. `soil_moisture_0_to_7cm_mean` ($m^3/m^3$): Volumetric soil water fraction.
4. `temperature_2m_mean` (°C), `temperature_2m_min` (°C): Ambient air temperatures.

### Multi-Location Query Syntax
Open-Meteo supports querying up to **1,000 coordinate points in a single HTTP request** using comma-separated `latitude` and `longitude` arrays and `past_days=14`:

```http
GET https://api.open-meteo.com/v1/forecast?latitude=52.1,52.3,52.5&longitude=9.1,9.4,9.7&daily=precipitation_sum,soil_temperature_0_to_10cm_mean,soil_moisture_0_to_7cm_mean&past_days=14&timezone=auto
```

---

## 2. Viewport Sampling & Grid Generation

When a user navigates the interactive map, the client generates a spatial sample grid spanning the current bounding box:

```
[West, North] ─── • ─── • ─── • ─── • ─── [East, North]
      │           │     │     │     │           │
      • ───────── • ─── • ─── • ─── • ───────── •
      │           │     │     │     │           │
      • ───────── • ─── • ─── • ─── • ───────── •
      │           │     │     │     │           │
[West, South] ─── • ─── • ─── • ─── • ─── [East, South]
```

### Sampling Strategy
1. **Grid Dimensions**: An $8 \times 8$ to $12 \times 12$ regular grid (64–144 points) across the map viewport.
2. **Spacing**: Clamped to a minimum spacing of $\sim 0.08^\circ$ ($\approx 9\text{km}$) to match the native resolution of the weather model and prevent redundant API queries.
3. **Caching**: Client-side LRU cache (TTL 3 hours) keyed by tile/viewport hash so zooming and panning within the same region avoids redundant fetches.

---

## 3. Fruiting Trigger Scoring Algorithm (Per Point)

Given 14 days of weather history for each grid point $i$:

### 1. Cumulative Rainfall Index ($I_{\text{rain}} \in [0, 1]$)
$$R_{14} = \sum_{d=t-14}^{t} \text{precipitation\_sum}_d$$

- For *Boletus edulis* & *Cantharellus cibarius*, minimum rain pulse threshold is $\ge 25\text{mm}$, with optimal flush trigger at $\ge 50\text{mm}$:
$$I_{\text{rain}} = \min\left(1.0, \max\left(0.0, \frac{R_{14} - 15.0}{35.0}\right)\right)$$

### 2. Soil Temperature Shock Index ($I_{\text{temp}} \in [0, 1]$)
- Optimal soil temperature window for autumn fruiting: $10^\circ\text{C} \le T_{\text{soil}} \le 18^\circ\text{C}$.
- Cold-shock trigger: Prior 7-day average drop of $\ge 2.5^\circ\text{C}$ stimulates primordia initiation:
$$T_{\text{curr}} = \text{soil\_temperature}_{t}$$
$$T_{\text{prev}} = \frac{1}{7}\sum_{d=t-14}^{t-7} \text{soil\_temperature}_d$$
$$\Delta T = T_{\text{prev}} - T_{\text{curr}}$$

$$I_{\text{temp}} = \text{GaussianPenalty}(T_{\text{curr}}, T_{\text{opt}}=14^\circ\text{C}, \sigma=4.0) \times \left(0.6 + 0.4 \cdot \min\left(1.0, \max\left(0.0, \frac{\Delta T}{3.0}\right)\right)\right)$$

### 3. Combined Weather Fruiting Multiplier ($M_{\text{weather}} \in [0, 1]$)
$$M_{\text{weather}} = I_{\text{rain}}^{0.6} \times I_{\text{temp}}^{0.4}$$

---

## 4. Client-Side Spatial Interpolation & Overlay Rendering

To render the dynamic **Probability Map** on top of the static **Suitability Map**:

1. **Interpolation Method**: Inverse Distance Weighting (IDW) or Thin Plate Spline on an HTML5 `<canvas>` layer:
   - For every pixel $(u, v)$ on screen:
     $$M_{\text{interp}}(u, v) = \frac{\sum_{i=1}^{N} w_i M_i}{\sum_{i=1}^{N} w_i}, \quad w_i = \frac{1}{\text{dist}((u, v), (x_i, y_i))^2 + \epsilon}$$
2. **Final Probability Composition**:
   $$P_{\text{final}}(u, v) = S_{\text{static}}(u, v) \times M_{\text{interp}}(u, v) \times \text{SeasonActive}(\text{species}, \text{date})$$
3. **Canvas Shader / Color Ramp**:
   - Scores $< 20\%$: Transparent
   - $20\% - 50\%$: Pale Yellow / Amber ($\alpha = 0.35$)
   - $50\% - 80\%$: Bright Chartreuse Green ($\alpha = 0.55$)
   - $80\% - 100\%$: Deep Glowing Emerald ($\alpha = 0.75$)

---

## 5. Python & TypeScript Reference Implementations

### TypeScript / Browser Viewport Query Example
```typescript
interface ViewportBBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export async function fetchViewportWeatherTriggers(bbox: ViewportBBox, steps: number = 8) {
  const lats: number[] = [];
  const lons: number[] = [];
  
  const dLat = (bbox.north - bbox.south) / (steps - 1);
  const dLon = (bbox.east - bbox.west) / (steps - 1);
  
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps; j++) {
      lats.push(Number((bbox.south + i * dLat).toFixed(4)));
      lons.push(Number((bbox.west + j * dLon).toFixed(4)));
    }
  }
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats.join(',')}&longitude=${lons.join(',')}&daily=precipitation_sum,soil_temperature_0_to_10cm_mean,soil_moisture_0_to_7cm_mean&past_days=14&timezone=auto`;
  
  const res = await fetch(url);
  const data = await res.json();
  const results = Array.isArray(data) ? data : [data];
  
  return results.map((pointData: any, idx: number) => {
    const rain14 = pointData.daily.precipitation_sum.reduce((a: number, b: number) => a + b, 0);
    const temps = pointData.daily.soil_temperature_0_to_10cm_mean;
    const currentTemp = temps[temps.length - 1];
    const prevTempMean = temps.slice(0, 7).reduce((a: number, b: number) => a + b, 0) / 7;
    const tempDrop = Math.max(0, prevTempMean - currentTemp);
    
    // Trigger scoring
    const rainScore = Math.min(1.0, Math.max(0.0, (rain14 - 15.0) / 35.0));
    const tempScore = Math.exp(-Math.pow(currentTemp - 14.0, 2) / (2 * 16.0)) * (0.6 + 0.4 * Math.min(1.0, tempDrop / 3.0));
    const weatherMultiplier = Math.pow(rainScore, 0.6) * Math.pow(tempScore, 0.4);
    
    return {
      lat: lats[idx],
      lon: lons[idx],
      rain14,
      currentTemp,
      weatherMultiplier
    };
  });
}
```
