import { EntityOrientation, type EntityDto } from '@game/shared-domain';
import { createCanvas, pushPop } from '@/utils/canvas';
import { SPRITE_LOCATIONS } from '@/utils/constants';
import { noop } from '@game/shared-utils';
import type { AssetMap } from '../factories/assetMap';

export type DrawSpriteOptions = {
  ctx: CanvasRenderingContext2D;
  assetMap: AssetMap;
  size: number;
  entity: EntityDto;
  key: string;
  orientation: EntityOrientation;
  beforeDraw?: (sprite: SpriteInfos) => void;
};

type SpriteInfos = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};
const spriteMap = new Map<string, SpriteInfos>();

export const drawSprite = ({
  ctx,
  assetMap,
  entity,
  size,
  key,
  orientation,
  beforeDraw = noop
}: DrawSpriteOptions) => {
  if (!spriteMap.has(entity.id)) {
    spriteMap.set(entity.id, createCanvas({ w: size, h: size }));
  }

  const sprite = spriteMap.get(entity.id)!;
  const { x, y } = entity;

  // sprite.ctx.clearRect(0, 0, size, size);

  sprite.ctx.drawImage(
    assetMap.canvas,
    ...assetMap.get(...SPRITE_LOCATIONS[key]),
    0,
    0,
    size,
    size
  );

  pushPop(sprite.ctx, () => beforeDraw(sprite));

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
};
