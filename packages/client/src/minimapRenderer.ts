import {
  PLAYER_HARD_FIELD_OF_VIEW,
  PLAYER_SIZE,
  PROJECTILE_SIZE
} from '@game/shared-domain';
import { camera } from './gameRenderer';
import { createMapCacheRenderer } from './mapCacheRenderer';
import { createRenderer } from './renderer/createRenderer';
import { drawMapInFieldOfView } from './renderer/drawMap';
import { drawPlayers } from './renderer/drawPlayers';
import { drawProjectiles } from './renderer/drawProjectiles';
import { socket } from './socket';
import { pushPop } from './utils/canvas';
import {
  COLORS,
  MINIMAP_ENTITY_SCALE,
  MINIMAP_SCALE,
  MINIMAP_SIZE
} from './utils/constants';

export const createMinimapRenderer = () => {
  const mapCache = createMapCacheRenderer({ showLightness: false });
  mapCache.start();

  return createRenderer({
    render({ canvas, ctx }) {
      ctx.fillStyle = COLORS.minimapBackground();
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      pushPop(ctx, () => {
        ctx.scale(MINIMAP_SCALE, MINIMAP_SCALE);

        mapCache.draw(ctx, {
          x: 0,
          y: 0,
          w: mapCache.canvas.width,
          h: mapCache.canvas.height
        });

        drawMapInFieldOfView({
          ctx,
          entityId: socket.id,
          fieldOfView: PLAYER_HARD_FIELD_OF_VIEW
        });

        drawProjectiles({ ctx, size: PROJECTILE_SIZE });
        drawPlayers({ ctx, size: PLAYER_SIZE * MINIMAP_ENTITY_SCALE });

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.strokeRect(camera.x, camera.y, camera.w, camera.h);
      });
    },
    getDimensions: () => ({
      w: MINIMAP_SIZE,
      h: MINIMAP_SIZE
    })
  });
};
