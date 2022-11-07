import {
  GRID_SIZE,
  CELL_SIZE,
  GameMapCell,
  MAP_NOISE_DETAIL,
  NOISE_TO_TERRAIN_MAP
} from '@game/shared-domain';
import {
  Coordinates,
  createMatrix,
  dist,
  createSpatialHashGrid,
  SpatialHashGridItem,
  createNoise,
  Matrix
} from '@game/shared-utils';

export type GameMapGridMeta = {
  id: string;
};

export type GameMapGridItem = SpatialHashGridItem<GameMapGridMeta>;

export class GameMap {
  public grid = createSpatialHashGrid<GameMapGridMeta>({
    dimensions: { w: GRID_SIZE, h: GRID_SIZE },
    bounds: {
      start: { x: 0, y: 0 },
      end: { x: GRID_SIZE * CELL_SIZE, y: GRID_SIZE * CELL_SIZE }
    }
  });

  public cells: Matrix<GameMapCell>;

  private noiseSeed = createNoise();

  constructor() {
    this.cells = this.initCells();
  }

  private initCells() {
    return createMatrix<GameMapCell>({ w: GRID_SIZE, h: GRID_SIZE }, coords =>
      this.createCell(coords)
    );
  }

  private createCell({ x, y }: Coordinates) {
    const noise = this.noiseSeed.get({
      x: x * MAP_NOISE_DETAIL,
      y: y * MAP_NOISE_DETAIL
    });

    return {
      x,
      y,
      type: NOISE_TO_TERRAIN_MAP[(Math.round(noise * 20) / 2) * 10]
    };
  }

  getTerrainAtPosition(position: Coordinates) {
    const cellIndex = this.grid.getCellIndex(position);

    return this.cells[cellIndex.x][cellIndex.y].type;
  }

  getVisibleCells(point: Coordinates, fieldOfView: number) {
    const coords = {
      min: {
        x: point.x - fieldOfView,
        y: point.y - fieldOfView
      },
      max: {
        x: point.x + fieldOfView,
        y: point.y + fieldOfView
      }
    };

    const indices = {
      point: this.grid.getCellIndex(point),
      min: this.grid.getCellIndex(coords.min),
      max: this.grid.getCellIndex(coords.max)
    };

    const entries: [string, GameMapCell][] = [];
    for (let x = indices.min.x; x <= indices.max.x; x++) {
      for (let y = indices.min.y; y <= indices.max.y; y++) {
        const pointToCompare = {
          x: x * CELL_SIZE + (x < indices.point.x ? CELL_SIZE : 0),
          y: y * CELL_SIZE + (y < indices.point.y ? CELL_SIZE : 0)
        };

        if (dist(point, pointToCompare) <= fieldOfView) {
          const cell = this.cells[x]?.[y];
          if (cell) {
            entries.push([`${x}.${y}`, cell]);
          }
        }
      }
    }

    return new Map(entries);
  }
}
