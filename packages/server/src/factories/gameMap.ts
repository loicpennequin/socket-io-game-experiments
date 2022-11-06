import {
  GRID_SIZE,
  CELL_SIZE,
  GameMapCell,
  TerrainType,
  MAP_NOISE_DETAIL
} from '@game/shared-domain';
import {
  Coordinates,
  createMatrix,
  dist,
  createSpatialHashGrid,
  SpatialHashGridItem,
  createNoise
} from '@game/shared-utils';

export type MapGridMeta = {
  id: string;
};

export type MapGridItem = SpatialHashGridItem<MapGridMeta>;

const NOISE_TO_TERRAIN_MAP: Record<number, TerrainType> = {
  0: TerrainType.DEEP_WATER,
  1: TerrainType.DEEP_WATER,
  2: TerrainType.WATER,
  3: TerrainType.WATER,
  4: TerrainType.SAND,
  5: TerrainType.GRASS,
  6: TerrainType.GRASS,
  7: TerrainType.LOW_MOUNTAIN,
  8: TerrainType.LOW_MOUNTAIN,
  9: TerrainType.HIGH_MOUNTAIN,
  10: TerrainType.SNOW
};

export const createGameMap = () => {
  const getCellTerrain = (noise: number): TerrainType => {
    return NOISE_TO_TERRAIN_MAP[Math.round(noise * 10)];
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
    const noise = noiseSeed.get({
      x: x * MAP_NOISE_DETAIL,
      y: y * MAP_NOISE_DETAIL
    });

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
