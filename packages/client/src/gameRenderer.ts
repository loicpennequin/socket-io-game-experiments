import { applyCamera } from './renderer/applyCamera';
import { applyFieldOfView } from './renderer/applyFieldOfView';
import { createRenderer } from './renderer/createRenderer';
import { drawMap } from './renderer/drawMap';
import { drawPlayers } from './renderer/drawPlayers';
import { socket } from './socket';

export const createGameRenderer = () => {
  return createRenderer({
    render({ canvas, ctx }) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      applyCamera({ canvas, ctx }, () => {
        drawMap({ ctx, opacity: 0.5 });

        applyFieldOfView({ ctx, entityId: socket.id }, () => {
          drawMap({ ctx, showCoordinates: true });
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
