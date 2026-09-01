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

        fusedCells.push({
          row: fRow,
          col: fCol,
          lat: Number(avgLat.toFixed(4)),
          lon: Number(avgLon.toFixed(4)),
          isForest: hasForest,
          boletusSuitability: avgBoletus,
          chanterelleSuitability: avgChanterelle
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
