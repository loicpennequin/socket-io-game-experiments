import { PLAYER_HARD_FIELD_OF_VIEW } from '@game/shared-domain';
import type { Dimensions } from '@game/shared-utils';
import { state, prevState } from './gameState';
import { applyCamera, type Camera } from './renderer/applyCamera';
import { createRenderer } from './renderer/createRenderer';
import { socket } from './socket';
import { circle, pushPop } from './utils/canvas';
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

        pushPop(ctx, () => {
          ctx.scale(scale, scale);
          interpolate(player, prevState.entitiesById[player.id], entity => {
            ctx.fillStyle = 'white';
            circle(ctx, {
              x: entity.x,
              y: entity.y,
              radius: PLAYER_HARD_FIELD_OF_VIEW
            });
            ctx.fill();
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
