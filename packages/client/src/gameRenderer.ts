import {
  PLAYER_FIELD_OF_VIEW,
  PROJECTILE_SIZE,
  PLAYER_SIZE
} from '@game/shared-domain';
import { createMapCacheRenderer } from './mapCacheRenderer';
import { applyCamera, type Camera } from './renderer/applyCamera';
import { createRenderer } from './renderer/createRenderer';
import { drawMapInFieldOfView } from './renderer/drawMap';
import { drawPlayers } from './renderer/drawPlayers';
import { drawProjectiles } from './renderer/drawProjectiles';
import { socket } from './socket';
import { pushPop } from './utils/canvas';
// import { FOG_OF_WAR_ALPHA } from './utils/constants';

export const gameCamera: Camera = {
  x: 0,
  y: 0,
  w: 0,
  h: 0
};

export const createGameRenderer = () => {
  const mapCache = createMapCacheRenderer({ showLightness: true });
  mapCache.resume();

  return createRenderer({
    render({ canvas, ctx }) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pushPop(ctx, () => {
        applyCamera({ canvas, ctx }, camera => {
          Object.assign(gameCamera, camera);

          ctx.drawImage(
            mapCache.canvas,
            camera.x,
            camera.y,
            camera.w,
            camera.h,
            camera.x,
            camera.y,
            camera.w,
            camera.h
          );
          drawMapInFieldOfView({
            ctx,
            entityId: socket.id,
            fieldOfView: PLAYER_FIELD_OF_VIEW
          });
          drawProjectiles({ ctx, size: PROJECTILE_SIZE });
          drawPlayers({ ctx, size: PLAYER_SIZE, camera });
        });
      });
    },
    getDimensions: () => ({
      w: window.innerWidth,
      h: window.innerHeight
    })
  });
};
