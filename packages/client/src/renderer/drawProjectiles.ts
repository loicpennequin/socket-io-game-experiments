import { pushPop, fillCircle } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { prevState, state } from '@/gameState';
import { socket } from '@/socket';
import {
  interpolateEntity,
  isProjectileDto,
  PROJECTILE_FIELD_OF_VIEW,
  PROJECTILE_SIZE
} from '@game/shared';
import { drawMapInFieldOfView } from './drawMap';

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

        entity => {
          ctx.lineWidth = 0;
          ctx.fillStyle = COLORS.projectile(projectile.playerId === socket.id);
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
