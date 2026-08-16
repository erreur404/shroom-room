import L from 'leaflet';
import { BasemapId, EnvironmentalInputs, ForagingWaypoint, RegionPreset, ScoringResult, SpeciesId, WeatherGridPoint } from '../types';
import { ScoringEngine } from '../scoring/pipelines';
import { WeatherService } from '../services/weatherService';
import { HabitatDataService } from '../services/habitatDataService';
import { FogOfWarLayer } from './FogOfWarLayer';
import { getTileId } from '../../server/tileConfig';

export interface MapHarnessCallbacks {
  onCoordinateClick: (env: EnvironmentalInputs, score: ScoringResult) => void;
  onWaypointAdd: (lat: number, lon: number) => void;
  onWeatherAvailabilityChange?: (available: boolean) => void;
}

export class MapHarness {
  private map!: L.Map;
  private baseLayers: Record<BasemapId, L.TileLayer> = {} as any;
  private activeBasemapId: BasemapId = 'opentopomap';

  // Canvas Overlay Layer
  private overlayCanvas!: HTMLCanvasElement;
  private canvasLayer!: L.Layer;

  // Fog of War Layer (Progressive Tile Baking)
  private fogOfWarLayer!: FogOfWarLayer;

  // Waypoints & Route Layer
  private waypointLayerGroup!: L.LayerGroup;
  private routePolyline!: L.Polyline;

  // State & Services
  private currentSpeciesId: SpeciesId = 'boletus';
  private currentDateStr: string = new Date().toISOString().split('T')[0];
  private isWaypointMode: boolean = false;
  private isSuitabilityVisible: boolean = true;
  private isProbabilityVisible: boolean = true;
  private suitabilityOpacity: number = 0.50;
  private probabilityOpacity: number = 0.50;

  private weatherGrid: WeatherGridPoint[] = [];

  constructor(
    private scoringEngine: ScoringEngine,
    private weatherService: WeatherService,
    private habitatService: HabitatDataService,
    private callbacks: MapHarnessCallbacks
  ) { }

  init(containerId: string, initialRegion: RegionPreset) {
    // 1. Initialize Leaflet Map
    this.map = L.map(containerId, {
      center: initialRegion.center,
      zoom: initialRegion.zoom,
      zoomControl: true,
      attributionControl: false
    });

    // Add Attribution in bottom-right
    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('Map data: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> | <a href="https://open-meteo.com">Open-Meteo</a> | <a href="https://soilgrids.org">SoilGrids</a>')
      .addTo(this.map);

    // 2. Setup Basemaps
    this.baseLayers.opentopomap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      subdomains: 'abc'
    });

    this.baseLayers.cyclosm = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
      maxZoom: 18,
      subdomains: 'abc'
    });

    this.baseLayers.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });

    this.baseLayers[this.activeBasemapId].addTo(this.map);

    // 3. Setup Custom Dual-Color Canvas Overlay Layer
    this.initCanvasOverlay();

    // 4. Setup Fog of War Layer (renders unbaked / baking tile states)
    this.fogOfWarLayer = new FogOfWarLayer({
      onBakeRequest: (tileId) => {
        console.log(`[MapHarness] Bake requested for tile: ${tileId}`);
      },
      onTileLoaded: (tileData) => {
        this.habitatService.setBakedTile(tileData);
        this.renderCanvasOverlay();
      }
    });
    this.fogOfWarLayer.init(this.map);

    // 5. Setup Waypoint and Route Layer
    this.waypointLayerGroup = L.layerGroup().addTo(this.map);
    this.routePolyline = L.polyline([], {
      color: '#a855f7',
      weight: 3.5,
      dashArray: '6, 8',
      opacity: 0.9,
      lineCap: 'round'
    }).addTo(this.map);

    // 6. Event Listeners
    this.habitatService.onTileUpdate(() => {
      this.renderCanvasOverlay();
    });

    this.map.on('moveend', () => this.updateViewportDataAndRender());
    this.map.on('zoomend', () => this.updateViewportDataAndRender());

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      const env = this.habitatService.getEnvironmentalInputs(lat, lon, this.currentDateStr, this.weatherGrid, this.weatherService);
      if (env) {
        const score = this.scoringEngine.evaluate(this.currentSpeciesId, env);
        if (this.isWaypointMode) {
          this.callbacks.onWaypointAdd(lat, lon);
        } else {
          this.callbacks.onCoordinateClick(env, score);
        }
      } else {
        // Fetch from backend tile baker
        this.habitatService.fetchTile(getTileId(lat, lon)).then(() => {
          const freshEnv = this.habitatService.getEnvironmentalInputs(lat, lon, this.currentDateStr, this.weatherGrid, this.weatherService);
          if (freshEnv) {
            const score = this.scoringEngine.evaluate(this.currentSpeciesId, freshEnv);
            this.callbacks.onCoordinateClick(freshEnv, score);
          }
        });
      }
    });

    // Initial Render
    this.updateViewportDataAndRender();
  }

  private initCanvasOverlay() {
    const CanvasLayerClass = L.Layer.extend({
      onAdd: (map: L.Map) => {
        const pane = map.getPane('overlayPane') || map.getPanes().overlayPane;
        this.overlayCanvas = L.DomUtil.create('canvas', 'shroom-canvas-overlay') as HTMLCanvasElement;
        this.overlayCanvas.style.pointerEvents = 'none';
        this.overlayCanvas.style.position = 'absolute';
        this.overlayCanvas.style.top = '0';
        this.overlayCanvas.style.left = '0';
        this.overlayCanvas.style.zIndex = '350';
        pane.appendChild(this.overlayCanvas);

        map.on('resize', this.resizeCanvas, this);
        this.resizeCanvas();
        return this.canvasLayer;
      },
      onRemove: (map: L.Map) => {
        L.DomUtil.remove(this.overlayCanvas);
        map.off('resize', this.resizeCanvas, this);
        return this.canvasLayer;
      }
    });

    this.canvasLayer = new CanvasLayerClass();
    this.canvasLayer.addTo(this.map);
  }

  private resizeCanvas() {
    if (!this.overlayCanvas || !this.map) return;
    const size = this.map.getSize();
    this.overlayCanvas.width = size.x;
    this.overlayCanvas.height = size.y;
    this.overlayCanvas.style.width = `${size.x}px`;
    this.overlayCanvas.style.height = `${size.y}px`;
  }

  async updateViewportDataAndRender() {
    if (!this.map) return;
    const bounds = this.map.getBounds();
    const viewport = {
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast()
    };

    // 1. Fetch / Update Weather for Viewport
    try {
      this.weatherGrid = await this.weatherService.fetchWeatherForViewport(viewport, this.currentDateStr, 8);
      this.callbacks.onWeatherAvailabilityChange?.(true);
    } catch (err) {
      console.warn('[MapHarness] Weather data unavailable for viewport:', err);
      this.weatherGrid = [];
      this.isProbabilityVisible = false;
      this.callbacks.onWeatherAvailabilityChange?.(false);
    }

    // 2. Prefetch real baked habitat tiles from backend
    this.habitatService.prefetchViewport(viewport);

    // 3. Sync Fog of War unbaked/baking state
    this.fogOfWarLayer?.syncViewportTiles();

    // 4. Render Canvas Overlay
    this.renderCanvasOverlay();
  }

  /**
   * Ground-Truth Dual Color-Blending Canvas Shader
   * - Red Canvas: Ground-Truth Baked Suitability (0.30 - 0.70)
   * - Blue Canvas: Dynamic Weather Trigger (0.30 - 0.70)
   * - Natural Overlap: Renders Glowing Purple Hotspots
   */
  private renderCanvasOverlay() {
    if (!this.overlayCanvas || !this.map) return;
    const ctx = this.overlayCanvas.getContext('2d');
    if (!ctx) return;

    this.resizeCanvas();
    const width = this.overlayCanvas.width;
    const height = this.overlayCanvas.height;
    ctx.clearRect(0, 0, width, height);

    if (!this.isSuitabilityVisible && !this.isProbabilityVisible) {
      return;
    }

    const mapOrigin = this.map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this.overlayCanvas, mapOrigin);

    const bounds = this.map.getBounds();
    const gridCols = 36;
    const gridRows = 26;
    const cellW = width / gridCols;
    const cellH = height / gridRows;

    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const lat = north - (r / gridRows) * (north - south);
        const lon = west + (c / gridCols) * (east - west);

        const env = this.habitatService.getEnvironmentalInputs(lat, lon, this.currentDateStr, this.weatherGrid, this.weatherService);
        if (!env) continue;

        const scoring = this.scoringEngine.evaluate(this.currentSpeciesId, env);

        const suitScore = scoring.suitabilityScore;
        const weatherScore = scoring.weatherScore;

        const x = c * cellW;
        const y = r * cellH;

        // 1. Draw Suitability (Red)
        if (this.isSuitabilityVisible && suitScore > 0.15) {
          const alpha = Math.min(0.85, (0.25 + 0.50 * suitScore) * (this.suitabilityOpacity / 0.50));
          ctx.fillStyle = `rgba(239, 68, 68, ${alpha.toFixed(3)})`;
          ctx.fillRect(x, y, cellW + 1, cellH + 1);
        }

        // 2. Draw Weather Trigger (Blue) with Additive/Multiply blending (ONLY when in season)
        const isSeason = this.scoringEngine.isSeasonActive(this.currentSpeciesId, this.currentDateStr);
        if (this.isProbabilityVisible && weatherScore > 0.15 && isSeason) {
          const alpha = Math.min(0.85, (0.25 + 0.50 * weatherScore) * (this.probabilityOpacity / 0.50));
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha.toFixed(3)})`;
          ctx.fillRect(x, y, cellW + 1, cellH + 1);
          ctx.restore();
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public Control API
  // ─────────────────────────────────────────────────────────────────────────

  setSpecies(speciesId: SpeciesId) {
    this.currentSpeciesId = speciesId;
    this.updateViewportDataAndRender();
  }

  setDate(dateStr: string) {
    this.currentDateStr = dateStr;
    this.updateViewportDataAndRender();
  }

  setBasemap(basemapId: BasemapId) {
    if (this.baseLayers[this.activeBasemapId]) {
      this.map.removeLayer(this.baseLayers[this.activeBasemapId]);
    }
    this.activeBasemapId = basemapId;
    this.baseLayers[this.activeBasemapId].addTo(this.map);
  }

  setRegion(preset: RegionPreset) {
    this.map.flyTo(preset.center, preset.zoom, { duration: 1.2 });
  }

  setWaypointMode(active: boolean) {
    this.isWaypointMode = active;
    if (this.map.getContainer()) {
      this.map.getContainer().style.cursor = active ? 'crosshair' : '';
    }
  }

  setLayerVisibility(suitability: boolean, probability: boolean) {
    this.isSuitabilityVisible = suitability;
    this.isProbabilityVisible = probability;
    this.renderCanvasOverlay();
  }

  setLayerOpacity(suitabilityOpacity: number, probabilityOpacity: number) {
    this.suitabilityOpacity = suitabilityOpacity;
    this.probabilityOpacity = probabilityOpacity;
    this.renderCanvasOverlay();
  }

  renderWaypoints(waypoints: ForagingWaypoint[]) {
    this.waypointLayerGroup.clearLayers();
    const latLngs: L.LatLngExpression[] = [];

    waypoints.forEach((wpt, index) => {
      const latLng: [number, number] = [wpt.lat, wpt.lon];
      latLngs.push(latLng);

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
            color: #fff;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 12px;
            border: 2px solid #ffffff;
            box-shadow: 0 0 14px rgba(168, 85, 247, 0.8);
            transform: translate(-50%, -50%);
          ">${index + 1}</div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker(latLng, { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; color: #1e293b;">
          <strong>📍 ${wpt.name}</strong><br/>
          <span>Fruiting Probability: <strong>${wpt.probabilityScore}%</strong></span><br/>
          <span>Suitability: ${wpt.suitabilityScore}% | Weather: ${wpt.weatherScore}%</span><br/>
          <span>Soil pH: ${wpt.soilPH} | 14d Rain: ${wpt.rain14DaysMm}mm</span>
        </div>
      `);
      this.waypointLayerGroup.addLayer(marker);
    });

    this.routePolyline.setLatLngs(latLngs);
  }

  flyToCoordinate(lat: number, lon: number) {
    this.map.panTo([lat, lon], { animate: true });
  }
}
