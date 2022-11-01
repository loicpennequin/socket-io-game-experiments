import {
  PLAYER_FIELD_OF_VIEW,
  PLAYER_SIZE,
  PROJECTILE_SIZE
} from '@game/shared';
import { gameCamera } from './gameRenderer';
import { createRenderer } from './renderer/createRenderer';
import { drawMap, drawMapInFieldOfView } from './renderer/drawMap';
import { drawPlayers } from './renderer/drawPlayers';
import { drawProjectiles } from './renderer/drawProjectiles';
import { socket } from './socket';
import { pushPop } from './utils/canvas';
import {
  COLORS,
  FOG_OF_WAR_ALPHA,
  MINIMAP_ENTITY_SCALE,
  MINIMAP_SCALE,
  MINIMAP_SIZE
} from './utils/constants';

export const createMinimapRenderer = () => {
  return createRenderer({
    render({ canvas, ctx }) {
      ctx.fillStyle = COLORS.minimapBackground();
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      pushPop(ctx, () => {
        ctx.scale(MINIMAP_SCALE, MINIMAP_SCALE);
        pushPop(ctx, () => {
          ctx.globalAlpha = FOG_OF_WAR_ALPHA;
          drawMap({ ctx, showLightness: false });
        });

        drawMapInFieldOfView({
          ctx,
          entityId: socket.id,
          fieldOfView: PLAYER_FIELD_OF_VIEW
        });

        drawProjectiles({ ctx, size: PROJECTILE_SIZE });
        drawPlayers({ ctx, size: PLAYER_SIZE * MINIMAP_ENTITY_SCALE });

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
