# Interactive Map UI, Trail Layers & GPX Export Specification

This document specifies the frontend architecture, mapping library, visual color-blending paradigm (Red + Blue = Purple), and GPX waypoint export engine for the Shroom Room web application.

---

## 1. Technology Stack & Mapping Engine

### Architecture
- **Bundler / Framework**: Vite + TypeScript (Vanilla JS or React).
- **Mapping Engine**: Leaflet (or MapLibre GL) with dual HTML5 Canvas raster/vector overlay layers.
- **Styling**: Modern, responsive dark-mode UI with glassmorphism inspection HUD.

### Base Map & Topographic Trail Layers
To ensure foragers can identify forest paths, fire roads, and elevation contours before entering the field:

1. **Primary Basemap — OpenTopoMap**:
   - Tile URL: `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`
   - Attributes: High-visibility contour lines, hillshading, and forestry land cover.
2. **Alternative Basemap — CyclOSM / OSM Outdoors**:
   - Tile URL: `https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png`
   - Attributes: Dedicated highlighting of hiking paths (`highway=footway`, `highway=path`, `highway=track`), elevation markers, and forest tracks.

---

## 2. Dual Color-Blending Visual Paradigm

Rather than displaying a single arbitrary gradient, Shroom Room employs a two-color cognitive synthesis model:

```text
┌─────────────────────────────────────────────────────────────┐
│                    DUAL OVERLAY PARADIGM                    │
├─────────────────────────────────────────────────────────────┤
│ 1. STATIC SUITABILITY (Red):                                │
│    - Color: RGB(239, 68, 68)                                │
│    - Opacity: 0.30 + 0.40 * S(x, y)                         │
│    - Meaning: Favorable habitat (soil pH, host trees).       │
│               "Red = Great spot, waiting for rain"          │
│                                                             │
│ 2. DYNAMIC PROBABILITY / WEATHER TRIGGER (Blue):            │
│    - Color: RGB(59, 130, 246)                               │
│    - Opacity: 0.30 + 0.40 * M_weather(x, y)                 │
│    - Meaning: Active rain pulse + soil temperature trigger. │
│                                                             │
│ 3. COLOR SYNTHESIS (Red + Blue Overlap):                    │
│    - PURPLE / MAGENTA = PRIME FORAGING HOTSPOT              │
│    - Pure Blue = Rain fell, but wrong habitat (skip)        │
│    - Pure Red  = Ideal habitat, but dormant / dry           │
└─────────────────────────────────────────────────────────────┘
```

### Canvas Compositing Implementation
The dual canvas layers use standard alpha blending or `globalCompositeOperation = 'multiply'` / CSS `mix-blend-mode: multiply` on the map pane so that when both layers are active, overlapping pixels naturally saturate into deep, glowing purple.

---

## 3. Interactive Waypoint Planner & GPX Export Engine

### Workflow
1. User enables **"Waypoint Mode"** and clicks on purple/red hotspots along forest trails.
2. An interactive marker is dropped with an inspection card showing:
   - GPS Coordinates (WGS84 Lat/Lon and UTM grid).
   - Local Soil pH (from SoilGrids).
   - Dominant Host Tree genus and distance.
   - 14-day rainfall sum ($R_{14}$) and soil temperature.
   - Computed Suitability % and Probability %.
3. Route line is drawn connecting waypoints with cumulative distance (km).
4. User clicks **"Export to GPX"** to download a standardized GPS Exchange Format (GPX 1.1) file compatible with Garmin handhelds, Komoot, OsmAnd, and Gaia GPS.

### GPX 1.1 Generation Code (TypeScript)

```typescript
export interface ForagingWaypoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevationMeters?: number;
  suitabilityScore: number;
  probabilityScore: number;
  soilPH: number;
  dominantTree: string;
  rain14DaysMm: number;
}

export function generateGPX(waypoints: ForagingWaypoint[], trackName = "Shroom_Route"): string {
  const timeISO = new Date().toISOString();
  
  let gpx = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  gpx += `<gpx version="1.1" creator="ShroomRoom - https://github.com/shroom-room"\n`;
  gpx += `     xmlns="http://www.topografix.com/GPX/1/1"\n`;
  gpx += `     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
  gpx += `     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">\n`;
  gpx += `  <metadata>\n`;
  gpx += `    <name>${trackName}</name>\n`;
  gpx += `    <time>${timeISO}</time>\n`;
  gpx += `  </metadata>\n`;

  // Waypoints
  waypoints.forEach((wpt, index) => {
    gpx += `  <wpt lat="${wpt.lat.toFixed(6)}" lon="${wpt.lon.toFixed(6)}">\n`;
    if (wpt.elevationMeters !== undefined) {
      gpx += `    <ele>${wpt.elevationMeters.toFixed(1)}</ele>\n`;
    }
    gpx += `    <name>${wpt.name || `Point ${index + 1}`}</name>\n`;
    gpx += `    <desc>Suitability: ${wpt.suitabilityScore}% | Probability: ${wpt.probabilityScore}% | pH: ${wpt.soilPH.toFixed(1)} | Tree: ${wpt.dominantTree} | 14d Rain: ${wpt.rain14DaysMm}mm</desc>\n`;
    gpx += `    <sym>Mushroom</sym>\n`;
    gpx += `  </wpt>\n`;
  });

  // Track (connecting the route)
  if (waypoints.length > 1) {
    gpx += `  <trk>\n`;
    gpx += `    <name>${trackName} Path</name>\n`;
    gpx += `    <trkseg>\n`;
    waypoints.forEach((wpt) => {
      gpx += `      <trkpt lat="${wpt.lat.toFixed(6)}" lon="${wpt.lon.toFixed(6)}">\n`;
      if (wpt.elevationMeters !== undefined) {
        gpx += `        <ele>${wpt.elevationMeters.toFixed(1)}</ele>\n`;
      }
      gpx += `      </trkpt>\n`;
    });
    gpx += `    </trkseg>\n`;
    gpx += `  </trk>\n`;
  }

  gpx += `</gpx>`;
  return gpx;
}

export function downloadGPXFile(gpxString: string, filename = "shroom_route.gpx") {
  const blob = new Blob([gpxString], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

---

## 4. Test Region Quick-Jump Presets

The UI provides instant jump buttons to premier mushroom foraging forests in the initial test regions:

1. **Niedersachsen (Germany)**:
   - **Harz National Park (Coniferous / Spruce)**: Center `51.78, 10.45` | Ideal for *Boletus edulis*.
   - **Göhrde State Forest (Old-growth Oak/Beech)**: Center `53.14, 10.83` | Ideal for *Cantharellus cibarius*.
   - **Lüneburg Heath (Sandy Pine forests)**: Center `53.16, 9.95`.
2. **Bretagne (France)**:
   - **Forêt de Brocéliande / Paimpont (Oak/Beech)**: Center `48.02, -2.17` | Prime *Cantharellus* and *Boletus* ground.
   - **Forêt de Huelgoat (Granite chaos, acidic soil)**: Center `48.36, -3.74`.

---

## 5. UI Control Layout

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 🍄 SHROOM ROOM                       [Species: Boletus edulis ▾]       │
│ Region: [ Niedersachsen ▾ ]          [Date: Today / 2026-08-14 ▾]      │
├────────────────────────────────────────────────────────┬───────────────┤
│                                                        │ 📊 SPOT HUD   │
│                 INTERACTIVE MAP CANVAS                 │ Coordinates:  │
│                                                        │ 51.782, 10.451│
│   [Red = Suitability]       [Blue = Weather Rain/Temp] │               │
│   [Purple = Overlap]        [Trails = OpenTopoMap]     │ Suitability:  │
│                                                        │ 88% (Red)     │
│   • Harz Forest                                        │               │
│     (Waypoint 1)                                       │ Weather Index:│
│          \                                             │ 76% (Blue)    │
│           \                                            │               │
│            • Waypoint 2                                │ Overall:      │
│                                                        │ 82% (Purple)  │
│                                                        │               │
│                                                        │ Soil pH: 5.2  │
│                                                        │ Trees: Spruce │
│                                                        │ Rain 14d: 42mm│
├────────────────────────────────────────────────────────┴───────────────┤
│ 📍 Waypoints (2 points, 3.4 km)          [📥 Export GPX for Garmin/App] │
└────────────────────────────────────────────────────────────────────────┘
```
