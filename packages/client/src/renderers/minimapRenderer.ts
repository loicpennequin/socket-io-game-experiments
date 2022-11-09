import { MAP_SIZE, PLAYER_SIZE, PROJECTILE_SIZE } from '@game/shared-domain';
import { createFogOfWarRenderer } from './fogOfWarRenderer';
import { createRenderer } from '../factories/renderer';
import { drawPlayersCircles } from '../commands/drawPlayers';
import { drawProjectiles } from '../commands/drawProjectiles';
import { pushPop } from '../utils/canvas';
import {
  CameraMode,
  COLORS,
  MapRenderMode,
  MINIMAP_ENTITY_SCALE,
  MINIMAP_SCALE,
  MINIMAP_SIZE
} from '../utils/constants';
import type { Camera } from '@/factories/camera';
import { trackMousePosition } from '@/utils/mouseTracker';
import { createMapRenderer } from './mapRenderer';

const getDimensions = () => ({
  w: MINIMAP_SIZE,
  h: MINIMAP_SIZE
});

export const createMinimapRenderer = ({
  id,
  camera
}: {
  id: string;
  camera: Camera;
}) => {
  return createRenderer({
    id,
    getDimensions,
    children: [
      createMapRenderer({
        id: `map`,
        mode: MapRenderMode.SIMPLE
      }),
      createFogOfWarRenderer({
        id: `${id}:fog-of-war`,
        camera: {
          x: 0,
          y: 0,
          w: MINIMAP_SIZE,
          h: MINIMAP_SIZE
        },
        scale: MINIMAP_SCALE,
        getDimensions
      })
    ],
    render({ canvas, ctx, state, children: [mapRenderer, fogOfWarRenderer] }) {
      ctx.fillStyle = COLORS.minimapBackground();
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      pushPop(ctx, () => {
        ctx.scale(MINIMAP_SCALE, MINIMAP_SCALE);

        mapRenderer.draw?.(ctx, {
          x: 0,
          y: 0,
          w: mapRenderer.canvas.width,
          h: mapRenderer.canvas.height
        });

        drawProjectiles({ ctx, size: PROJECTILE_SIZE, state });
        drawPlayersCircles({
          ctx,
          size: PLAYER_SIZE * MINIMAP_ENTITY_SCALE,
          mousePosition: { x: 0, y: 0 },
          handleHover: false,
          state
        });

        ctx.resetTransform();
        fogOfWarRenderer.draw?.(ctx, {
          x: 0,
          y: 0,
          w: MINIMAP_SIZE,
          h: MINIMAP_SIZE
        });

        ctx.scale(MINIMAP_SCALE, MINIMAP_SCALE);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 20;
        ctx.strokeRect(camera.x, camera.y, camera.w, camera.h);
      });
    },
    onStart({ canvas, state }) {
      const mousePosition = trackMousePosition(canvas);
      canvas.addEventListener('click', () => {
        state.isCameraLocked = false;
        camera.setMode(CameraMode.MANUAL);
        camera.setPosition({
          x: (mousePosition.x * MAP_SIZE) / MINIMAP_SIZE,
          y: (mousePosition.y * MAP_SIZE) / MINIMAP_SIZE
        });
      });
    }
  });
};
