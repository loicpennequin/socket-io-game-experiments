import { type GameMapCell, MAP_SIZE } from '@game/shared-domain';
import { state } from '../stores/gameState';
import { createRenderer } from '../factories/renderer';
import {
  MAP_CELL_OPACITY_STEP,
  ONE_FRAME,
  TERRAIN_LIGHTNESS_BOUNDARIES
} from '@/utils/constants';
import {
  debounce,
  randomInRange,
  type Coordinates,
  type Dimensions
} from '@game/shared-utils';
import { drawCell } from '@/commands/drawCell';

const getKey = (cell: Coordinates) => `${cell.x}.${cell.y}`;

export type CreateMapCacheRendererOptions = {
  id: string;
};

export type MapRendererCell = GameMapCell & {
  opacity: number;
  lightness: number;
};

export const createMapRenderer = ({ id }: CreateMapCacheRendererOptions) => {
  const cellsToDraw = new Map<string, MapRendererCell>();
  const cachedCells = new Map<string, MapRendererCell>();

  const redrawMap = () => {
    console.log(`redrawing map: ${cachedCells.size} cells cached`);
    const ctx = renderer.canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, renderer.canvas.width, renderer.canvas.height);

    cachedCells.forEach(cell => {
      drawCell({ ctx, cell });
    });
  };
  window.addEventListener('resize', debounce(redrawMap, ONE_FRAME), false);

  const renderer = createRenderer({
    id,
    render: ({ ctx }) => {
      state.discoveredCells.forEach(cell => {
        const key = getKey(cell);
        if (cellsToDraw.has(key)) return;
        cellsToDraw.set(key, {
          ...cell,
          opacity: 0,
          lightness: randomInRange({
            min: TERRAIN_LIGHTNESS_BOUNDARIES[cell.type].min,
            max: TERRAIN_LIGHTNESS_BOUNDARIES[cell.type].max
          })
        });
      });
      // terrible hack, we need accumulate cells in the state then remove the processed ones in the mapRenderer
      // otherwise we run the risk of missing discovered cells
      state.discoveredCells = [];
      cellsToDraw.forEach(cell => {
        cell.opacity += MAP_CELL_OPACITY_STEP;
        drawCell({ ctx, cell });

        if (cell.opacity >= 1) {
          cell.opacity = 1;
          cellsToDraw.delete(getKey(cell));
          cachedCells.set(getKey(cell), cell);
        }
      });
    },
    getDimensions: () => ({ w: MAP_SIZE, h: MAP_SIZE })
  });

  return {
    ...renderer,
    redrawMap,
    draw(ctx: CanvasRenderingContext2D, camera: Coordinates & Dimensions) {
      ctx.drawImage(
        renderer.canvas,
        camera.x,
        camera.y,
        camera.w,
        camera.h,
        camera.x,
        camera.y,
        camera.w,
        camera.h
      );
    }
  };
};

export type MapRenderer = ReturnType<typeof createMapRenderer>;
