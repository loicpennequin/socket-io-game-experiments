import {
  EntityType,
  PLAYER_HARD_FIELD_OF_VIEW,
  PROJECTILE_HARD_FIELD_OF_VIEW
} from '@game/shared-domain';
import type { Dimensions } from '@game/shared-utils';
import { state, prevState } from './gameState';
import { applyCamera, type Camera } from './renderer/applyCamera';
import { createRenderer } from './renderer/createRenderer';
import { socket } from './socket';
import { pushPop } from './utils/canvas';
import { COLORS } from './utils/constants';
import { interpolate } from './utils/interpolate';

export const createFogOfWarRenderer = ({
  camera,
  getDimensions,
  scale = 1
}: {
  camera: Camera;
  getDimensions: () => Dimensions;
  scale?: number;
}) => {
  const renderer = createRenderer({
    render: ({ canvas, ctx }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      applyCamera({ canvas, ctx, camera, shouldReadjust: false }, () => {
        ctx.fillStyle = COLORS.fogOfWar();
        ctx.fillRect(camera.x, camera.y, camera.w, camera.h);
        ctx.globalCompositeOperation = 'destination-out';

        const player = state.entitiesById[socket.id];
        if (!player) return;
        const children = player.children.map(id => state.entitiesById[id]);

        pushPop(ctx, () => {
          ctx.scale(scale, scale);
          [player, ...children].forEach(entity => {
            interpolate(entity, prevState.entitiesById[entity.id], entity => {
              const fov =
                entity.type === EntityType.PLAYER
                  ? PLAYER_HARD_FIELD_OF_VIEW
                  : PROJECTILE_HARD_FIELD_OF_VIEW;
              const gradient = ctx.createRadialGradient(
                entity.x,
                entity.y,
                fov - 25,
                entity.x,
                entity.y,
                fov
              );

              // Add three color stops
              gradient.addColorStop(0, 'white');
              gradient.addColorStop(1, 'rgba(0,0,0,0)');

              // Set the fill style and draw a rectangle
              ctx.fillStyle = gradient;
              ctx.fillRect(entity.x - fov, entity.y - fov, fov * 2, fov * 2);

              // circle(ctx, {
              //   x: entity.x,
              //   y: entity.y,
              //   radius:
              //     entity.type === EntityType.PLAYER
              //       ? PLAYER_HARD_FIELD_OF_VIEW
              //       : PROJECTILE_HARD_FIELD_OF_VIEW
              // });
              // ctx.fill();
            });
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