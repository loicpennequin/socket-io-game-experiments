import { MAP_SIZE, PLAYER_SIZE, PROJECTILE_SIZE } from '@game/shared-domain';
import { createFogOfWarRenderer } from './fogOfWarRenderer';
import { createRenderer } from '../factories/renderer';
import { drawPlayersCircles } from '../commands/drawPlayers';
import { drawProjectiles } from '../commands/drawProjectiles';
import { pushPop } from '../utils/canvas';
import {
  CameraMode,
  COLORS,
  MINIMAP_ENTITY_SCALE,
  MINIMAP_SCALE,
  MINIMAP_SIZE
} from '../utils/constants';
import type { Camera } from '@/factories/camera';
import { trackMousePosition } from '@/utils/mouseTracker';
import { state } from '@/stores/gameState';
import type { MapRenderer } from './mapRenderer';

const getDimensions = () => ({
  w: MINIMAP_SIZE,
  h: MINIMAP_SIZE
});

export const createMinimapRenderer = ({
  id,
  camera,
  mapRenderer
}: {
  id: string;
  camera: Camera;
  mapRenderer: MapRenderer;
}) => {
  const fogOfWarRenderer = createFogOfWarRenderer({
    id: `${id}:fog-of-war`,
    camera: {
      x: 0,
      y: 0,
      w: MINIMAP_SIZE,
      h: MINIMAP_SIZE
    },
    scale: MINIMAP_SCALE,
    getDimensions
  });

  return createRenderer({
    id,
    getDimensions,
    children: [fogOfWarRenderer],
    render({ canvas, ctx }) {
      ctx.fillStyle = COLORS.minimapBackground();
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      pushPop(ctx, () => {
        ctx.scale(MINIMAP_SCALE, MINIMAP_SCALE);

        mapRenderer.draw(ctx, {
          x: 0,
          y: 0,
          w: mapRenderer.canvas.width,
          h: mapRenderer.canvas.height
        });

        drawProjectiles({ ctx, size: PROJECTILE_SIZE });
        drawPlayersCircles({
          ctx,
          size: PLAYER_SIZE * MINIMAP_ENTITY_SCALE,
          mousePosition: { x: 0, y: 0 },
          handleHover: false
        });

        ctx.resetTransform();
        fogOfWarRenderer.draw(ctx, {
          x: 0,
          y: 0,
          w: MINIMAP_SIZE,
          h: MINIMAP_SIZE
        });

        ctx.scale(MINIMAP_SCALE, MINIMAP_SCALE);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.strokeRect(camera.x, camera.y, camera.w, camera.h);
      });
    },
    onStart({ canvas }) {
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
