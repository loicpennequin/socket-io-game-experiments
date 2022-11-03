import { pushPop, fillCircle } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { prevState, state } from '@/gameState';
import { socket } from '@/socket';
import { isPlayerDto } from '@game/shared-domain';
import { interpolate } from '@/utils/interpolate';

type DrawPlayersOptions = { ctx: CanvasRenderingContext2D; size: number };

export const drawPlayers = ({ ctx, size }: DrawPlayersOptions) => {
  pushPop(ctx, () => {
    state.entities.filter(isPlayerDto).forEach(player => {
      interpolate(player, prevState.entitiesById[player.id], entity => {
        ctx.lineWidth = 0;
        ctx.fillStyle = COLORS.player(player.id === socket.id);
        fillCircle(ctx, {
          x: entity.x,
          y: entity.y,
          radius: size / 2
        });
      });
    });
  });
};
