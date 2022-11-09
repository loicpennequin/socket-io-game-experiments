import {
  GRID_SIZE,
  CELL_SIZE,
  GameMapCellDto,
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
import { Entity } from './Entity';

export type GameMapGridMeta = {
  id: string;
};

export type GameMapCell = GameMapCellDto & {
  visitedBy: Set<string>;
  toDto: () => GameMapCellDto;
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

  private createCell({ x, y }: Coordinates): GameMapCell {
    const noise = this.noiseSeed.get({
      x: x * MAP_NOISE_DETAIL,
      y: y * MAP_NOISE_DETAIL
    });

    return {
      x,
      y,
      type: NOISE_TO_TERRAIN_MAP[(Math.round(noise * 20) / 2) * 10],
      visitedBy: new Set<string>(),
      toDto() {
        return { x, y, type: this.type };
      }
    };
  }

  getTerrainAtPosition(position: Coordinates) {
    const cellIndex = this.grid.getCellIndex(position);

    return this.cells[cellIndex.x][cellIndex.y].type;
  }

  getVisibleCells({ position, id }: Entity, fieldOfView: number) {
    const indices = {
      point: this.grid.getCellIndex(position),
      min: this.grid.getCellIndex({
        x: position.x - fieldOfView,
        y: position.y - fieldOfView
      }),
      max: this.grid.getCellIndex({
        x: position.x + fieldOfView,
        y: position.y + fieldOfView
      })
    };

    const cells: GameMapCell[] = [];
    for (let x = indices.min.x; x <= indices.max.x; x++) {
      for (let y = indices.min.y; y <= indices.max.y; y++) {
        const positionToCompare = {
          x: x * CELL_SIZE + (x < indices.point.x ? CELL_SIZE : 0),
          y: y * CELL_SIZE + (y < indices.point.y ? CELL_SIZE : 0)
        };

        if (dist(position, positionToCompare) <= fieldOfView) {
          const cell = this.cells[x]?.[y];
          if (!cell) continue;
          if (cell.visitedBy.has(id)) continue;
          cell.visitedBy.add(id);
          cells.push(cell);
        }
      }
    }

    return cells;
  }
}
