import {
  GRID_SIZE,
  CELL_SIZE,
  GameMapCell,
  TerrainType
} from '@game/shared-domain';
import {
  Coordinates,
  createMatrix,
  dist,
  createSpatialHashGrid,
  perlinMatrix,
  SpatialHashGridItem,
  createNoise
} from '@game/shared-utils';

export type MapGridMeta = {
  id: string;
};

export type MapGridItem = SpatialHashGridItem<MapGridMeta>;

const GRASS_THRESHOLD = 0.35;
const HILL_THRESHOLD = 0.7;

export const createGameMap = () => {
  const getCellTerrain = (noise: number): TerrainType => {
    if (noise < GRASS_THRESHOLD) return TerrainType.WATER;
    if (noise < HILL_THRESHOLD) return TerrainType.GRASS;
    return TerrainType.MOUNTAIN;
  };
  const grid = createSpatialHashGrid<MapGridMeta>({
    dimensions: { w: GRID_SIZE, h: GRID_SIZE },
    bounds: {
      start: { x: 0, y: 0 },
      end: { x: GRID_SIZE * CELL_SIZE, y: GRID_SIZE * CELL_SIZE }
    }
  });

  const mapDimensions = { w: GRID_SIZE, h: GRID_SIZE };
  const noiseSeed = createNoise();

  const cells = createMatrix<GameMapCell>(mapDimensions, ({ x, y }) => {
    const noise = noiseSeed.get({ x: x * 0.1, y: y * 0.1 });

    return {
      x,
      y,
      type: getCellTerrain(noise)
    };
  });

  return {
    grid,
    cells,
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
        point: grid.getCellIndex(point),
        min: grid.getCellIndex(coords.min),
        max: grid.getCellIndex(coords.max)
      };

      const entries: [string, GameMapCell][] = [];
      for (let x = indices.min.x; x <= indices.max.x; x++) {
        for (let y = indices.min.y; y <= indices.max.y; y++) {
          const pointToCompare = {
            x: x * CELL_SIZE + (x < indices.point.x ? CELL_SIZE : 0),
            y: y * CELL_SIZE + (y < indices.point.y ? CELL_SIZE : 0)
          };

          if (dist(point, pointToCompare) <= fieldOfView) {
            const cell = cells[x]?.[y];
            if (cell) {
              entries.push([`${x}.${y}`, cell]);
            }
          }
        }
      }

      return new Map(entries);
    }
  };
};

export type GameMap = ReturnType<typeof createGameMap>;
