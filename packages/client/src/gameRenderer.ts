import { PLAYER_HARD_FIELD_OF_VIEW } from '@game/shared-domain';
import { createMapCacheRenderer } from './mapCacheRenderer';
import { applyCamera, type Camera } from './renderer/applyCamera';
import { createRenderer } from './renderer/createRenderer';
import { drawMapInFieldOfView } from './renderer/drawMap';
// import { drawPlayers } from './renderer/drawPlayers';
// import { drawProjectiles } from './renderer/drawProjectiles';
import { socket } from './socket';

export const camera: Camera = {
  x: 0,
  y: 0,
  w: 0,
  h: 0
};

export const createGameRenderer = () => {
  const mapCache = createMapCacheRenderer({ showLightness: true });
  mapCache.start();

  return createRenderer({
    render: ({ canvas, ctx }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      applyCamera({ canvas, ctx, camera }, () => {
        // mapCache.draw(ctx, {
        //   x: camera.x,
        //   y: camera.y,
        //   w: camera.w,
        //   h: camera.h
        // });

        drawMapInFieldOfView({
          ctx,
          entityId: socket.id,
          fieldOfView: PLAYER_HARD_FIELD_OF_VIEW
        });
        // drawProjectiles({ ctx, size: PROJECTILE_SIZE });
        // drawPlayers({ ctx, size: PLAYER_SIZE, camera });
      });
    },
    getDimensions: () => ({
      w: window.innerWidth,
      h: window.innerHeight
    })
  });
};
