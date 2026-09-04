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

  init(containerId: string, initialCenter: [number, number] = [51.78, 10.45], initialZoom: number = 12) {
    // 1. Initialize Leaflet Map
    this.map = L.map(containerId, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: false
    });

    // Save map position across sessions
    this.map.on('moveend', () => {
      try {
        const center = this.map.getCenter();
        const zoom = this.map.getZoom();
        localStorage.setItem('shroom_room_map_pos', JSON.stringify({
          center: [center.lat, center.lng],
          zoom
        }));
      } catch (e) {
        // ignore storage errors
      }
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
        // Coordinate is in an unbaked tile area - trigger bake upon click!
        const tileId = getTileId(lat, lon);
        this.fogOfWarLayer.triggerBake(tileId);
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

    // 2. Prefetch real baked habitat tiles from backend (only at zoom > 9)
    if (this.map.getZoom() > 9) {
      this.habitatService.prefetchViewport(viewport);
      // 3. Sync Fog of War unbaked/baking state
      this.fogOfWarLayer?.syncViewportTiles();
    }

    // 4. Render Canvas Overlay
    this.renderCanvasOverlay();
  }

  /**
   * Ground-Truth Dual Color-Blending Canvas Shader
   * - Aligned pixel-perfect to exact baked tile boundaries and 250m cell matrices
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

    const mapBounds = this.map.getBounds();
    const loadedTiles = this.habitatService.getAllLoadedTiles();
    const isSeason = this.scoringEngine.isSeasonActive(this.currentSpeciesId, this.currentDateStr);

    for (const tile of loadedTiles) {
      if (tile.isEmpty || !tile.cells || tile.cells.length === 0) continue;

      const tb = tile.bounds;
      const tileLatLngBounds = L.latLngBounds([tb.south, tb.west], [tb.north, tb.east]);
      if (!mapBounds.intersects(tileLatLngBounds)) continue;

      const rows = tile.rows;
      const cols = tile.cols;
      const dLat = (tb.north - tb.south) / rows;
      const dLon = (tb.east - tb.west) / cols;

      for (const cell of tile.cells) {
        const cellNorth = tb.north - cell.row * dLat;
        const cellSouth = tb.north - (cell.row + 1) * dLat;
        const cellWest = tb.west + cell.col * dLon;
        const cellEast = tb.west + (cell.col + 1) * dLon;

        // Project cell geographic bounding box to canvas pixel coordinates
        const pTopLeft = this.map.latLngToContainerPoint([cellNorth, cellWest]);
        const pBottomRight = this.map.latLngToContainerPoint([cellSouth, cellEast]);

        const cellW = pBottomRight.x - pTopLeft.x;
        const cellH = pBottomRight.y - pTopLeft.y;

        if (cellW <= 0 || cellH <= 0) continue;

        // Suitability (0..1)
        let rawSuitability = 0;
        if (this.currentSpeciesId === 'boletus') {
          rawSuitability = cell.boletusSuitability ?? 0;
        } else if (this.currentSpeciesId === 'cantharellus') {
          rawSuitability = cell.chanterelleSuitability ?? 0;
        } else {
          const baked = (cell as any)[`${this.currentSpeciesId}Suitability`];
          if (typeof baked === 'number') {
            rawSuitability = baked;
          } else {
            // Dynamically evaluate suitability from cell habitat features and memoize
            const env: EnvironmentalInputs = {
              lat: cell.lat,
              lon: cell.lon,
              soilPH: cell.soilPH,
              clayPct: cell.clayPct,
              sandPct: cell.sandPct,
              socDgKg: cell.socDgKg,
              hostTreeGenus: cell.treeGenus,
              distToHostMeters: cell.distToHostMeters,
              elevationMeters: 250,
              aspectDegrees: 180,
              rain14DaysMm: 35,
              currentSoilTempC: 13,
              pastWeekSoilTempC: 16,
              date: this.currentDateStr
            };
            const scoring = this.scoringEngine.evaluate(this.currentSpeciesId, env);
            rawSuitability = Math.round(scoring.suitabilityScore * 100);
            (cell as any)[`${this.currentSpeciesId}Suitability`] = rawSuitability;
          }
        }
        const suitScore = rawSuitability / 100;

        // 1. Draw Suitability (Red)
        if (this.isSuitabilityVisible && suitScore > 0.15) {
          const alpha = Math.min(0.85, (0.25 + 0.50 * suitScore) * (this.suitabilityOpacity / 0.50));
          ctx.fillStyle = `rgba(239, 68, 68, ${alpha.toFixed(3)})`;
          ctx.fillRect(pTopLeft.x, pTopLeft.y, cellW + 0.5, cellH + 0.5);
        }

        // 2. Draw Weather Trigger (Blue) with Additive blending (ONLY when in season)
        if (this.isProbabilityVisible && isSeason) {
          const weather = this.weatherService.interpolateAt(cell.lat, cell.lon, this.weatherGrid);
          const env: EnvironmentalInputs = {
            lat: cell.lat,
            lon: cell.lon,
            soilPH: cell.soilPH,
            clayPct: cell.clayPct,
            sandPct: cell.sandPct,
            socDgKg: cell.socDgKg,
            hostTreeGenus: cell.treeGenus,
            distToHostMeters: cell.distToHostMeters,
            elevationMeters: 250,
            aspectDegrees: 180,
            rain14DaysMm: weather.rain14DaysMm,
            currentSoilTempC: weather.currentSoilTempC,
            pastWeekSoilTempC: weather.pastWeekSoilTempC,
            date: this.currentDateStr
          };
          const scoring = this.scoringEngine.evaluate(this.currentSpeciesId, env);
          const weatherScore = scoring.weatherScore;

          if (weatherScore > 0.15) {
            const alpha = Math.min(0.85, (0.25 + 0.50 * weatherScore) * (this.probabilityOpacity / 0.50));
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = `rgba(59, 130, 246, ${alpha.toFixed(3)})`;
            ctx.fillRect(pTopLeft.x, pTopLeft.y, cellW + 0.5, cellH + 0.5);
            ctx.restore();
          }
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

      const isFoundSpot = wpt.name.includes('🍄');
      const customIcon = L.divIcon({
        className: isFoundSpot ? 'custom-spot-marker' : 'custom-map-marker',
        html: `
          <div style="
            background: ${isFoundSpot ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'};
            color: #fff;
            width: ${isFoundSpot ? '32px' : '28px'};
            height: ${isFoundSpot ? '32px' : '28px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: ${isFoundSpot ? '16px' : '12px'};
            border: 2px solid #ffffff;
            box-shadow: ${isFoundSpot ? '0 0 16px rgba(245, 158, 11, 0.9), 0 2px 8px rgba(0,0,0,0.5)' : '0 0 14px rgba(168, 85, 247, 0.8)'};
            transform: translate(-50%, -50%);
          ">${isFoundSpot ? '🍄' : index + 1}</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(latLng, { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; color: #1e293b; padding: 2px;">
          <strong>${wpt.name}</strong><br/>
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

  private userLocationMarker?: L.Marker;
  private userAccuracyCircle?: L.Circle;

  /**
   * Triggers device GPS geolocation, places pulsing marker with accuracy circle,
   * and centers map on current location.
   */
  locateUser(
    onSuccess?: (coords: { lat: number; lon: number; accuracy: number }) => void,
    onError?: (errorMsg: string) => void
  ) {
    if (!navigator.geolocation) {
      onError?.('Geolocation is not supported by your device/browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        if (this.userLocationMarker) {
          this.map.removeLayer(this.userLocationMarker);
        }
        if (this.userAccuracyCircle) {
          this.map.removeLayer(this.userAccuracyCircle);
        }

        const gpsIcon = L.divIcon({
          className: 'gps-user-marker-wrapper',
          html: `
            <div class="gps-user-marker">
              <div class="gps-pulse"></div>
              <div class="gps-core"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        this.userAccuracyCircle = L.circle([lat, lon], {
          radius: Math.max(accuracy, 20),
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(this.map);

        this.userLocationMarker = L.marker([lat, lon], { icon: gpsIcon, zIndexOffset: 2000 })
          .addTo(this.map)
          .bindPopup(`
            <div style="font-family: inherit; font-size: 13px; color: #0f172a; padding: 2px;">
              <strong>📍 Current GPS Location</strong><br/>
              <span>Accuracy: &plusmn;${Math.round(accuracy)} meters</span><br/>
              <span style="font-size: 11px; color: #64748b;">${lat.toFixed(5)}, ${lon.toFixed(5)}</span>
            </div>
          `);

        this.map.flyTo([lat, lon], Math.max(this.map.getZoom(), 14), {
          animate: true,
          duration: 1.2
        });

        // Trigger environment inspection at current GPS coordinate
        this.updateViewportDataAndRender();
        onSuccess?.({ lat, lon, accuracy });
      },
      (err) => {
        let msg = 'Unable to determine GPS location.';
        if (err.code === 1) msg = 'Location access denied. Please allow GPS permissions in your browser settings.';
        else if (err.code === 2) msg = 'Location position unavailable. Check device GPS.';
        else if (err.code === 3) msg = 'GPS location request timed out.';
        onError?.(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000
      }
    );
  }

  invalidateSize() {
    this.map?.invalidateSize();
  }
}

