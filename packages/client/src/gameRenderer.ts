import { MAP_SIZE } from '@game/shared';
import { applyFieldOfView } from './renderer/applyFieldOfView';
import { createRenderer } from './renderer/createRenderer';
import { drawMap } from './renderer/drawMap';
import { drawPlayers } from './renderer/drawPlayers';
import { socket } from './socket';

export const createGameRenderer = () => {
  return createRenderer({
    render(ctx) {
      ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);
      drawMap({ ctx, opacity: 0.5 });

      applyFieldOfView({ ctx, entityId: socket.id }, () => {
        drawMap({ ctx, showCoordinates: true });
        drawPlayers({ ctx });
      });
    },
    getDimensions: () => ({
      w: MAP_SIZE,
      h: MAP_SIZE
    })
  });
};
