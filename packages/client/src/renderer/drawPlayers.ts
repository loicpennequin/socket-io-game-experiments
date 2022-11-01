import { pushPop, fillCircle } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { prevState, state } from '@/gameState';
import { socket } from '@/socket';
import { interpolateEntity, isPlayerDto } from '@game/shared';

type DrawPlayersOptions = { ctx: CanvasRenderingContext2D; size: number };

export const drawPlayers = ({ ctx, size }: DrawPlayersOptions) => {
  pushPop(ctx, () => {
    state.entities.filter(isPlayerDto).forEach(player => {
      interpolateEntity<typeof player>(
        { value: player, timestamp: state.timestamp },
        {
          value: prevState.entitiesById[player.id],
          timestamp: prevState.timestamp
        },

        entity => {
          ctx.lineWidth = 0;
          ctx.fillStyle = COLORS.player(player.id === socket.id);
          fillCircle(ctx, {
            x: entity.x,
            y: entity.y,
            radius: size / 2
          });
        }
      );
    });
  });
};
