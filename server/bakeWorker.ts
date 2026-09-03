import { BakedCell, BakedTileData, parseTileBounds } from './tileConfig';
import { LanduseService } from './landuseService';
import { SoilgridsService } from './soilgridsService';
import { ForestpathsService } from './forestpathsService';
import { TileStore } from './tileStore';
import { ScoringEngine } from '../src/scoring/pipelines';
import { EnvironmentalInputs } from '../src/types';

export type BakeStep =
  | 'idle'
  | 'landuse_check'
  | 'downloading_trees'
  | 'downloading_soil'
  | 'computing_suitability'
  | 'completed'
  | 'error';

export const STEP_DESCRIPTIONS: Record<BakeStep, string> = {
  idle: 'Idle',
  landuse_check: 'Tier-1 Forest Landcover Check (OpenStreetMap Overpass)',
  downloading_trees: 'Extracting Forest Tree Genus (ForestPaths)',
  downloading_soil: 'Ingesting Soil Chemistry pH/Clay/Sand/SOC (SoilGrids v2.0)',
  computing_suitability: 'Evaluating Species Suitability Matrices',
  completed: 'Completed',
  error: 'Error'
};

export interface BakeJobState {
  tileId: string;
  step: BakeStep;
  progressPct: number;
  message: string;
  startedAt: number;
  completedAt?: number;
  error?: string;
}

export class BakeWorker {
  private activeJobs: Map<string, BakeJobState> = new Map();
  private scoringEngine = new ScoringEngine();

  constructor(
    private landuseService: LanduseService,
    private soilgridsService: SoilgridsService,
    private forestpathsService: ForestpathsService,
    private tileStore: TileStore
  ) {}

  getJobState(tileId: string): BakeJobState | null {
    return this.activeJobs.get(tileId) || null;
  }

  getAllActiveJobs(): BakeJobState[] {
    return Array.from(this.activeJobs.values());
  }

  async bakeTile(tileId: string): Promise<BakedTileData> {
    // 1. Check if already baked on disk
    const existing = this.tileStore.loadTile(tileId);
    if (existing) {
      return existing;
    }

    // 2. Check if a job is already actively baking this tile
    const existingJob = this.activeJobs.get(tileId);
    if (existingJob && existingJob.step !== 'error' && existingJob.step !== 'completed') {
      // Wait for existing job to finish
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const state = this.activeJobs.get(tileId);
          if (state?.step === 'completed') {
            clearInterval(interval);
            const data = this.tileStore.loadTile(tileId);
            if (data) resolve(data);
            else reject(new Error('Tile completed but not found on disk'));
          } else if (state?.step === 'error') {
            clearInterval(interval);
            reject(new Error(state.error || 'Bake job failed'));
          }
        }, 150);
      });
    }

    // 3. Initialize new Bake Job
    const startTime = Date.now();
    const bounds = parseTileBounds(tileId);
    console.log(`[BakeWorker] [${tileId}] Starting bake job for bounds [S:${bounds.south}, W:${bounds.west}, N:${bounds.north}, E:${bounds.east}]`);

    const job: BakeJobState = {
      tileId,
      step: 'landuse_check',
      progressPct: 10,
      message: 'Checking OpenStreetMap forest landcover...',
      startedAt: startTime
    };
    this.activeJobs.set(tileId, job);

    try {
      // ─── STEP 1: Tier-1 Landuse Gating ──────────────────────────────────
      const landuse = await this.landuseService.checkLanduse(tileId, bounds);

      if (!landuse.isForest || landuse.forestCoveragePct === 0) {
        // Zero forest detected (e.g. Braunschweig city center, water, farms)
        // Instant tombstone write in < 100ms
        job.step = 'completed';
        job.progressPct = 100;
        job.message = 'Non-forest area (0% forest coverage). Saved.';
        job.completedAt = Date.now();

        const emptyTile = this.tileStore.createEmptyTile(tileId);
        console.log(`[BakeWorker] [${tileId}] Completed: Non-forest area (0% coverage) in ${Date.now() - startTime}ms`);
        return emptyTile;
      }

      // 250m cell grid dimensions for 0.05° tile
      const rows = 22;
      const cols = 14;
      const dLat = (bounds.north - bounds.south) / rows;
      const dLon = (bounds.east - bounds.west) / cols;

      // ─── STEP 2 & 3: Ingest Multi-Point Soil Chemistry & Extract Trees ─
      job.step = 'downloading_soil';
      job.progressPct = 35;
      job.message = `Ingesting SoilGrids chemistry (pH, clay, sand, SOC)...`;

      // Sample 4 quadrants across the tile and create bilinear soil interpolator
      const getSoilForCell = await this.soilgridsService.sampleTileSoilGrid(bounds, rows, cols);

      job.step = 'downloading_trees';
      job.progressPct = 60;
      job.message = `Querying GBIF tree occurrence API for real host tree distribution...`;

      // Query GBIF tree occurrence API with fallback for exact species distribution
      const treeSampler = await this.forestpathsService.sampleTileTrees(bounds);

      // ─── STEP 4: Evaluate Suitability Matrices Per-Cell ──────────────────
      job.step = 'computing_suitability';
      job.progressPct = 80;
      job.message = `Computing Boletus & Chanterelle suitability models...`;

      const cells: BakedCell[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cellLat = Number((bounds.north - r * dLat).toFixed(4));
          const cellLon = Number((bounds.west + c * dLon).toFixed(4));

          // 1. Point-in-polygon & distance calculation to nearest forest edge
          const forestInfo = this.landuseService.evaluateCellForest(
            cellLat,
            cellLon,
            landuse.forestFeatures
          );

          // 2. Resolve tree genus from real GBIF occurrences, OSM tags, or fallback
          let resolvedGenus = 7;
          let treeSource: 'gbif' | 'osm' | 'fallback' | undefined = undefined;

          if (forestInfo.isForest) {
            const treeRes = treeSampler.resolveGenusForCell(
              cellLat,
              cellLon,
              forestInfo.osmGenus,
              forestInfo.tags
            );
            resolvedGenus = treeRes.genus;
            treeSource = treeRes.source;
          }

          // 3. Continuous spatial soil chemistry
          const soilProps = getSoilForCell(r, c);

          // Construct EnvironmentalInputs for scoring engine
          const envInputs: EnvironmentalInputs = {
            lat: cellLat,
            lon: cellLon,
            soilPH: soilProps.soilPH,
            clayPct: soilProps.clayPct,
            sandPct: soilProps.sandPct,
            socDgKg: soilProps.socDgKg,
            hostTreeGenus: resolvedGenus,
            distToHostMeters: forestInfo.distToHostMeters,
            elevationMeters: 250,
            aspectDegrees: 180,
            rain14DaysMm: 35,
            currentSoilTempC: 13,
            pastWeekSoilTempC: 16,
            date: new Date().toISOString().split('T')[0]
          };

          const boletusScore = this.scoringEngine.evaluate('boletus', envInputs);
          const chanterelleScore = this.scoringEngine.evaluate('cantharellus', envInputs);

          cells.push({
            row: r,
            col: c,
            lat: cellLat,
            lon: cellLon,
            treeGenus: resolvedGenus,
            treeSource,
            distToHostMeters: forestInfo.distToHostMeters,
            soilPH: soilProps.soilPH,
            clayPct: soilProps.clayPct,
            sandPct: soilProps.sandPct,
            socDgKg: soilProps.socDgKg,
            isForest: forestInfo.isForest,
            boletusSuitability: Math.round(boletusScore.suitabilityScore * 100),
            chanterelleSuitability: Math.round(chanterelleScore.suitabilityScore * 100)
          });
        }
      }

      const forestCellCount = cells.filter(c => c.isForest).length;
      const accurateForestPct = Math.round((forestCellCount / cells.length) * 100);

      // Aggregate tree genus distribution and Oak metrics
      const genusDistribution: Record<number, number> = {};
      for (const cell of cells) {
        if (cell.isForest) {
          genusDistribution[cell.treeGenus] = (genusDistribution[cell.treeGenus] || 0) + 1;
        }
      }
      const oakCellsCount = genusDistribution[4] || 0;
      const oakCoveragePct = forestCellCount > 0 ? Math.round((oakCellsCount / forestCellCount) * 100) : 0;

      // ─── STEP 5: Persist Baked Tile to Disk ──────────────────────────────
      const bakedTile: BakedTileData = {
        tileId,
        bounds,
        baseCellMeters: 250,
        rows,
        cols,
        forestCoveragePct: accurateForestPct,
        isEmpty: false,
        cells,
        genusDistribution,
        oakCellsCount,
        oakCoveragePct,
        bakedAt: new Date().toISOString()
      };

      this.tileStore.saveTile(bakedTile);

      const totalDuration = Date.now() - startTime;
      job.step = 'completed';
      job.progressPct = 100;
      job.message = `Successfully baked ${cells.length} cells in ${totalDuration}ms. Saved to disk.`;
      job.completedAt = Date.now();

      console.log(`[BakeWorker] [${tileId}] Successfully baked ${cells.length} cells in ${totalDuration}ms (Forest: ${forestCellCount}/${cells.length} [${accurateForestPct}%], Oaks: ${oakCellsCount} [${oakCoveragePct}%], Genera: ${JSON.stringify(genusDistribution)})`);
      return bakedTile;

    } catch (err: any) {
      const totalDuration = Date.now() - startTime;
      const failedStep = job.step;
      const stepDescription = STEP_DESCRIPTIONS[failedStep] || failedStep;
      const errorMsg = err?.message || String(err);

      console.error(`[BakeWorker] [${tileId}] ❌ Operation failed at step '${failedStep}' (${stepDescription}) after ${totalDuration}ms: ${errorMsg}`);
      job.step = 'error';
      job.error = `Failed at step '${failedStep}' (${stepDescription}): ${errorMsg}`;
      throw new Error(`[Step: ${failedStep} (${stepDescription})] ${errorMsg}`);
    }
  }
}
