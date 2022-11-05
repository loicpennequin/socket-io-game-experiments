import { pushPop, circle } from '@/utils/canvas';
import { COLORS } from '@/utils/constants';
import { getInterpolatedEntity, state } from '@/gameState';
import { socket } from '@/utils/socket';
import {
  EntityOrientation,
  isPlayerDto,
  type PlayerDto
} from '@game/shared-domain';
import type { Coordinates, Dimensions } from '@game/shared-utils';
import type { AssetMap } from '@/factories/assetMap';

type DrawPlayersOptions = {
  ctx: CanvasRenderingContext2D;
  size: number;
  camera?: Dimensions & Coordinates;
  handleHover?: boolean;
  renderPlayer: (player: PlayerDto) => void;
};

export const drawPlayers = ({ ctx, renderPlayer }: DrawPlayersOptions) => {
  state.entities.filter(isPlayerDto).forEach(player => {
    pushPop(ctx, () => {
      const p = getInterpolatedEntity(player.id);

      // const isHovered =
      //   handleHover &&
      //   pointCircleCollision(
      //     {
      //       x: mousePosition.x + camera?.x,
      //       y: mousePosition.y + camera?.y
      //     },
      //     {
      //       x,
      //       y,
      //       r: size / 2
      //     }
      //   );

      pushPop(ctx, () => {
        renderPlayer(p as PlayerDto);
      });

      // if (isHovered) {
      //   pushPop(ctx, () => {
      //     const { width } = ctx.measureText(player.meta.name);
      //     const padding = 12;
      //     ctx.fillStyle = 'black';
      //     ctx.beginPath();
      //     ctx.rect(x - padding - width / 2, y - 40, width + padding * 2, 25);
      //     ctx.closePath();
      //     ctx.fill();

      //     ctx.font = '12px Helvetica';
      //     ctx.textAlign = 'center';
      //     ctx.textBaseline = 'middle';
      //     ctx.fillStyle = 'white';
      //     ctx.fillText(player.meta.name, x, y - 28);
      //   });
      // }
    });
  });
};

export const drawPlayersSprites = (
  opts: Omit<DrawPlayersOptions, 'renderPlayer'> & { assetMap: AssetMap }
) =>
  drawPlayers({
    ...opts,
    renderPlayer: ({ x, y, meta }) => {
      const { ctx, assetMap, size } = opts;
      const isFlipped = meta.orientation === EntityOrientation.LEFT;

      if (isFlipped) ctx.scale(-1, 1);

      ctx.drawImage(
        assetMap.canvas,
        ...assetMap.get(0, 0, 1),
        meta.orientation === EntityOrientation.LEFT
          ? -1 * (x + size / 2)
          : x - size / 2,
        y - size / 2,
        size,
        size
      );
    }
  });

export const drawPlayersCircles = (
  opts: Omit<DrawPlayersOptions, 'renderPlayer'>
) =>
  drawPlayers({
    ...opts,
    renderPlayer: ({ x, y, id }) => {
      const { ctx, size } = opts;

      ctx.lineWidth = 0;
      circle(ctx, { x, y, radius: size / 2 });
      ctx.fillStyle = COLORS.player(id === socket.id);
      ctx.fill();
    }
  });
