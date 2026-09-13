import L from 'leaflet';
import { BakedTileData, getTileIdsForViewport, parseTileBounds } from '../../server/tileConfig';
import { API_BASE_URL } from '../config';

export interface TileStatusInfo {
  status: 'unbaked' | 'baking' | 'baked' | 'error';
  step?: string;
  progressPct?: number;
  message?: string;
  forestCoveragePct?: number;
  isEmpty?: boolean;
  error?: string;
}

export interface FogOfWarCallbacks {
  onBakeRequest: (tileId: string) => void;
  onTileLoaded: (tileData: BakedTileData) => void;
}

export class FogOfWarLayer {
  private map!: L.Map;
  private fogLayerGroup!: L.LayerGroup;
  private tileStatuses: Map<string, TileStatusInfo> = new Map();
  private loadedTileData: Map<string, BakedTileData> = new Map();

  private pollInterval?: any;

  constructor(private callbacks: FogOfWarCallbacks) {}

  init(map: L.Map) {
    this.map = map;
    this.fogLayerGroup = L.layerGroup().addTo(this.map);

    this.map.on('moveend', () => this.syncViewportTiles());
    this.map.on('zoomend', () => this.syncViewportTiles());

    // Start background status polling (every 1.5s)
    this.pollInterval = setInterval(() => this.pollTileStatuses(), 1500);

    this.syncViewportTiles();
  }

  destroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  async syncViewportTiles() {
    if (!this.map) return;
    if (this.map.getZoom() <= 9) return;
    const bounds = this.map.getBounds();
    const viewport = {
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast()
    };

    const bboxStr = `${viewport.south},${viewport.west},${viewport.north},${viewport.east}`;

    try {
      const res = await fetch(`${API_BASE_URL}/api/tiles/status?bbox=${bboxStr}`);
      if (!res.ok) return;

      const data = await res.json();
      const tiles: Record<string, TileStatusInfo> = data.tiles || {};

      for (const [tid, info] of Object.entries(tiles)) {
        this.tileStatuses.set(tid, info);
        // If baked and not yet loaded into memory, fetch tile JSON
        if (info.status === 'baked' && !this.loadedTileData.has(tid)) {
          this.fetchBakedTile(tid);
        }
      }

      this.renderFogTiles();

    } catch (err) {
      // Backend may be starting up
    }
  }

  private async fetchBakedTile(tileId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tiles/${tileId}`);
      if (!res.ok) return;
      const tileData = await res.json();
      if (!tileData || tileData.status === 'unbaked' || !tileData.cells) return;
      this.loadedTileData.set(tileId, tileData as BakedTileData);
      this.callbacks.onTileLoaded(tileData as BakedTileData);
    } catch (err) {
      console.warn(`[FogOfWar] Could not load baked tile ${tileId}`, err);
    }
  }

  private async pollTileStatuses() {
    if (!this.map || this.map.getZoom() <= 9) return;
    // Only poll if there are actively baking or queued tiles
    const hasPending = Array.from(this.tileStatuses.values()).some(
      s => s.status === 'baking' || s.status === 'queued'
    );
    if (hasPending) {
      await this.syncViewportTiles();
    }
  }

  renderFogTiles() {
    if (!this.map) return;
    // Disable rectangle generation at zoom 9 and below to prevent main-thread freezing.
    // Existing rectangles stay untouched.
    if (this.map.getZoom() <= 9) return;

    this.fogLayerGroup.clearLayers();

    const bounds = this.map.getBounds();
    const viewport = {
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast()
    };

    const tileIds = getTileIdsForViewport(viewport);

    for (const tid of tileIds) {
      const statusInfo = this.tileStatuses.get(tid) || { status: 'unbaked' };
      const tb = parseTileBounds(tid);
      const latLngBounds: L.LatLngBoundsExpression = [
        [tb.south, tb.west],
        [tb.north, tb.east]
      ];

      if (statusInfo.status === 'unbaked' || statusInfo.status === 'error') {
        // Render Translucent Frosted White Fog
        const isErr = statusInfo.status === 'error';
        const fogPolygon = L.rectangle(latLngBounds, {
          color: isErr ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.45)',
          weight: 1.5,
          dashArray: '4, 6',
          fillColor: isErr ? '#fee2e2' : '#0f172a',
          fillOpacity: 0.45,
          className: isErr ? 'fog-error-tile' : 'fog-unbaked-tile'
        });

        fogPolygon.bindTooltip(
          `<div style="font-family: inherit; font-size: 12px; text-align: center;">
            <strong>${isErr ? '⚠️ Bake Interrupted' : '☁️ Unbaked Habitat Data'}</strong><br/>
            <span style="color:#a855f7; font-weight:700;">Click to Bake Tile</span>
          </div>`,
          { sticky: true }
        );

        fogPolygon.on('click', () => {
          this.triggerBake(tid);
        });

        this.fogLayerGroup.addLayer(fogPolygon);

      } else if (statusInfo.status === 'queued') {
        // Render Calm Cyan Queued Overlay (Single-tile queue indicator)
        const queuedPolygon = L.rectangle(latLngBounds, {
          color: '#38bdf8',
          weight: 2,
          dashArray: '4, 4',
          fillColor: '#0284c7',
          fillOpacity: 0.35,
          className: 'fog-queued-tile'
        });

        const queueLabel = statusInfo.queuePosition
          ? `In Queue (#${statusInfo.queuePosition})`
          : 'In Queue (waiting in line)';

        queuedPolygon.bindTooltip(
          `<div style="font-family: inherit; font-size: 12px; text-align: center;">
            <strong>⏳ ${queueLabel}</strong><br/>
            <span>${statusInfo.message || 'Processing 1 tile at a time to protect Pi RAM'}</span>
          </div>`,
          { permanent: true, direction: 'center', className: 'baking-status-tooltip' }
        );

        this.fogLayerGroup.addLayer(queuedPolygon);

      } else if (statusInfo.status === 'baking') {
        // Render Pulsing Animated Baking Overlay
        const bakingPolygon = L.rectangle(latLngBounds, {
          color: '#a855f7',
          weight: 2,
          fillColor: '#8b5cf6',
          fillOpacity: 0.35,
          className: 'fog-baking-tile'
        });

        bakingPolygon.bindTooltip(
          `<div style="font-family: inherit; font-size: 12px; text-align: center;">
            <strong>⏳ Baking Ground Truth...</strong><br/>
            <span>${statusInfo.message || 'Processing tile...'}</span>
          </div>`,
          { permanent: true, direction: 'center', className: 'baking-status-tooltip' }
        );

        this.fogLayerGroup.addLayer(bakingPolygon);
      }
      // If 'baked', zero fog polygon is rendered (fog dissolves completely!)
    }
  }

  async triggerBake(tileId: string) {
    // Check if any tile is currently baking
    const anyBaking = Array.from(this.tileStatuses.values()).some(s => s.status === 'baking');
    this.tileStatuses.set(tileId, {
      status: anyBaking ? 'queued' : 'baking',
      step: anyBaking ? 'queued' : 'landuse_check',
      progressPct: anyBaking ? 0 : 15,
      message: anyBaking ? 'Waiting in queue...' : 'Checking forest landcover...'
    });
    this.renderFogTiles();

    try {
      const res = await fetch(`${API_BASE_URL}/api/tiles/bake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tileId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'queued') {
          this.tileStatuses.set(tileId, {
            status: 'queued',
            step: 'queued',
            progressPct: 0,
            queuePosition: data.queuePosition,
            message: data.message || 'In queue (waiting for active tile)...'
          });
          this.renderFogTiles();
        }
        this.callbacks.onBakeRequest(tileId);
      }
    } catch (err) {
      console.error(`[FogOfWar] Failed to trigger bake for ${tileId}`, err);
    }
  }

  getLoadedTiles(): Map<string, BakedTileData> {
    return this.loadedTileData;
  }
}
