import { pushPop, fillCircle } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { prevState, state } from '@/gameState';
import { socket } from '@/socket';
import { isPlayerDto } from '@game/shared-domain';
import { interpolate } from '@/utils/interpolate';
import { pointCircleCollision } from '@game/shared-utils';
import { mousePosition } from '@/mouseTracker';
import type { Camera } from './applyCamera';

type DrawPlayersOptions = {
  ctx: CanvasRenderingContext2D;
  size: number;
  camera?: Camera;
};

export const drawPlayers = ({ ctx, size, camera }: DrawPlayersOptions) => {
  state.entities.filter(isPlayerDto).forEach(player => {
    pushPop(ctx, () => {
      interpolate(player, prevState.entitiesById[player.id], entity => {
        const isHovered = pointCircleCollision(
          {
            x: mousePosition.x + (camera?.x ?? 0),
            y: mousePosition.y + (camera?.y ?? 0)
          },
          {
            x: entity.x,
            y: entity.y,
            r: size / 2
          }
        );
        ctx.canvas.style.cursor = isHovered ? 'pointer' : 'initial';
        pushPop(ctx, () => {
          if (isHovered) ctx.filter = 'saturate(200%)';

          ctx.lineWidth = 0;
          ctx.fillStyle = COLORS.player(player.id === socket.id);
          fillCircle(ctx, {
            x: entity.x,
            y: entity.y,
            radius: size / 2
          });
        });

        if (isHovered) {
          ctx.font = '12px Helvetica';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          ctx.fillStyle = 'black';
          const { width } = ctx.measureText(entity.meta.name + 'y');
          const padding = 8;
          ctx.fillRect(
            entity.x - padding - width / 2,
            entity.y - 40,
            width + padding * 2,
            20
          );
          ctx.fillStyle = 'white';
          ctx.fillText(entity.meta.name + 'y', entity.x, entity.y - 30);
        }
      });
    });
  });
};
