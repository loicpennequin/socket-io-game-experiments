import { applyCamera } from './renderer/applyCamera';
import { applyFieldOfView } from './renderer/applyFieldOfView';
import { createRenderer } from './renderer/createRenderer';
import { drawMap } from './renderer/drawMap';
import { drawPlayers } from './renderer/drawPlayers';
import { socket } from './socket';
import { pushPop } from './utils/canvas';

export const createGameRenderer = () => {
  return createRenderer({
    render({ canvas, ctx }) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      applyCamera({ canvas, ctx }, camera => {
        pushPop(ctx, () => {
          ctx.globalAlpha = 0.3;
          drawMap({ ctx, boundaries: camera });
        });

        applyFieldOfView({ ctx, entityId: socket.id }, () => {
          drawMap({ ctx, showCoordinates: true, boundaries: camera });
          drawPlayers({ ctx });
        });
      });
    },
    getDimensions: () => ({
      w: window.innerWidth,
      h: window.innerHeight
    })
  });
};
