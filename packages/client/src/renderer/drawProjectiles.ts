import { pushPop, fillCircle } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { prevState, state } from '@/gameState';
import { socket } from '@/socket';
import {
  interpolateEntity,
  isProjectileDto,
  PROJECTILE_SIZE
} from '@game/shared';

type DrawPlayersOptions = { ctx: CanvasRenderingContext2D };

export const drawProjectiles = ({ ctx }: DrawPlayersOptions) => {
  pushPop(ctx, () => {
    state.entities.filter(isProjectileDto).forEach(projectile => {
      interpolateEntity<typeof projectile>(
        { value: projectile, timestamp: state.timestamp },
        {
          value: prevState.entitiesById[projectile.id] as typeof projectile,
          timestamp: prevState.timestamp
        },

        entity => {
          ctx.lineWidth = 0;
          ctx.fillStyle = COLORS.projectile(projectile.playerId === socket.id);
          fillCircle(ctx, {
            x: entity.x,
            y: entity.y,
            radius: PROJECTILE_SIZE / 2
          });
        }
      );
    });
  });
};
