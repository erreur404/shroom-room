# Ticket 05: Interactive Map UI & Layer Switcher Harness

Status: resolved
Type: prototype
Blocked by: 04

## Question

What frontend web application framework and mapping library (e.g. Vite + React/Vanilla JS with Leaflet / MapLibre GL) provides the crispest interactive user experience for selecting a species (*Boletus edulis* / *Cantharellus cibarius*), toggling between the static **Suitability Map** and dynamic **Probability Map**, and displaying local location scores?

## Answer

Resolved by specification and GPX export engine design at [docs/research/interactive-map-ui-specification.md](file:///d:/William/Documents/git/shroom-room/docs/research/interactive-map-ui-specification.md).

Key decisions:
1. **Frontend & Mapping Stack**: Vite + TypeScript web application with Leaflet / Canvas overlay layers for high-performance client-side rendering.
2. **Topographic & Trail Basemaps**: OpenTopoMap and CyclOSM/OSM Outdoors to display elevation contours, forestry tracks, and hiking footways.
3. **Dual Color-Blending Visual Paradigm**:
   - **Static Suitability**: Red fill (`rgba(239, 68, 68, 0.30..0.70)`) representing favorable soil/trees waiting for rain.
   - **Dynamic Probability**: Blue fill (`rgba(59, 130, 246, 0.30..0.70)`) representing active weather triggers.
   - **Visual Synthesis**: Overlap creates **Purple/Magenta**, signaling prime foraging conditions. Pure Blue without Red indicates uninteresting rain on bad soil.
4. **Interactive Waypoint Planner & GPX Export**: Click to drop waypoints with live spot telemetry (pH, trees, 14-day rainfall, scores) and one-click TopoGrafix GPX 1.1 file export for Garmin handhelds, Komoot, and OsmAnd.
5. **Regional Quick-Jumps**: Instant presets for Niedersachsen (Harz, Göhrde, Lüneburg) and Bretagne (Brocéliande, Huelgoat).
