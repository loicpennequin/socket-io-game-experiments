import { circle, pushPop } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import type { GameState } from '../factories/gameState';
import { socket } from '@/utils/socket';
import { isProjectileDto } from '@game/shared-domain';

type DrawProjectilesOptions = {
  ctx: CanvasRenderingContext2D;
  size: number;
  state: GameState;
};

export const drawProjectiles = ({
  ctx,
  size,
  state
}: DrawProjectilesOptions) => {
  pushPop(ctx, () => {
    state.entities.filter(isProjectileDto).forEach(projectile => {
      const { x, y } = state.interpolatedEntities[projectile.id];

      ctx.lineWidth = 0;
      circle(ctx, { x, y, radius: size / 2 });
      ctx.fillStyle = COLORS.projectile(projectile.parent === socket.id);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });
  });
};
