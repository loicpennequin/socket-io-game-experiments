import { pushPop, circle } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { prevState, state } from '@/gameState';
import { socket } from '@/utils/socket';
import { isPlayerDto } from '@game/shared-domain';
import { interpolate } from '@/utils/interpolate';
import { pointCircleCollision } from '@game/shared-utils';
import { mousePosition } from '@/utils/mouseTracker';
import type { Camera } from './applyCamera';

type DrawPlayersOptions = {
  ctx: CanvasRenderingContext2D;
  size: number;
  camera?: Camera;
  handleHover?: boolean;
};

export const drawPlayers = ({
  ctx,
  size,
  camera = { x: 0, y: 0, w: 0, h: 0 },
  handleHover = true
}: DrawPlayersOptions) => {
  state.entities.filter(isPlayerDto).forEach(player => {
    pushPop(ctx, () => {
      interpolate(player, prevState.entitiesById[player.id], entity => {
        const isHovered =
          handleHover &&
          pointCircleCollision(
            {
              x: mousePosition.x + camera?.x,
              y: mousePosition.y + camera?.y
            },
            {
              x: entity.x,
              y: entity.y,
              r: size / 2
            }
          );

        pushPop(ctx, () => {
          if (isHovered) ctx.filter = 'saturate(200%)';

          ctx.lineWidth = 0;
          console.log(`[PLA]: Drawing ${entity.id} | ${entity.x}, ${entity.y}`);
          circle(ctx, {
            x: entity.x,
            y: entity.y,
            radius: size / 2
          });
          ctx.fillStyle = COLORS.player(player.id === socket.id);
          ctx.fill();
        });

        if (isHovered) {
          pushPop(ctx, () => {
            const { width } = ctx.measureText(entity.meta.name);
            const padding = 12;
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.rect(
              entity.x - padding - width / 2,
              entity.y - 40,
              width + padding * 2,
              25
            );
            ctx.closePath();
            ctx.fill();

            ctx.font = '12px Helvetica';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(entity.meta.name, entity.x, entity.y - 28);
          });
        }
      });
    });
  });
};
