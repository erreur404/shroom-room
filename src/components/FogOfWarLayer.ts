import L from 'leaflet';
import { BakedTileData, getTileIdsForViewport, parseTileBounds } from '../../server/tileConfig';

export interface TileStatusInfo {
  status: 'unbaked' | 'baking' | 'baked';
  step?: string;
  progressPct?: number;
  message?: string;
  forestCoveragePct?: number;
  isEmpty?: boolean;
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
    const bounds = this.map.getBounds();
    const viewport = {
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast()
    };

    const bboxStr = `${viewport.south},${viewport.west},${viewport.north},${viewport.east}`;

    try {
      const res = await fetch(`http://localhost:3001/api/tiles/status?bbox=${bboxStr}`);
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
      const res = await fetch(`http://localhost:3001/api/tiles/${tileId}`);
      if (!res.ok) return;
      const tileData: BakedTileData = await res.json();
      this.loadedTileData.set(tileId, tileData);
      this.callbacks.onTileLoaded(tileData);
    } catch (err) {
      console.warn(`[FogOfWar] Could not load baked tile ${tileId}`, err);
    }
  }

  private async pollTileStatuses() {
    // Only poll if there are actively baking tiles
    const hasBaking = Array.from(this.tileStatuses.values()).some(s => s.status === 'baking');
    if (hasBaking) {
      await this.syncViewportTiles();
    }
  }

  renderFogTiles() {
    if (!this.map) return;
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

      if (statusInfo.status === 'unbaked') {
        // Render Translucent Frosted White Fog
        const fogPolygon = L.rectangle(latLngBounds, {
          color: 'rgba(255, 255, 255, 0.45)',
          weight: 1.5,
          dashArray: '4, 6',
          fillColor: '#f1f5f9',
          fillOpacity: 0.42,
          className: 'fog-unbaked-tile'
        });

        fogPolygon.bindTooltip(
          `<div style="font-family: inherit; font-size: 12px; text-align: center;">
            <strong>☁️ Unbaked Habitat Data</strong><br/>
            <span style="color:#7c3aed; font-weight:700;">Click to Bake Tile</span>
          </div>`,
          { sticky: true }
        );

        fogPolygon.on('click', () => {
          this.triggerBake(tid);
        });

        this.fogLayerGroup.addLayer(fogPolygon);

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
    // Update local state to baking immediately for instant UI feedback
    this.tileStatuses.set(tileId, {
      status: 'baking',
      step: 'landuse_check',
      progressPct: 15,
      message: 'Checking forest landcover...'
    });
    this.renderFogTiles();

    try {
      const res = await fetch('http://localhost:3001/api/tiles/bake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tileId })
      });
      if (res.ok) {
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
