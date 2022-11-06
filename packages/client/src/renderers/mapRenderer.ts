import { type GameMapCell, MAP_SIZE } from '@game/shared-domain';
import { state } from '../stores/gameState';
import { createRenderer } from '../factories/renderer';
import { MAP_CELL_OPACITY_STEP } from '@/utils/constants';
import {
  debounce,
  type Coordinates,
  type Dimensions
} from '@game/shared-utils';
import { drawCell } from '@/commands/drawCell';

const getKey = (cell: GameMapCell) => `${cell.x}.${cell.y}`;

export type CreateMapCacheRendererOptions = {
  showLightness: boolean;
  id: string;
};

export const createMapRenderer = ({
  showLightness,
  id
}: CreateMapCacheRendererOptions) => {
  const cellsToDraw = new Map<string, GameMapCell & { opacity: number }>();
  const cachedCells = new Map<string, GameMapCell & { opacity: number }>();

  const redrawMap = () => {
    console.log(`redrawing map: ${cachedCells.size} cells cached`);
    const ctx = renderer.canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, renderer.canvas.width, renderer.canvas.height);

    cachedCells.forEach(cell => {
      drawCell({ ctx, cell, showLightness, opacity: cell.opacity });
    });
  };
  window.addEventListener('resize', debounce(redrawMap, 16), false);

  const renderer = createRenderer({
    id,
    render: ({ ctx }) => {
      state.discoveredCells.forEach(cell => {
        const key = getKey(cell);
        if (cellsToDraw.has(key)) return;
        cellsToDraw.set(key, { ...cell, opacity: 0 });
      });
      cellsToDraw.forEach(cell => {
        cell.opacity += MAP_CELL_OPACITY_STEP;

        drawCell({ ctx, cell, showLightness, opacity: cell.opacity });

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
