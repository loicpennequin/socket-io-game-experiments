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
import { applyFieldOfView } from './applyFieldOfView';
import { drawMap } from './drawMap';
import type { Camera } from './applyCamera';

type DrawProjectilesOptions = { ctx: CanvasRenderingContext2D; camera: Camera };

export const drawProjectiles = ({ ctx, camera }: DrawProjectilesOptions) => {
  pushPop(ctx, () => {
    state.entities.filter(isProjectileDto).forEach(projectile => {
      applyFieldOfView(
        { ctx, entityId: projectile.id, fieldOfView: PROJECTILE_FIELD_OF_VIEW },
        () => {
          drawMap({ ctx, boundaries: camera });
          interpolateEntity<typeof projectile>(
            { value: projectile, timestamp: state.timestamp },
            {
              value: prevState.entitiesById[projectile.id] as typeof projectile,
              timestamp: prevState.timestamp
            },

            entity => {
              ctx.lineWidth = 0;
              ctx.fillStyle = COLORS.projectile(
                projectile.playerId === socket.id
              );
              fillCircle(ctx, {
                x: entity.x,
                y: entity.y,
                radius: PROJECTILE_SIZE / 2
              });
            }
          );
        }
      );
    });
  });
};
