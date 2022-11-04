import { type GameMapCell, MAP_SIZE } from '@game/shared-domain';
import { state } from '../gameState';
import type { Camera } from '../commands/applyCamera';
import { createRenderer } from '../factories/renderer';
import { drawCell } from '../commands/drawMap';
import { MAP_CELL_OPACITY_STEP } from '@/utils/constants';

const getKey = (cell: GameMapCell) => `${cell.x}.${cell.y}`;

export type CreateMapCacheRendererOptions = {
  showLightness: boolean;
  id: string;
};

export const createMapRenderer = ({
  showLightness,
  id
}: CreateMapCacheRendererOptions) => {
  const drawnCells = new Map<string, GameMapCell & { opacity: number }>();
  window.addEventListener(
    'resize',
    () => {
      drawnCells.clear();
    },
    false
  );
  const renderer = createRenderer({
    id,
    render: ({ ctx }) => {
      state.discoveredCells.forEach(cell => {
        const cachedCell = drawnCells.get(getKey(cell));

        if (cachedCell && cachedCell.opacity >= 1) return;
        const value = {
          ...cell,
          opacity: (cachedCell?.opacity ?? 0) + MAP_CELL_OPACITY_STEP
        };

        drawnCells.set(getKey(cell), value);

        drawCell({
          ctx,
          cell,
          showLightness,
          opacity: value.opacity
        });
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
