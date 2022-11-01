import { PLAYER_FIELD_OF_VIEW } from '@game/shared';
import { applyCamera, type Camera } from './renderer/applyCamera';
import { applyFieldOfView } from './renderer/applyFieldOfView';
import { createRenderer } from './renderer/createRenderer';
import { drawMap } from './renderer/drawMap';
import { drawPlayers } from './renderer/drawPlayers';
import { drawProjectiles } from './renderer/drawProjectiles';
import { socket } from './socket';
import { pushPop } from './utils/canvas';

export const gameCamera: Camera = {
  x: 0,
  y: 0,
  w: 0,
  h: 0
};

export const createGameRenderer = () => {
  return createRenderer({
    render({ canvas, ctx }) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      applyCamera({ canvas, ctx }, camera => {
        Object.assign(gameCamera, camera);
        pushPop(ctx, () => {
          ctx.globalAlpha = 0.3;
          drawMap({ ctx, boundaries: camera });
        });

        applyFieldOfView(
          {
            ctx,
            entityId: socket.id,
            fieldOfView: PLAYER_FIELD_OF_VIEW
          },
          () => {
            drawMap({ ctx, showCoordinates: true, boundaries: camera });
            drawPlayers({ ctx });
          }
        );
        drawProjectiles({ ctx, camera });
      });
    },
    getDimensions: () => ({
      w: window.innerWidth,
      h: window.innerHeight
    })
  });
};
