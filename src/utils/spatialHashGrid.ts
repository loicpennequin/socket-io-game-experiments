import { sat } from './math';
import type {
  Boundaries,
  SpatialObject,
  Coordinates,
  Dimensions,
  Nullable
} from './index';
import { createMatrix } from './index';

export type SpatialHashGridItem<TMeta> = SpatialObject & {
  cells: {
    min: Nullable<Coordinates>;
    max: Nullable<Coordinates>;
    nodes: Nullable<Coordinates[]>;
  };
  queryId: Nullable<number>;
  meta: TMeta;
};

export type SpatialHashGridNode<TMeta> = {
  next: Nullable<SpatialHashGridNode<TMeta>>;
  prev: Nullable<SpatialHashGridNode<TMeta>>;
  item: SpatialHashGridItem<TMeta>;
};

export type SpatialHashGridOptions = {
  dimensions: Dimensions;
  bounds: { start: Coordinates; end: Coordinates };
};

export type SpatialHashGrid<T> = ReturnType<typeof makeSpatialHashGrid<T>>;

export const makeSpatialHashGrid = <TMeta = unknown>({
  dimensions,
  bounds
}: SpatialHashGridOptions) => {
  type GridItem = SpatialHashGridItem<TMeta>;
  type GridNode = SpatialHashGridNode<TMeta>;

  const { start: startBound, end: endBound } = bounds;
  const cells = createMatrix<Nullable<GridNode>>(dimensions, () => null);
  let currentQueryId = 0;

  const getCellIndex = (position: Coordinates): Coordinates => {
    const xPos = sat((position.x - startBound.x) / (endBound.x - startBound.x));
    const yPos = sat((position.y - startBound.y) / (endBound.y - startBound.y));

    return {
      x: Math.floor(xPos * (dimensions.w - 1)),
      y: Math.floor(yPos * (dimensions.h - 1))
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
    const { min, max } = getBoundaries(item);
    const nodes = [];

    for (let x = min.x; x <= max.x; ++x) {
      nodes.push([]);

      for (let y = min.y; y <= max.y; ++y) {
        const head: GridNode = {
          next: null,
          prev: null,
          item
        };

        nodes[x - min.x].push(head);

        head.next = cells[x][y];
        if (head.next) {
          head.next.prev = head;
        }

        cells[x][y] = head;
      }
    }

    item.cells.min = min;
    item.cells.max = max;
    item.cells.nodes = nodes;
  };

  const add = ({ position, dimensions }: SpatialObject, meta: TMeta) => {
    const item: GridItem = {
      position,
      dimensions,
      cells: {
        min: null,
        max: null,
        nodes: null
      },
      queryId: null,
      meta
    };

    insert(item);

    return item;
  };

  const remove = (item: GridItem) => {
    const { min, max } = item.cells;

    for (let x = min.x; x <= max.x; ++x) {
      for (let y = min.y; y <= max.y; ++y) {
        const xi = x - min.x;
        const yi = y - min.y;
        const node = item.cells.nodes[xi][yi];

        if (node.next) {
          node.next.prev = node.prev;
        }
        if (node.prev) {
          node.prev.next = node.next;
        }

        if (!node.prev) {
          cells[x][y] = node.next;
        }
      }
    }

    item.cells.min = null;
    item.cells.max = null;
    item.cells.nodes = null;
  };

  const update = (item: GridItem) => {
    const { min, max } = getBoundaries(item);

    const hasChangedCell =
      item.cells.min.x !== min.x ||
      item.cells.min.y !== min.y ||
      item.cells.max.x !== max.x ||
      item.cells.max.y !== max.y;

    if (!hasChangedCell) return;

    remove(item);
    insert(item);
  };

  const findNearby = (position: Coordinates, bounds: Dimensions) => {
    const { min, max } = getBoundaries({ position, dimensions: bounds });

    const items: GridItem[] = [];
    currentQueryId++;

    for (let x = min.x; x <= max.x; ++x) {
      for (let y = min.y; y <= max.y; ++y) {
        let head = cells[x][y];

        while (head) {
          const v = head.item;
          head = head.next;

          if (v.queryId !== currentQueryId) {
            v.queryId = currentQueryId;
            items.push(v);
          }
        }
      }
    }
    return items;
  };

  return {
    add,
    remove,
    update,
    findNearby
  };
};
