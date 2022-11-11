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
  randomInRange,
  type Coordinates,
  type Dimensions
} from '@game/shared-utils';
import type { AssetMap } from '../factories/assetMap';
import { drawStatBar } from './drawStatBar';
import { drawSprite } from './drawSprite';
import { Bezier } from 'bezier-js';

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

      drawSprite({
        ctx,
        assetMap,
        size,
        key: meta.job,
        orientation: meta.orientation,
        entity: player,
        effects: [
          {
            id: 'ATTACKED',
            meta: () => ({
              trigger: player.triggeredBehaviors.find(
                behavior => behavior.key === 'ATTACKED'
              ),
              curve: new Bezier(
                {
                  x: player.x,
                  y:
                    player.y -
                    ENTITY_STAT_BAR_OFFSET -
                    ENTITY_STAT_BAR_HEIGHT -
                    40
                },
                {
                  x: player.x,
                  y:
                    player.y -
                    ENTITY_STAT_BAR_OFFSET -
                    ENTITY_STAT_BAR_HEIGHT -
                    90
                },
                {
                  x: player.x + randomInRange({ min: -50, max: 50 }),
                  y:
                    player.y -
                    ENTITY_STAT_BAR_OFFSET -
                    ENTITY_STAT_BAR_HEIGHT -
                    40
                }
              )
            }),
            when: (_, meta) => {
              return player.stats.hp > 0 && meta.trigger;
            },
            duration: 400,
            postRender(sprite, elapsed) {
              const fx = createCanvas({ w: size, h: size });
              fx.ctx.globalAlpha = elapsed % 100;
              fx.ctx.drawImage(sprite.canvas, 0, 0);
              sprite.ctx.clearRect(
                0,
                0,
                sprite.canvas.width,
                sprite.canvas.height
              );
              sprite.ctx.drawImage(fx.canvas, 0, 0);
            },
            postDraw(_, elapsed, fx) {
              pushPop(ctx, () => {
                ctx.globalAlpha = elapsed / 100;
                ctx.font = 'normal 900 20px sans-serif';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillStyle = COLORS.entityHitText();
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                const pos = fx.meta.curve.get(elapsed / 400);
                ctx.fillText(fx.meta.trigger.meta.power, pos.x, pos.y);
                ctx.strokeText(fx.meta.trigger.meta.power, pos.x, pos.y);
              });
            }
          },
          {
            id: 'DIED',
            meta: () => ({
              trigger: player.triggeredBehaviors.find(
                behavior => behavior.key === 'DIED'
              ),
              curve: new Bezier(
                {
                  x: player.x - size / 2,
                  y: player.y - size / 2
                },
                {
                  x: player.x - size / 2,
                  y: player.y - size / 2 - 30
                },
                {
                  x: player.x - size / 2,
                  y: player.y - size / 2 + 250
                }
              )
            }),
            when: (_, meta) => meta.trigger,
            duration: Infinity,
            preRender(sprite, elapsed, fx) {
              sprite.ctx.globalAlpha = 1 - elapsed / 500;
              sprite.ctx.translate(
                0,
                fx.meta.curve.get(elapsed / 500).y - player.y
              );
            },
            postRender(sprite) {
              const { canvas: fxCanvas, ctx: fxCtx } = createCanvas({
                w: size,
                h: size
              });
              fxCtx.drawImage(sprite.canvas, 0, 0);
              fxCtx.globalCompositeOperation = 'multiply';
              fxCtx.fillStyle = 'rgba(255,0,0)';
              fxCtx.fillRect(0, 0, size, size);
              sprite.ctx.globalCompositeOperation = 'source-in';
              sprite.ctx.drawImage(fxCanvas, 0, 0);
            }
          }
        ]
      });

      if (player.stats.hp > 0) {
        drawPlayerName(ctx, { x, y, size, meta });
        drawPlayerStatBars(ctx, {
          ...player,
          size
        });
      }
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
