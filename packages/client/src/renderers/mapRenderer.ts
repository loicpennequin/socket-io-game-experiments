import { type GameMapCell, MAP_SIZE, CELL_SIZE } from '@game/shared-domain';
import { state } from '../gameState';
import type { Camera } from '../commands/applyCamera';
import { createRenderer } from '../factories/renderer';
import {
  DEFAULT_CELL_LIGHTNESS,
  MAP_CELL_OPACITY_STEP,
  MAP_HUE
} from '@/utils/constants';
import { debounce } from '@game/shared-utils';

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

  window.addEventListener(
    'resize',
    debounce(() => {
      setTimeout(() => {
        console.log('redraw cached map');
        const ctx = renderer.canvas.getContext(
          '2d'
        ) as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, renderer.canvas.width, renderer.canvas.height);
        console.log(cachedCells.size);
        cachedCells.forEach(cell => {
          const { h, s, l, a } = {
            h: cell.opacity >= 1 ? MAP_HUE : 0,
            s: 30,
            l: showLightness ? cell.lightness * 100 : DEFAULT_CELL_LIGHTNESS,
            a: cell.opacity
          };
          ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${a})`;
          ctx.fillRect(
            cell.x * CELL_SIZE,
            cell.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
          );
        });
      });
    }, 16),
    false
  );

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
        ctx.clearRect(
          cell.x * CELL_SIZE,
          cell.y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        );

        const { h, s, l, a } = {
          h: MAP_HUE,
          s: 30,
          l: showLightness ? cell.lightness * 100 : DEFAULT_CELL_LIGHTNESS,
          a: cell.opacity
        };

        ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${a})`;
        ctx.fillRect(
          cell.x * CELL_SIZE,
          cell.y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        );

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
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
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
