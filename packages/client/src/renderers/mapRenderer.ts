import { type GameMapCell, MAP_SIZE, CELL_SIZE } from '@game/shared-domain';
import { state } from '../gameState';
import type { Camera } from '../commands/applyCamera';
import { createRenderer } from '../factories/renderer';
import { drawCell } from '../commands/drawMap';
import {
  COLORS,
  DEFAULT_CELL_LIGHTNESS,
  MAP_CELL_OPACITY_STEP
} from '@/utils/constants';

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

  // window.addEventListener(
  //   'resize',
  //   () => {
  //     drawnCells.clear();
  //   },
  //   false
  // );

  const renderer = createRenderer({
    id,
    render: ({ ctx }) => {
      state.discoveredCells.forEach(cell => {
        const key = getKey(cell);
        if (cellsToDraw.has(key)) return;
        cellsToDraw.set(key, { ...cell, opacity: MAP_CELL_OPACITY_STEP });
      });

      cellsToDraw.forEach(cell => {
        ctx.clearRect(
          cell.x * CELL_SIZE,
          cell.y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        );
        ctx.fillStyle = COLORS.mapCell({
          lightness: showLightness
            ? cell.lightness * 100
            : DEFAULT_CELL_LIGHTNESS,
          opacity: cell.opacity
        });
        ctx.fillRect(
          cell.x * CELL_SIZE,
          cell.y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        );

        cell.opacity += MAP_CELL_OPACITY_STEP;
        if (cell.opacity > 1) {
          cellsToDraw.delete(getKey(cell));
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
