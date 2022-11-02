import { pushPop, fillCircle } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { prevState, state } from '@/gameState';
import { socket } from '@/socket';
import { interpolateEntity } from '@game/shared-utils';
import { drawMapInFieldOfView } from './drawMap';
import {
  isProjectileDto,
  PROJECTILE_FIELD_OF_VIEW,
  TICK_RATE
} from '@game/domain';

type DrawProjectilesOptions = { ctx: CanvasRenderingContext2D; size: number };

export const drawProjectiles = ({ ctx, size }: DrawProjectilesOptions) => {
  pushPop(ctx, () => {
    state.entities.filter(isProjectileDto).forEach(projectile => {
      drawMapInFieldOfView({
        ctx,
        entityId: projectile.id,
        fieldOfView: PROJECTILE_FIELD_OF_VIEW
      });

      interpolateEntity<typeof projectile>(
        { value: projectile, timestamp: state.timestamp },
        {
          value: prevState.entitiesById[projectile.id] as typeof projectile,
          timestamp: prevState.timestamp
        },

        {
          tickRate: TICK_RATE,
          cb: entity => {
            ctx.lineWidth = 0;
            ctx.fillStyle = COLORS.projectile(
              projectile.playerId === socket.id
            );
            fillCircle(ctx, {
              x: entity.x,
              y: entity.y,
              radius: size / 2
            });
          }
        }
      );
    });
  });
};
