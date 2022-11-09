import { pushPop, circle } from '@/utils/canvas';
import {
  COLORS,
  ENTITY_STAT_BAR_HEIGHT,
  ENTITY_STAT_BAR_OFFSET,
  SPRITE_LOCATIONS
} from '@/utils/constants';
import { getInterpolatedEntity, state } from '@/stores/gameState';
import { socket } from '@/utils/socket';
import {
  EntityOrientation,
  isPlayerDto,
  type PlayerDto,
  type PlayerMeta
} from '@game/shared-domain';
import {
  pointCircleCollision,
  type Coordinates,
  type Dimensions
} from '@game/shared-utils';
import type { AssetMap } from '@/factories/assetMap';
import { drawStatBar } from './drawStatBar';

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

      if (isHovered) {
        ctx.filter = 'brightness(110%)';
      }

      pushPop(ctx, () => {
        renderPlayer(p as PlayerDto);
      });
    });
  });
};

const drawPlayerName = (
  ctx: CanvasRenderingContext2D,
  { x, y, meta, size }: Coordinates & { size: number; meta: PlayerMeta }
) => {
  ctx.font = '12px Helvetica';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.fillText(meta.name, x, y + size / 2 + 12);
};

const drawPlayerStatBars = (
  ctx: CanvasRenderingContext2D,
  { x, y, size, stats, id }: PlayerDto & { size: number }
) => {
  const defaults = {
    ctx,
    x: x - size / 2,
    y: y - size / 2,
    w: size,
    h: ENTITY_STAT_BAR_HEIGHT
  };
  pushPop(ctx, () => {
    if (id === socket.id) {
      drawStatBar({
        ...defaults,
        y: defaults.y - ENTITY_STAT_BAR_OFFSET,
        value: stats.mp,
        maxValue: stats.maxMp,
        barColor: COLORS.mpBar(),
        bgColor: COLORS.mpBarBg()
      });
      drawStatBar({
        ...defaults,
        y: defaults.y - ENTITY_STAT_BAR_OFFSET - ENTITY_STAT_BAR_HEIGHT,
        value: stats.hp,
        maxValue: stats.maxHp,
        barColor: COLORS.hpBar(),
        bgColor: COLORS.hpBarBg()
      });
    } else {
      drawStatBar({
        ...defaults,
        y: defaults.y - ENTITY_STAT_BAR_OFFSET,
        value: stats.hp,
        maxValue: stats.maxHp,
        barColor: COLORS.hpBar(),
        bgColor: COLORS.hpBarBg()
      });
    }
  });
};

export const drawPlayersSprites = (
  opts: Omit<DrawPlayersOptions, 'renderPlayer'> & { assetMap: AssetMap }
) =>
  drawPlayers({
    ...opts,
    renderPlayer: player => {
      const { x, y, meta } = player;

      const { ctx, assetMap, size } = opts;
      const isFlipped = meta.orientation === EntityOrientation.LEFT;
      pushPop(ctx, () => {
        // ctx.filter = 'saturate(200%)';
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
      drawPlayerName(ctx, { x, y, size, meta });
      drawPlayerStatBars(ctx, {
        ...player,
        size
      });
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
