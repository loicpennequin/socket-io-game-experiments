import { PLAYER_SIZE, PROJECTILE_SIZE } from '@game/shared-domain';
import { createFogOfWarRenderer } from './fogOfWarRenderer';
import { createMapRenderer } from './mapRenderer';
import { createRenderer } from './renderer/createRenderer';
import { drawPlayers } from './renderer/drawPlayers';
import { drawProjectiles } from './renderer/drawProjectiles';
import { pushPop } from './utils/canvas';
import {
  COLORS,
  MINIMAP_ENTITY_SCALE,
  MINIMAP_SCALE,
  MINIMAP_SIZE
} from './utils/constants';

const getDimensions = () => ({
  w: MINIMAP_SIZE,
  h: MINIMAP_SIZE
});

export const createMinimapRenderer = () => {
  const camera = {
    x: 0,
    y: 0,
    w: MINIMAP_SIZE,
    h: MINIMAP_SIZE
  };
  const mapRenderer = createMapRenderer({ showLightness: false });
  const fogOfWarRenderer = createFogOfWarRenderer({
    camera,
    scale: MINIMAP_SCALE,
    getDimensions
  });

  mapRenderer.start();
  fogOfWarRenderer.start();

  return createRenderer({
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
        drawPlayers({ ctx, size: PLAYER_SIZE * MINIMAP_ENTITY_SCALE });

        ctx.resetTransform();
        fogOfWarRenderer.draw(ctx, {
          x: camera.x,
          y: camera.y,
          w: camera.w,
          h: camera.h
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
