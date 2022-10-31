import { pushPop, fillCircle } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { prevState, state } from '@/gameState';
import { socket } from '@/socket';
import { interpolateEntity, PLAYER_SIZE } from '@game/shared';

type DrawPlayersOptions = { ctx: CanvasRenderingContext2D };

export const drawPlayers = ({ ctx }: DrawPlayersOptions) => {
  pushPop(ctx, () => {
    state.players.forEach(player => {
      interpolateEntity<typeof player>(
        { value: player, timestamp: state.timestamp },
        {
          value: prevState.playersById[player.id],
          timestamp: prevState.timestamp
        },

        entity => {
          ctx.lineWidth = 0;
          ctx.fillStyle = COLORS.player(player.id === socket.id);
          fillCircle(ctx, {
            x: entity.x,
            y: entity.y,
            radius: PLAYER_SIZE / 2
          });
        }
      );
    });
  });
};
