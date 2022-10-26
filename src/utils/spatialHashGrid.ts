import { sat } from './math';
import type { Boundaries, Coordinates, Dimensions, Nullable } from './index';
import { createMatrix } from './index';

export type SpatialHashGridItem = {
  position: Coordinates;
  dimensions: Dimensions;
  cells: {
    min: Nullable<Coordinates>;
    max: Nullable<Coordinates>;
    nodes: Nullable<Coordinates[]>;
  };
  queryId: Nullable<number>;
};

export type SpatialHashGridNode = {
  next: Nullable<SpatialHashGridNode>;
  prev: Nullable<SpatialHashGridNode>;
  item: SpatialHashGridItem;
};

export const makeSpatialHashGrid = (
  dimensions: Dimensions,
  bounds: [Coordinates, Coordinates]
) => {
  const [startBound, endBound] = bounds;
  const cells = createMatrix<Nullable<SpatialHashGridNode>>(
    dimensions,
    () => null
  );
  let currentQueryId = 0;

  const getCellCoordinates = (position: Coordinates): Coordinates => {
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
  }: Pick<
    SpatialHashGridItem,
    'position' | 'dimensions'
  >): Boundaries<Coordinates> => {
    return {
      min: getCellCoordinates({
        x: position.x - dimensions.w / 2,
        y: position.y - dimensions.h / 2
      }),
      max: getCellCoordinates({
        x: position.x + dimensions.w / 2,
        y: position.y + dimensions.h / 2
      })
    };
  };

  const insert = (item: SpatialHashGridItem) => {
    const { min, max } = getBoundaries(item);
    const nodes = [];

    for (let x = min.x, xn = max.x; x <= xn; ++x) {
      nodes.push([]);

      for (let y = min.y, yn = max.y; y <= yn; ++y) {
        const head: SpatialHashGridNode = {
          next: null,
          prev: null,
          item
        };

        nodes[x - max.x].push(head);

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

  const add = (position: Coordinates, dimensions: Dimensions) => {
    const item = {
      position,
      dimensions,
      cells: {
        min: null,
        max: null,
        nodes: null
      },
      queryId: null
    };

    insert(item);

    return item;
  };

  const remove = (item: SpatialHashGridItem) => {
    const { min, max } = item.cells;

    for (let x = min.x, xn = max.x; x <= xn; ++x) {
      for (let y = min.y, yn = max.y; y <= yn; ++y) {
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

  const update = (item: SpatialHashGridItem) => {
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

    const items: SpatialHashGridItem[] = [];
    currentQueryId++;

    for (let x = min.x, xn = max.x; x <= xn; ++x) {
      for (let y = min.y, yn = max.y; y <= yn; ++y) {
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
