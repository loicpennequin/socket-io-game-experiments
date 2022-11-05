import { PLAYER_SIZE, PROJECTILE_SIZE } from '@game/shared-domain';
import { createFogOfWarRenderer } from './fogOfWarRenderer';
import { createMapRenderer } from './mapRenderer';
import { applyCamera } from '../commands/applyCamera';
import { createRenderer } from '../factories/renderer';
import { drawPlayers } from '../commands/drawPlayers';
import { drawProjectiles } from '../commands/drawProjectiles';
import { interpolateEntities } from '@/gameState';
import { createDebugRenderer } from './debugRenderer';
import { createCamera } from '@/factories/camera';
import { socket } from '@/utils/socket';

export const camera = createCamera({
  x: 0,
  y: 0,
  w: 0,
  h: 0
});

const getDimensions = () => ({
  w: window.innerWidth,
  h: window.innerHeight
});

export const createGameRenderer = ({ id }: { id: string }) => {
  const mapRenderer = createMapRenderer({
    id: `${id}:map`,
    showLightness: true
  });
  const fogOfWarRenderer = createFogOfWarRenderer({
    id: ` '${id}:fog-of-war`,
    camera,
    getDimensions
  });
  const debugRenderer = createDebugRenderer();

  return createRenderer({
    id,
    children: [
      mapRenderer,
      fogOfWarRenderer,
      import.meta.env.VITE_DEBUG && debugRenderer
    ].filter(Boolean),

    onStart({ canvas }) {
      camera.setCanvas(canvas);
    },

    render: ({ canvas, ctx }) => {
      interpolateEntities();
      camera.update(socket.id);

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
