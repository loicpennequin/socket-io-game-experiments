import {
  CELL_SIZE,
  Coordinates,
  createMatrix,
  dist,
  GameMapCell,
  GRID_SIZE,
  makeSpatialHashGrid,
  mapRange,
  perlinMatrix,
  PLAYER_FIELD_OF_VIEW,
  SpatialHashGridItem
} from '@game/shared';

export type GridMeta = {
  id: string;
};

export type MapGridItem = SpatialHashGridItem<GridMeta>;

const grid = makeSpatialHashGrid<GridMeta>({
  dimensions: { w: GRID_SIZE, h: GRID_SIZE },
  bounds: {
    start: { x: 0, y: 0 },
    end: { x: GRID_SIZE * CELL_SIZE, y: GRID_SIZE * CELL_SIZE }
  }
});

const mapDimensions = { w: GRID_SIZE, h: GRID_SIZE };
const noiseSeed = perlinMatrix(mapDimensions);

const map = createMatrix(mapDimensions, ({ x, y }) => {
  const noise = Math.round(noiseSeed[x][y] * 100) / 100;
  return {
    x,
    y,
    lightness: mapRange(noise, { min: 0, max: 1 }, { min: 0.3, max: 0.75 })
  };
});

const getVisibleCells = (point: Coordinates, fieldOfView: number) => {
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
    point: mapController.grid.getCellIndex(point),
    min: mapController.grid.getCellIndex(coords.min),
    max: mapController.grid.getCellIndex(coords.max)
  };

  const entries: [string, GameMapCell][] = [];
  for (let x = indices.min.x; x <= indices.max.x; x++) {
    for (let y = indices.min.y; y <= indices.max.y; y++) {
      const pointToCompare = {
        x: x * CELL_SIZE + (x < indices.point.x ? CELL_SIZE : 0),
        y: y * CELL_SIZE + (y < indices.point.y ? CELL_SIZE : 0)
      };

      if (dist(point, pointToCompare) <= fieldOfView) {
        const cell = map[x]?.[y];
        if (cell) {
          entries.push([`${x}.${y}`, cell]);
        }
      }
    }
  }

  return new Map(entries);
};

export const mapController = {
  grid,
  map,
  getVisibleCells
};

export type MapController = typeof mapController;
