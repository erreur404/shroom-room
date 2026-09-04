import fs from 'fs';
import path from 'path';
import { BakedCell, BakedTileData, parseTileBounds } from './tileConfig';

export class TileStore {
  private baseDir: string;

  constructor(baseDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data', 'tiles')) {
    this.baseDir = baseDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  getFilePath(tileId: string): string {
    return path.join(this.baseDir, `${tileId}.json`);
  }

  isTileBaked(tileId: string): boolean {
    return fs.existsSync(this.getFilePath(tileId));
  }

  listBakedTileIds(): string[] {
    if (!fs.existsSync(this.baseDir)) return [];
    return fs.readdirSync(this.baseDir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  }

  loadTile(tileId: string): BakedTileData | null {
    const filePath = this.getFilePath(tileId);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as BakedTileData;
    } catch (err) {
      console.error(`[TileStore] Error reading tile ${tileId}`, err);
      return null;
    }
  }

  saveTile(tileData: BakedTileData): void {
    const filePath = this.getFilePath(tileData.tileId);
    // Perform quadtree 4x4 fusion to 1000m overview matrix
    tileData.fused1000m = this.fuseTo1000m(tileData.cells, tileData.rows, tileData.cols);
    fs.writeFileSync(filePath, JSON.stringify(tileData, null, 2), 'utf-8');
  }

  /**
   * Fuses 250m base cells into 1000m overview quadtree blocks (4x4 cells -> 1 cell)
   */
  private fuseTo1000m(cells: BakedCell[], totalRows: number, totalCols: number) {
    const blockFactor = 4; // 4x4 cells of 250m = 1000m
    const fusedRows = Math.ceil(totalRows / blockFactor);
    const fusedCols = Math.ceil(totalCols / blockFactor);
    const fusedCells: any[] = [];

    for (let fRow = 0; fRow < fusedRows; fRow++) {
      for (let fCol = 0; fCol < fusedCols; fCol++) {
        const matchingCells = cells.filter(
          c => Math.floor(c.row / blockFactor) === fRow && Math.floor(c.col / blockFactor) === fCol
        );

        if (matchingCells.length === 0) continue;

        const avgLat = matchingCells.reduce((acc, c) => acc + c.lat, 0) / matchingCells.length;
        const avgLon = matchingCells.reduce((acc, c) => acc + c.lon, 0) / matchingCells.length;
        const forestCells = matchingCells.filter(c => c.isForest);
        const hasForest = forestCells.length > 0;

        const avgBoletus = Math.round(
          matchingCells.reduce((acc, c) => acc + c.boletusSuitability, 0) / matchingCells.length
        );
        const avgChanterelle = Math.round(
          matchingCells.reduce((acc, c) => acc + c.chanterelleSuitability, 0) / matchingCells.length
        );
        const calcAvg = (key: keyof BakedCell) => {
          const valid = matchingCells.filter(c => typeof c[key] === 'number');
          return valid.length > 0
            ? Math.round(valid.reduce((acc, c) => acc + (c[key] as number), 0) / valid.length)
            : undefined;
        };

        const avgHydnum = calcAvg('hydnumSuitability');
        const avgCraterellusCorn = calcAvg('craterellus_cornucopioidesSuitability');
        const avgCraterellusTubae = calcAvg('craterellus_tubaeformisSuitability');
        const avgImleria = calcAvg('imleria_badiaSuitability');
        const avgLaetiporus = calcAvg('laetiporus_sulphureusSuitability');
        const avgMacrolepiota = calcAvg('macrolepiota_proceraSuitability');
        const avgSuillus = calcAvg('suillus_luteusSuitability');

        fusedCells.push({
          row: fRow,
          col: fCol,
          lat: Number(avgLat.toFixed(4)),
          lon: Number(avgLon.toFixed(4)),
          isForest: hasForest,
          boletusSuitability: avgBoletus,
          chanterelleSuitability: avgChanterelle,
          ...(avgHydnum !== undefined ? { hydnumSuitability: avgHydnum } : {}),
          ...(avgCraterellusCorn !== undefined ? { craterellus_cornucopioidesSuitability: avgCraterellusCorn } : {}),
          ...(avgCraterellusTubae !== undefined ? { craterellus_tubaeformisSuitability: avgCraterellusTubae } : {}),
          ...(avgImleria !== undefined ? { imleria_badiaSuitability: avgImleria } : {}),
          ...(avgLaetiporus !== undefined ? { laetiporus_sulphureusSuitability: avgLaetiporus } : {}),
          ...(avgMacrolepiota !== undefined ? { macrolepiota_proceraSuitability: avgMacrolepiota } : {}),
          ...(avgSuillus !== undefined ? { suillus_luteusSuitability: avgSuillus } : {})
        });
      }
    }

    return {
      rows: fusedRows,
      cols: fusedCols,
      cells: fusedCells
    };
  }

  /**
   * Creates an instant minimal tombstone for 0% forest tiles (<100ms)
   */
  createEmptyTile(tileId: string): BakedTileData {
    const bounds = parseTileBounds(tileId);
    const emptyTile: BakedTileData = {
      tileId,
      bounds,
      baseCellMeters: 250,
      rows: 22,
      cols: 14,
      forestCoveragePct: 0,
      isEmpty: true,
      cells: [],
      bakedAt: new Date().toISOString()
    };
    this.saveTile(emptyTile);
    return emptyTile;
  }
}
