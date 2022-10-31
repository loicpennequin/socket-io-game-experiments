import { MAP_SIZE } from '@game/shared';
import { applyFogOfWar, drawMap, drawPlayers, runRenderer } from './renderer';
import { createCanvas, pushPop } from './canvas';
import { state, prevState } from './gameState';
import { socket } from './socket';

export const createGameRenderer = () => {
  const { canvas, ctx } = createCanvas({
    w: MAP_SIZE,
    h: MAP_SIZE
  });

  const draw = () => {
    ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);
    pushPop(ctx, () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);
    });

    drawMap({ ctx, state, prevState, isBackground: true });

    applyFogOfWar({ ctx, state, prevState, playerId: socket.id }, () => {
      drawMap({
        ctx,
        state,
        prevState
        // showCoordinates: true,
      });
      drawPlayers({ ctx, state, prevState });
    });
  };

  return {
    canvas,
    start: () => runRenderer(draw, { immediate: true })
  };
};
