import {
  EntityType,
  PLAYER_HARD_FIELD_OF_VIEW,
  PROJECTILE_HARD_FIELD_OF_VIEW
} from '@game/shared-domain';
import type { Dimensions } from '@game/shared-utils';
import { state, getInterpolatedEntity } from '../gameState';
import { applyCamera, type Camera } from '../commands/applyCamera';
import { createRenderer } from '../factories/renderer';
import { socket } from '../utils/socket';
import { pushPop } from '../utils/canvas';
import { COLORS, FOG_OF_WAR_BLUR } from '../utils/constants';

export const createFogOfWarRenderer = ({
  camera,
  getDimensions,
  id,
  scale = 1
}: {
  camera: Camera;
  getDimensions: () => Dimensions;
  id: string;
  scale?: number;
}) => {
  const renderer = createRenderer({
    id,
    render: ({ canvas, ctx }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      applyCamera({ canvas, ctx, camera, shouldReadjust: false }, () => {
        ctx.fillStyle = COLORS.fogOfWar();
        ctx.fillRect(camera.x, camera.y, camera.w, camera.h);

        ctx.globalCompositeOperation = 'destination-out';

        const player = state.entitiesById[socket.id];
        if (!player) return;

        const entitiesToRender = [
          player,
          ...player.children.map(id => state.entitiesById[id])
        ];

        pushPop(ctx, () => {
          ctx.scale(scale, scale);

          entitiesToRender.forEach(entity => {
            const { x, y } = getInterpolatedEntity(entity.id);
            const fov =
              entity.type === EntityType.PLAYER
                ? PLAYER_HARD_FIELD_OF_VIEW
                : PROJECTILE_HARD_FIELD_OF_VIEW;

            const gradient = ctx.createRadialGradient(
              x,
              y,
              fov - FOG_OF_WAR_BLUR,
              x,
              y,
              fov
            );

            gradient.addColorStop(0, 'white');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(x - fov, y - fov, fov * 2, fov * 2);
          });
        });
      });
    },
    getDimensions
  });

  return {
    ...renderer,
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
      ctx.drawImage(
        renderer.canvas,
        0,
        0,
        renderer.canvas.width,
        renderer.canvas.height,
        camera.x,
        camera.y,
        camera.w,
        camera.h
      );
    }
  };
};
