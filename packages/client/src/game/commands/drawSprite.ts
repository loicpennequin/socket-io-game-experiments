import { EntityOrientation, type EntityDto } from '@game/shared-domain';
import { isDefined, uniqBy, type Override } from '@game/shared-utils';
import { createCanvas, pushPop } from '@/utils/canvas';
import { SPRITE_LOCATIONS } from '@/utils/constants';
import type { AssetMap } from '../factories/assetMap';

export type SpriteDrawFunction = (
  sprite: SpriteInfos,
  timeElapsed: number,
  fx: SpriteFX
) => void;

export type SpriteFX = {
  id: string;
  duration: number;
  insertedAt: number;
  when: (entity: EntityDto, meta: any) => boolean;
  preRender?: SpriteDrawFunction;
  postRender?: SpriteDrawFunction;
  postDraw?: SpriteDrawFunction;
  meta: any;
};

export type SpriteFxInput = Override<
  SpriteFX,
  {
    insertedAt?: never;
    meta?: (entity: EntityDto) => any;
  }
>;

export type SpriteInfos = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  effects: SpriteFX[];
};
const spriteMap = new Map<string, SpriteInfos>();

export type DrawSpriteOptions = {
  ctx: CanvasRenderingContext2D;
  assetMap: AssetMap;
  size: number;
  entity: EntityDto;
  key: string;
  orientation: EntityOrientation;
  effects?: SpriteFxInput[];
};

export const drawSprite = ({
  ctx,
  assetMap,
  entity,
  size,
  key,
  orientation,
  effects = []
}: DrawSpriteOptions) => {
  if (!spriteMap.has(entity.id)) {
    spriteMap.set(entity.id, {
      ...createCanvas({ w: size, h: size }),
      effects: []
    });
  }

  const sprite = spriteMap.get(entity.id)!;
  const { x, y } = entity;

  const now = performance.now();
  const newEffects = effects
    .map(fx => {
      const computedMeta = fx.meta?.(entity);
      return fx.when(entity, computedMeta)
        ? {
            ...fx,
            meta: computedMeta,
            insertedAt: now
          }
        : null;
    })
    .filter(isDefined);

  sprite.effects = uniqBy(
    sprite.effects
      .concat(newEffects)
      .filter(fx => now - fx.duration < fx.insertedAt),
    fx => fx.id
  );

  sprite.ctx.clearRect(0, 0, size, size);

  sprite.effects.forEach(fx => {
    pushPop(sprite.ctx, () => fx.preRender?.(sprite, now - fx.insertedAt, fx));
  });

  sprite.ctx.drawImage(
    assetMap.canvas,
    ...assetMap.get(...SPRITE_LOCATIONS[key]),
    0,
    0,
    size,
    size
  );

  sprite.effects.forEach(fx => {
    pushPop(sprite.ctx, () => fx.postRender?.(sprite, now - fx.insertedAt, fx));
  });

  pushPop(ctx, () => {
    if (orientation === EntityOrientation.LEFT) {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      sprite.canvas,
      0,
      0,
      size,
      size,
      orientation === EntityOrientation.LEFT
        ? -1 * (x + size / 2)
        : x - size / 2,
      y - size / 2,
      size,
      size
    );
  });
  sprite.effects.forEach(fx => {
    pushPop(sprite.ctx, () => fx.postDraw?.(sprite, now - fx.insertedAt, fx));
  });
};
