import {
  GRID_SIZE,
  CELL_SIZE,
  PLAYER_FIELD_OF_VIEW,
  GameMapCell
} from '@game/shared-domain';
import {
  Coordinates,
  createMatrix,
  dist,
  createSpatialHashGrid,
  mapRange,
  perlinMatrix,
  SpatialHashGridItem
} from '@game/shared-utils';

export type MapGridMeta = {
  id: string;
};

export type MapGridItem = SpatialHashGridItem<MapGridMeta>;

export const createGameMap = () => {
  const grid = createSpatialHashGrid<MapGridMeta>({
    dimensions: { w: GRID_SIZE, h: GRID_SIZE },
    bounds: {
      start: { x: 0, y: 0 },
      end: { x: GRID_SIZE * CELL_SIZE, y: GRID_SIZE * CELL_SIZE }
    }
  });

  const mapDimensions = { w: GRID_SIZE, h: GRID_SIZE };
  const noiseSeed = perlinMatrix(mapDimensions);

  const cells = createMatrix(mapDimensions, ({ x, y }) => {
    const noise = Math.round(noiseSeed[x][y] * 100) / 100;
    return {
      x,
      y,
      lightness: mapRange(noise, { min: 0, max: 1 }, { min: 0.3, max: 0.75 })
    };
  });

  return {
    grid,
    cells,
    getVisibleCells(point: Coordinates, fieldOfView: number) {
      const coords = {
        min: {
          x: point.x - PLAYER_FIELD_OF_VIEW,
          y: point.y - PLAYER_FIELD_OF_VIEW
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
