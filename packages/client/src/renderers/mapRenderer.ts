import { type GameMapCell, MAP_SIZE } from '@game/shared-domain';
import { state } from '../gameState';
import type { Camera } from '../commands/applyCamera';
import { createRenderer } from '../factories/renderer';
import { drawCell } from '../commands/drawMap';

const getKey = (cell: GameMapCell) => `${cell.x}.${cell.y}`;

export type CreateMapCacheRendererOptions = {
  showLightness: boolean;
  id: string;
};

export const createMapRenderer = ({
  showLightness,
  id
}: CreateMapCacheRendererOptions) => {
  const drawnCells = new Map<string, GameMapCell>();
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
        if (drawnCells.has(getKey(cell))) return;
        drawnCells.set(getKey(cell), cell);
        drawCell({ ctx, cell, showLightness });
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
