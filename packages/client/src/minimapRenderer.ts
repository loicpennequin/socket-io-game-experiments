import { PLAYER_SIZE } from '@game/shared';
import { gameCamera } from './gameRenderer';
import { createRenderer } from './renderer/createRenderer';
import { drawMap } from './renderer/drawMap';
import { drawPlayers } from './renderer/drawPlayers';
import { pushPop } from './utils/canvas';
import { COLORS, MINIMAP_SCALE, MINIMAP_SIZE } from './utils/constants';

export const createMinimapRenderer = () => {
  return createRenderer({
    render({ canvas, ctx }) {
      ctx.fillStyle = COLORS.minimapBackground();
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      pushPop(ctx, () => {
        ctx.scale(MINIMAP_SCALE, MINIMAP_SCALE);
        drawMap({ ctx, showLightness: false });
        drawPlayers({ ctx, size: PLAYER_SIZE * 5 });

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.strokeRect(gameCamera.x, gameCamera.y, gameCamera.w, gameCamera.h);
      });
    },
    getDimensions: () => ({
      w: MINIMAP_SIZE,
      h: MINIMAP_SIZE
    })
  });
};
