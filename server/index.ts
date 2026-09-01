import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTileIdsForViewport, parseTileBounds } from './tileConfig';
import { LanduseService } from './landuseService';
import { SoilgridsService } from './soilgridsService';
import { ForestpathsService } from './forestpathsService';
import { TileStore } from './tileStore';
import { BakeWorker } from './bakeWorker';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Resolve static dist assets whether executing from dist/index.js (production) or server/index.ts (development)
const distPath = fs.existsSync(path.join(__dirname, 'index.html'))
  ? __dirname
  : path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 3002;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// Serve static frontend build
app.use(express.static(distPath));


// Initialize Services
const landuseService = new LanduseService();
const soilgridsService = new SoilgridsService();
const forestpathsService = new ForestpathsService();
const tileStore = new TileStore();
const bakeWorker = new BakeWorker(landuseService, soilgridsService, forestpathsService, tileStore);

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'shroom-room-tile-baker', timestamp: new Date().toISOString() });
});

/**
 * Returns statuses of all tiles within a bounding box
 */
app.get('/api/tiles/status', (req, res) => {
  const { bbox } = req.query;
  if (!bbox || typeof bbox !== 'string') {
    return res.status(400).json({ error: 'Missing bbox query parameter (format: south,west,north,east)' });
  }

  const parts = bbox.split(',').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    return res.status(400).json({ error: 'Invalid bbox format. Expected: south,west,north,east' });
  }

  const bounds = { south: parts[0], west: parts[1], north: parts[2], east: parts[3] };
  const tileIds = getTileIdsForViewport(bounds);

  const statuses: Record<string, any> = {};

  for (const tid of tileIds) {
    const isBaked = tileStore.isTileBaked(tid);
    if (isBaked) {
      const tileData = tileStore.loadTile(tid);
      statuses[tid] = {
        status: 'baked',
        isEmpty: tileData?.isEmpty || false,
        forestCoveragePct: tileData?.forestCoveragePct || 0,
        bakedAt: tileData?.bakedAt
      };
    } else {
      const activeJob = bakeWorker.getJobState(tid);
      if (activeJob) {
        if (activeJob.step === 'error') {
          statuses[tid] = {
            status: 'error',
            step: activeJob.step,
            progressPct: activeJob.progressPct,
            message: activeJob.message,
            error: activeJob.error
          };
        } else if (activeJob.step === 'completed') {
          statuses[tid] = { status: 'baked' };
        } else {
          statuses[tid] = {
            status: 'baking',
            step: activeJob.step,
            progressPct: activeJob.progressPct,
            message: activeJob.message
          };
        }
      } else {
        statuses[tid] = { status: 'unbaked' };
      }
    }
  }

  res.json({ tiles: statuses });
});

/**
 * Triggers progressive bake for a specific Tile ID
 */
app.post('/api/tiles/bake', async (req, res) => {
  const { tileId } = req.body;
  if (!tileId || typeof tileId !== 'string') {
    return res.status(400).json({ error: 'Missing tileId in request body' });
  }

  try {
    // If already baked, return immediately
    if (tileStore.isTileBaked(tileId)) {
      const existing = tileStore.loadTile(tileId);
      return res.json({ status: 'baked', tileId, data: existing });
    }

    // Launch bake job in background
    bakeWorker.bakeTile(tileId).catch(err => {
      console.error(`[Server] [${tileId}] Background bake failed:`, err?.message || err);
    });

    const job = bakeWorker.getJobState(tileId);
    res.json({
      status: 'queued',
      tileId,
      step: job?.step || 'landuse_check',
      progressPct: job?.progressPct || 10,
      message: job?.message || 'Bake job queued'
    });

  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Bake request failed' });
  }
});

/**
 * Returns full baked tile data (JSON)
 */
app.get('/api/tiles/:tileId', (req, res) => {
  const { tileId } = req.params;
  const tile = tileStore.loadTile(tileId);
  if (!tile) {
    return res.status(404).json({ error: `Tile ${tileId} not found or unbaked` });
  }
  res.json(tile);
});

/**
 * Fallback to index.html for frontend SPA routing (non-API routes)
 */
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend not built. Please run `npm run build`.');
  }
});

app.listen(PORT, () => {
  console.log(`🌲 Shroom Room Progressive Tile Baker running on http://localhost:${PORT}`);
});

