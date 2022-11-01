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
import {
  applyFieldOfView,
  type ApplyFieldOfViewOptions
} from './applyFieldOfView';

type DrawMapOptions = {
  ctx: CanvasRenderingContext2D;
  opacity?: number;
  boundaries?: Coordinates & Dimensions;
  showLightness?: boolean;
};

const DEFAULT_BOUNDARIES = {
  x: 0,
  y: 0,
  w: Infinity,
  h: Infinity
};

const DEFAULT_LIGHTNESS = 50;
const BOUNDARIES_BUFFER = 50;

type DrawCellOptions = {
  ctx: CanvasRenderingContext2D;
  showLightness: boolean;
  cell: GameMapCell;
};

const drawCell = ({ ctx, cell, showLightness }: DrawCellOptions) => {
  ctx.fillStyle = COLORS.mapCell({
    lightness: showLightness ? cell.lightness * 100 : DEFAULT_LIGHTNESS
  });
  ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
};

export const drawMap = ({
  ctx,
  boundaries = DEFAULT_BOUNDARIES,
  showLightness = true
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

      drawCell({ ctx, cell, showLightness });
    });
  });
};

type DrawMapInFieldOfViewOptions = Omit<DrawMapOptions, 'boundaries'> &
  ApplyFieldOfViewOptions;

export const drawMapInFieldOfView = ({
  ctx,
  showLightness = true,
  entityId,
  fieldOfView
}: DrawMapInFieldOfViewOptions) => {
  applyFieldOfView(
    {
      ctx,
      entityId,
      fieldOfView
    },
    boundaries => {
      drawMap({
        ctx,
        showLightness,
        boundaries: {
          ...boundaries.min,
          w: boundaries.w,
          h: boundaries.h
        }
      });
    }
  );
};
