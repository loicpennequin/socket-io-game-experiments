import { circle, pushPop } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { getInterpolatedEntity, state } from '@/stores/gameState';
import { socket } from '@/utils/socket';
import { isProjectileDto } from '@game/shared-domain';

type DrawProjectilesOptions = { ctx: CanvasRenderingContext2D; size: number };

export const drawProjectiles = ({ ctx, size }: DrawProjectilesOptions) => {
  pushPop(ctx, () => {
    state.entities.filter(isProjectileDto).forEach(projectile => {
      const { x, y } = getInterpolatedEntity(projectile.id);

      ctx.lineWidth = 0;
      circle(ctx, { x, y, radius: size / 2 });
      ctx.fillStyle = COLORS.projectile(projectile.parent === socket.id);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();
    });
  });
};
