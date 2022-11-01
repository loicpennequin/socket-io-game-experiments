import { pushPop } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { state } from '@/gameState';
import {
  type GameMapCell,
  type Coordinates,
  type Dimensions,
  CELL_SIZE,
  pointRectCollision
} from '@game/shared';

type DrawMapOptions = {
  ctx: CanvasRenderingContext2D;
  opacity?: number;
  boundaries?: Coordinates & Dimensions;
};

const DEFAULT_BOUNDARIES = {
  x: 0,
  y: 0,
  w: Infinity,
  h: Infinity
};

const BOUNDARIES_BUFFER = 50;

type DrawCellOptions = {
  ctx: CanvasRenderingContext2D;
  cell: GameMapCell;
};

const drawCell = ({ ctx, cell }: DrawCellOptions) => {
  ctx.fillStyle = COLORS.mapCell({
    lightness: cell.lightness * 100
  });
  ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
};

export const drawMap = ({
  ctx,
  boundaries = DEFAULT_BOUNDARIES
}: DrawMapOptions) => {
  pushPop(ctx, () => {
    const cells = state.discoveredCells;
    const bufferedBoundaries = {
      x: boundaries.x - BOUNDARIES_BUFFER,
      y: boundaries.y - BOUNDARIES_BUFFER,
      w: boundaries.w + BOUNDARIES_BUFFER,
      h: boundaries.h + BOUNDARIES_BUFFER
    };

    cells.forEach(cell => {
      const isInBounds = pointRectCollision(
        {
          x: cell.x * CELL_SIZE,
          y: cell.y * CELL_SIZE
        },
        bufferedBoundaries
      );

      if (!isInBounds) return;

      drawCell({ ctx, cell });
    });
  });
};
