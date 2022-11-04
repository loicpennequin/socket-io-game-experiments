import { pushPop } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { state } from '@/gameState';
import {
  type Coordinates,
  type Dimensions,
  pointRectCollision
} from '@game/shared-utils';
import { type GameMapCell, CELL_SIZE } from '@game/shared-domain';

type DrawMapOptions = {
  ctx: CanvasRenderingContext2D;
  opacity?: number;
  boundaries?: Coordinates & Dimensions;
  boundariesBuffer?: number;
  showLightness?: boolean;
};

type DrawCellOptions = {
  ctx: CanvasRenderingContext2D;
  showLightness: boolean;
  cell: GameMapCell;
};

const DEFAULT_BOUNDARIES = {
  x: 0,
  y: 0,
  w: Infinity,
  h: Infinity
};
const DEFAULT_LIGHTNESS = 50;
const DEFAULT_BOUNDARIES_BUFFER = 50;

export const drawCell = ({ ctx, cell, showLightness }: DrawCellOptions) => {
  ctx.fillStyle = COLORS.mapCell({
    lightness: showLightness ? cell.lightness * 100 : DEFAULT_LIGHTNESS
  });
  ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
};

export const drawMap = ({
  ctx,
  boundaries = DEFAULT_BOUNDARIES,
  boundariesBuffer = DEFAULT_BOUNDARIES_BUFFER,
  showLightness = true
}: DrawMapOptions) => {
  pushPop(ctx, () => {
    const cells = state.discoveredCells;
    const bufferedBoundaries = {
      x: boundaries.x - boundariesBuffer,
      y: boundaries.y - boundariesBuffer,
      w: boundaries.w + boundariesBuffer * 2,
      h: boundaries.h + boundariesBuffer * 2
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

      drawCell({ ctx, cell, showLightness });
    });
  });
};
