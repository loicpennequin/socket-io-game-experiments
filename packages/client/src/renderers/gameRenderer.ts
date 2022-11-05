import { PLAYER_SIZE, PROJECTILE_SIZE } from '@game/shared-domain';
import { createFogOfWarRenderer } from './fogOfWarRenderer';
import { applyCamera } from '../commands/applyCamera';
import { createRenderer } from '../factories/renderer';
import { drawPlayers } from '../commands/drawPlayers';
import { drawProjectiles } from '../commands/drawProjectiles';
import { interpolateEntities } from '@/gameState';
import { createCamera } from '@/factories/camera';
import { socket } from '@/utils/socket';
import { initControls } from '@/utils/controls';
import { trackMousePosition } from '@/utils/mouseTracker';
import { handleManualCamera } from '@/commands/handleManualCamera';
import { createMapRenderer } from './mapRenderer';
import { createDebugRenderer } from './debugRenderer';
import { createMinimapRenderer } from './minimapRenderer';
import type { Coordinates } from '@game/shared-utils';

const getDimensions = () => ({
  w: window.innerWidth,
  h: window.innerHeight
});

export const createGameRenderer = ({ id }: { id: string }) => {
  const camera = createCamera({
    x: 0,
    y: 0,
    w: 0,
    h: 0
  });

  let mousePosition: Coordinates;

  return createRenderer({
    id,
    getDimensions,

    children: [
      createMapRenderer({
        id: `${id}:map`,
        showLightness: true
      }),
      createFogOfWarRenderer({
        id: ` '${id}:fog-of-war`,
        camera,
        getDimensions
      }),
      createMinimapRenderer({
        id: 'minimap',
        camera
      }),
      createDebugRenderer()
    ],

    render: ({ canvas, ctx, children: [mapRenderer, fogOfWarRenderer] }) => {
      interpolateEntities();
      handleManualCamera({ canvas, camera, mousePosition });
      camera.update();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      applyCamera({ canvas, ctx, camera }, () => {
        mapRenderer.draw?.(ctx, {
          x: camera.x,
          y: camera.y,
          w: camera.w,
          h: camera.h
        });

        drawProjectiles({ ctx, size: PROJECTILE_SIZE });
        drawPlayers({ ctx, size: PLAYER_SIZE });

        fogOfWarRenderer.draw?.(ctx, {
          x: camera.x,
          y: camera.y,
          w: camera.w,
          h: camera.h
        });
      });
    },

    onStart({ canvas, children: [, , minimapRenderer] }) {
      canvas.parentElement?.appendChild(
        Object.assign(minimapRenderer.canvas, { id: 'minimap' })
      );
      mousePosition = trackMousePosition(canvas);
      initControls(camera, mousePosition);

      camera.setTarget(socket.id);
      camera.setCanvas(canvas);
    }
  });
};
