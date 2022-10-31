import { pushPop } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { state } from '@/gameState';
import {
  type GameMapCell,
  CELL_SIZE,
  type Boundaries,
  type Coordinates,
  pointRectCollision,
  type Dimensions
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

export const drawMap = ({
  ctx,
  showCoordinates = false,
  boundaries = DEFAULT_BOUNDARIES
}: DrawMapOptions) => {
  pushPop(ctx, () => {
    const cells = state.discoveredCells as GameMapCell[]; // typescript issue because of toRefs ? it says cell is Coordinates
    cells.forEach(cell => {
      const isInBounds = pointRectCollision(
        {
          x: cell.x * CELL_SIZE,
          y: cell.y * CELL_SIZE
        },
        boundaries
      );

      if (!isInBounds) return;

      ctx.fillStyle = COLORS.mapCell({
        lightness: cell.lightness * 100
      });
      ctx.fillRect(
        cell.x * CELL_SIZE,
        cell.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );

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
    });
  });
};
