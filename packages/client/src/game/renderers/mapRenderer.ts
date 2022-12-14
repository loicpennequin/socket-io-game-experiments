import { CELL_SIZE, MAP_SIZE } from '@game/shared-domain';
import { createRenderer } from '../factories/renderer';
import { MAP_CELL_OPACITY_STEP, MAP_SCALE, ONE_FRAME } from '@/utils/constants';
import {
  debounce,
  type Coordinates,
  type Dimensions
} from '@game/shared-utils';
import { drawSimpleCell, drawDetailedCell } from '../commands/drawCell';
import type { GameState } from '../factories/gameState';
import { MapRenderMode } from '@/utils/enums';

const getKey = (cell: Coordinates) => `${cell.x}.${cell.y}`;

export type CreateMapCacheRendererOptions = {
  id: string;
  mode: MapRenderMode;
  state: GameState;
};

export const createMapRenderer = ({
  id,
  mode,
  state
}: CreateMapCacheRendererOptions) => {
  const scale = CELL_SIZE / MAP_SCALE;

  const drawMethods = {
    [MapRenderMode.SIMPLE]: drawSimpleCell,
    [MapRenderMode.DETAILED]: drawDetailedCell
  } as const;

  const renderer = createRenderer({
    id,
    state,
    render: ({ ctx, state }) => {
      state.cells.drawing.forEach(cell => {
        cell.opacity += MAP_CELL_OPACITY_STEP;
        drawMethods[mode]({ ctx, cell });

        if (cell.opacity >= 1) {
          cell.opacity = 1;
          state.cells.drawing.delete(getKey(cell));
          state.cells.cache.set(getKey(cell), cell);
        }
      });
    },
    onStart({ state }) {
      const redrawMap = () => {
        const ctx = renderer.canvas.getContext(
          '2d'
        ) as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, renderer.canvas.width, renderer.canvas.height);

        state.cells.cache.forEach(cell => {
          drawMethods[mode]({ ctx, cell });
        });
      };
      window.addEventListener('resize', debounce(redrawMap, ONE_FRAME), false);
    },
    getDimensions: () => ({ w: MAP_SIZE / scale, h: MAP_SIZE / scale })
  });

  return {
    ...renderer,
    draw(ctx: CanvasRenderingContext2D, camera: Coordinates & Dimensions) {
      ctx.drawImage(
        renderer.canvas,
        camera.x / scale,
        camera.y / scale,
        camera.w / scale,
        camera.h / scale,
        camera.x,
        camera.y,
        camera.w,
        camera.h
      );
    }
  };
};

export type MapRenderer = ReturnType<typeof createMapRenderer>;
