import { pushPop, circle } from '@/utils/canvas';
import { COLORS, SPRITE_LOCATIONS } from '@/utils/constants';
import { getInterpolatedEntity, state } from '@/gameState';
import { socket } from '@/utils/socket';
import {
  EntityOrientation,
  isPlayerDto,
  type PlayerDto
} from '@game/shared-domain';
import {
  pointCircleCollision,
  type Coordinates,
  type Dimensions
} from '@game/shared-utils';
import type { AssetMap } from '@/factories/assetMap';

type DrawPlayersOptions = {
  ctx: CanvasRenderingContext2D;
  size: number;
  camera?: Dimensions & Coordinates;
  handleHover?: boolean;
  mousePosition: Coordinates;
  renderPlayer: (player: PlayerDto) => void;
};

export const drawPlayers = ({
  ctx,
  renderPlayer,
  handleHover = true,
  mousePosition,
  camera,
  size
}: DrawPlayersOptions) => {
  state.entities.filter(isPlayerDto).forEach(player => {
    pushPop(ctx, () => {
      const p = getInterpolatedEntity(player.id);

      const isHovered =
        handleHover &&
        pointCircleCollision(
          {
            x: mousePosition.x + (camera?.x ?? 0),
            y: mousePosition.y + (camera?.y ?? 0)
          },
          {
            x: p.x,
            y: p.y,
            r: size / 2
          }
        );

      pushPop(ctx, () => {
        renderPlayer(p as PlayerDto);
      });

      if (isHovered) {
        // pushPop(ctx, () => {
        //   const { width } = ctx.measureText(player.meta.name);
        //   const padding = 12;
        //   ctx.fillStyle = 'black';
        //   ctx.beginPath();
        //   ctx.rect(
        //     p.x - padding - width / 2,
        //     p.y - 70,
        //     width + padding * 2,
        //     25
        //   );
        //   ctx.closePath();
        //   ctx.fill();
        //   ctx.font = '12px Helvetica';
        //   ctx.textAlign = 'center';
        //   ctx.textBaseline = 'middle';
        //   ctx.fillStyle = 'white';
        //   ctx.fillText(player.meta.name, p.x, p.y - 58);
        // });
      }
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
      pushPop(ctx, () => {
        ctx.filter = 'saturate(200%)';
        if (isFlipped) ctx.scale(-1, 1);

        ctx.drawImage(
          assetMap.canvas,
          ...assetMap.get(...SPRITE_LOCATIONS[meta.job]),
          meta.orientation === EntityOrientation.LEFT
            ? -1 * (x + size / 2)
            : x - size / 2,
          y - size / 2,
          size,
          size
        );
      });

      ctx.font = '12px Helvetica';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.fillText(meta.name, x, y + size / 2 + 12);
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
