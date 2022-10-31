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
  showCoordinates?: boolean;
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
  showCoordinates: boolean;
};

const drawCell = ({ ctx, cell, showCoordinates }: DrawCellOptions) => {
  ctx.fillStyle = COLORS.mapCell({
    lightness: cell.lightness * 100
  });
  ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  if (!showCoordinates) return;
  ctx.font = `${CELL_SIZE * 0.3}px Helvetica`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgb(255,255,255,0.5)';
  ctx.fillText(
    `${cell.x}.${cell.y}`,
    cell.x * CELL_SIZE + CELL_SIZE / 2,
    cell.y * CELL_SIZE + CELL_SIZE / 2
  );
};

export const drawMap = ({
  ctx,
  showCoordinates = false,
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

      drawCell({ ctx, cell, showCoordinates });
    });
  });
};
