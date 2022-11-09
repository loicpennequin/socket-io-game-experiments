import { pushPop, circle, createCanvas } from '@/utils/canvas';
import {
  COLORS,
  ENTITY_STAT_BAR_HEIGHT,
  ENTITY_STAT_BAR_OFFSET
} from '@/utils/constants';
import type { GameState } from '../factories/gameState';
import { socket } from '@/utils/socket';
import {
  isPlayerDto,
  type PlayerDto,
  type PlayerMeta
} from '@game/shared-domain';
import {
  pointCircleCollision,
  type Coordinates,
  type Dimensions
} from '@game/shared-utils';
import type { AssetMap } from '../factories/assetMap';
import { drawStatBar } from './drawStatBar';
import { drawSprite } from './drawSprite';

type DrawPlayersOptions = {
  ctx: CanvasRenderingContext2D;
  size: number;
  camera?: Dimensions & Coordinates;
  handleHover?: boolean;
  mousePosition: Coordinates;
  state: GameState;
  renderPlayer: (player: PlayerDto) => void;
};

export const drawPlayers = ({
  ctx,
  renderPlayer,
  handleHover = true,
  mousePosition,
  camera,
  state,
  size
}: DrawPlayersOptions) => {
  state.entities.filter(isPlayerDto).forEach(({ id }) => {
    pushPop(ctx, () => {
      const player = state.interpolatedEntities[id];

      const isHovered =
        handleHover &&
        pointCircleCollision(
          {
            x: mousePosition.x + (camera?.x ?? 0),
            y: mousePosition.y + (camera?.y ?? 0)
          },
          {
            x: player.x,
            y: player.y,
            r: size / 2
          }
        );

      if (isHovered) {
        ctx.filter = 'brightness(110%)';
      }

      pushPop(ctx, () => {
        renderPlayer(player as PlayerDto);
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
      // pushPop(ctx, () => {
      // ctx.filter = 'saturate(200%)';

      drawSprite({
        ctx,
        assetMap,
        size,
        key: meta.job,
        orientation: meta.orientation,
        entity: player,
        beforeDraw(sprite) {
          if (player.stats.hp > 0) return;

          const fx = createCanvas({ w: size, h: size });
          fx.ctx.drawImage(sprite.canvas, 0, 0);
          fx.ctx.globalCompositeOperation = 'multiply';
          fx.ctx.fillStyle = 'rgba(255,0,0)';
          fx.ctx.fillRect(0, 0, size, size);
          sprite.ctx.globalCompositeOperation = 'source-in';
          sprite.ctx.drawImage(fx.canvas, 0, 0);
        }
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
