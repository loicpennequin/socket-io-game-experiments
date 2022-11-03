import { type GameMapCell, MAP_SIZE } from '@game/shared-domain';
import { state } from './gameState';
import type { Camera } from './renderer/applyCamera';
import { createRenderer } from './renderer/createRenderer';
import { drawCell } from './renderer/drawMap';
import { FOG_OF_WAR_ALPHA } from './utils/constants';

const getKey = (cell: GameMapCell) => `${cell.x}.${cell.y}`;

export type CreateMapCacheRendererOptions = {
  showLightness: boolean;
};

export const createMapCacheRenderer = ({
  showLightness
}: CreateMapCacheRendererOptions) => {
  const drawnCells = new Map<string, GameMapCell>();

  const renderer = createRenderer({
    render: ({ ctx }) => {
      state.discoveredCells.forEach(cell => {
        ctx.globalAlpha = FOG_OF_WAR_ALPHA;
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
