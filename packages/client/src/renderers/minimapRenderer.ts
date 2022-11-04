import { PLAYER_SIZE, PROJECTILE_SIZE } from '@game/shared-domain';
import { createFogOfWarRenderer } from './fogOfWarRenderer';
import { createMapRenderer } from './mapRenderer';
import { createRenderer } from '../factories/renderer';
import { drawPlayers } from '../commands/drawPlayers';
import { drawProjectiles } from '../commands/drawProjectiles';
import { pushPop } from '../utils/canvas';
import { camera } from './gameRenderer';
import {
  COLORS,
  MINIMAP_ENTITY_SCALE,
  MINIMAP_SCALE,
  MINIMAP_SIZE
} from '../utils/constants';

const getDimensions = () => ({
  w: MINIMAP_SIZE,
  h: MINIMAP_SIZE
});

export const createMinimapRenderer = ({ id }: { id: string }) => {
  const mapRenderer = createMapRenderer({
    id: `${id}:map`,
    showLightness: false
  });

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
    children: [mapRenderer, fogOfWarRenderer],
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
        drawPlayers({
          ctx,
          size: PLAYER_SIZE * MINIMAP_ENTITY_SCALE,
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
    getDimensions
  });
};
