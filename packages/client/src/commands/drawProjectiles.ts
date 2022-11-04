import { circle, pushPop } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { prevState, state } from '@/gameState';
import { socket } from '@/utils/socket';
import { isProjectileDto } from '@game/shared-domain';
import { interpolate } from '@/utils/interpolate';

type DrawProjectilesOptions = { ctx: CanvasRenderingContext2D; size: number };

export const drawProjectiles = ({ ctx, size }: DrawProjectilesOptions) => {
  pushPop(ctx, () => {
    state.entities.filter(isProjectileDto).forEach(projectile => {
      interpolate(projectile, prevState.entitiesById[projectile.id], entity => {
        ctx.lineWidth = 0;
        circle(ctx, {
          x: entity.x,
          y: entity.y,
          radius: size / 2
        });
        ctx.fillStyle = COLORS.projectile(projectile.parent === socket.id);
        ctx.fill();
      });
    });
  });
};
