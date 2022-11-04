import { PLAYER_SIZE, PROJECTILE_SIZE } from '@game/shared-domain';
import { createFogOfWarRenderer } from './fogOfWarRenderer';
import { createMapRenderer } from './mapRenderer';
import { applyCamera, type Camera } from '../commands/applyCamera';
import { createRenderer } from '../commands/createRenderer';
import { drawPlayers } from '../commands/drawPlayers';
import { drawProjectiles } from '../commands/drawProjectiles';

export const camera: Camera = {
  x: 0,
  y: 0,
  w: 0,
  h: 0
};

const getDimensions = () => ({
  w: window.innerWidth,
  h: window.innerHeight
});

export const createGameRenderer = () => {
  const mapRenderer = createMapRenderer({ showLightness: true });
  const fogOfWarRenderer = createFogOfWarRenderer({
    camera,
    getDimensions
  });

  mapRenderer.start();
  fogOfWarRenderer.start();

  return createRenderer({
    render: ({ canvas, ctx }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      applyCamera({ canvas, ctx, camera }, () => {
        mapRenderer.draw(ctx, {
          x: camera.x,
          y: camera.y,
          w: camera.w,
          h: camera.h
        });

        drawProjectiles({ ctx, size: PROJECTILE_SIZE });
        drawPlayers({ ctx, size: PLAYER_SIZE, camera });

        fogOfWarRenderer.draw(ctx, {
          x: camera.x,
          y: camera.y,
          w: camera.w,
          h: camera.h
        });
      });
    },
    getDimensions
  });
};
