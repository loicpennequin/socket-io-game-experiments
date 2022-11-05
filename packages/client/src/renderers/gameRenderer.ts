import { MAP_SIZE, PLAYER_SIZE, PROJECTILE_SIZE } from '@game/shared-domain';
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
import {
  CameraMode,
  CAMERA_SPEED,
  MANUAL_CAMERA_BOUNDARIES,
  MANUAL_CAMERA_SWITCH_TIMEOUT
} from '@/utils/constants';
import { initControls } from '@/utils/controls';
import { trackMousePosition } from '@/utils/mouseTracker';
import { applyEdgeHandler } from '@/commands/applyEdgeHandler';
import { clamp, type Nullable } from '@game/shared-utils';

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
  let manualCameraModeTimeout: Nullable<ReturnType<typeof setTimeout>> = null;

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
      createDebugRenderer()
    ],

    render: ({ canvas, ctx, children: [mapRenderer, fogOfWarRenderer] }) => {
      interpolateEntities();
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
        drawPlayers({ ctx, size: PLAYER_SIZE, camera });

        fogOfWarRenderer.draw?.(ctx, {
          x: camera.x,
          y: camera.y,
          w: camera.w,
          h: camera.h
        });

        applyEdgeHandler({
          canvas,
          edgeSize: MANUAL_CAMERA_BOUNDARIES,
          cb: ({ top, bottom, left, right }) => {
            if (!top && !bottom && !left && !right) {
              if (camera.mode === CameraMode.AUTO && manualCameraModeTimeout) {
                clearTimeout(manualCameraModeTimeout);
                manualCameraModeTimeout = null;
              }
              return;
            }

            if (camera.mode === CameraMode.AUTO) {
              if (!manualCameraModeTimeout) {
                manualCameraModeTimeout = setTimeout(() => {
                  camera.setMode(CameraMode.MANUAL);
                }, MANUAL_CAMERA_SWITCH_TIMEOUT);
              }

              return;
            }

            const newPosition = {
              x: clamp(
                camera.x +
                  (left ? CAMERA_SPEED * -1 : right ? CAMERA_SPEED : 0),
                { min: 0, max: MAP_SIZE - camera.w }
              ),
              y: clamp(
                camera.y +
                  (top ? CAMERA_SPEED * -1 : bottom ? CAMERA_SPEED : 0),
                {
                  min: 0,
                  max: MAP_SIZE - camera.h
                }
              )
            };

            camera.setPosition(newPosition);
          }
        });
      });
    },

    onStart({ canvas }) {
      initControls(camera);
      trackMousePosition(canvas);

      camera.setTarget(socket.id);
      camera.setCanvas(canvas);
    }
  });
};
