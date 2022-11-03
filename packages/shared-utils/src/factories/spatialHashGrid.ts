import { sat } from '../math';
import { pointCircleCollision, pointRectCollision } from '../collision';
import { createMatrix } from '../helpers';
import type {
  SpatialObject,
  Coordinates,
  Boundaries,
  Nullable,
  Dimensions
} from '../types';

export type SpatialHashGridItem<TMeta> = SpatialObject & {
  cellsIndices: Coordinates[];
  boundaries: Boundaries<Coordinates>;
  queryId: Nullable<number>;
  meta: TMeta;
};

export type SpatialHashGridNode<TMeta> = {
  items: SpatialHashGridItem<TMeta>[];
};

export type SpatialHashGridOptions = {
  dimensions: Dimensions;
  bounds: { start: Coordinates; end: Coordinates };
};

export type SpatialHashGrid<T> = ReturnType<typeof createSpatialHashGrid<T>>;

export const createSpatialHashGrid = <TMeta = unknown>({
  dimensions,
  bounds
}: SpatialHashGridOptions) => {
  type GridItem = SpatialHashGridItem<TMeta>;
  type GridNode = SpatialHashGridNode<TMeta>;

  const { start: startBound, end: endBound } = bounds;
  const cells = createMatrix<Nullable<GridNode>>(dimensions, () => ({
    items: []
  }));
  let currentQueryId = 0;

  const getCellIndex = (position: Coordinates): Coordinates => {
    const xPos = sat((position.x - startBound.x) / (endBound.x - startBound.x));
    const yPos = sat((position.y - startBound.y) / (endBound.y - startBound.y));

    return {
      x: Math.floor(xPos * dimensions.w),
      y: Math.floor(yPos * dimensions.h)
    };
  };

  const getBoundaries = ({
    position,
    dimensions
  }: SpatialObject): Boundaries<Coordinates> => {
    return {
      min: getCellIndex({
        x: position.x - dimensions.w / 2,
        y: position.y - dimensions.h / 2
      }),
      max: getCellIndex({
        x: position.x + dimensions.w / 2,
        y: position.y + dimensions.h / 2
      })
    };
  };

  const insert = (item: GridItem) => {
    const { min, max } = item.boundaries;
    const itemCells: Coordinates[] = [];
    for (let x = min.x; x <= max.x; ++x) {
      for (let y = min.y; y <= max.y; ++y) {
        itemCells.push({ x, y });
        cells[x]?.[y]?.items.push(item);
      }
    }

    item.cellsIndices = itemCells;
  };

  const add = ({ position, dimensions }: SpatialObject, meta: TMeta) => {
    const item: GridItem = {
      position,
      dimensions,
      cellsIndices: [],
      boundaries: getBoundaries({ position, dimensions }),
      queryId: null,
      meta
    };

    insert(item);

    return item;
  };

  const remove = (item: GridItem) => {
    item.cellsIndices.forEach(({ x, y }) => {
      const cell = cells[x]?.[y];
      if (!cell) return;

      const { items } = cell;
      items.splice(items.indexOf(item), 1);
    });
  };

  const update = (item: GridItem) => {
    const { min, max } = getBoundaries(item);

    const hasChangedCell =
      item.boundaries.min.x !== min.x ||
      item.boundaries.min.y !== min.y ||
      item.boundaries.max.x !== max.x ||
      item.boundaries.max.y !== max.y;

    if (!hasChangedCell) return;
    item.boundaries = { min, max };
    remove(item);
    insert(item);
  };

  const findNearby = (position: Coordinates, bounds: Dimensions) => {
    const { min, max } = getBoundaries({ position, dimensions: bounds });
    const nearby: GridItem[] = [];
    currentQueryId++;

    for (let x = min.x; x <= max.x; ++x) {
      for (let y = min.y; y <= max.y; ++y) {
        const cell = cells[x][y];
        cell?.items.forEach(item => {
          const isWithinBounds = pointRectCollision(item.position, {
            x: position.x - bounds.w / 2,
            y: position.y - bounds.h / 2,
            ...bounds
          });

          if (!isWithinBounds) return;
          if (item.queryId === currentQueryId) return;

          item.queryId = currentQueryId;
          nearby.push(item);
        });
      }
    }
    return nearby;
  };

  const findNearbyRadius = (position: Coordinates, radius: number) => {
    const { min, max } = getBoundaries({
      position,
      dimensions: { w: radius * 2, h: radius * 2 }
    });
    const nearby: GridItem[] = [];
    currentQueryId++;

    for (let x = min.x; x <= max.x; ++x) {
      for (let y = min.y; y <= max.y; ++y) {
        const cell = cells[x]?.[y];
        if (!cell) continue;
        cell.items.forEach(item => {
          const isWithinBounds = pointCircleCollision(item.position, {
            ...position,
            r: radius
          });

          if (!isWithinBounds) return;
          if (item.queryId === currentQueryId) return;

          item.queryId = currentQueryId;
          nearby.push(item);
        });
      }
    }

    return nearby;
  };

  return {
    add,
    remove,
    update,
    findNearby,
    findNearbyRadius,
    getCellIndex
  };
};
