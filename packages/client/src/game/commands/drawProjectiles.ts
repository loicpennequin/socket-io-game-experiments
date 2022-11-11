import { pushPop } from '@/utils/canvas';
import type { GameState } from '../factories/gameState';
import {
  EntityOrientation,
  isProjectileDto,
  type ProjectileDto
} from '@game/shared-domain';
import { drawSprite } from './drawSprite';
import type { AssetMap } from '../factories/assetMap';

type DrawProjectilesOptions = {
  ctx: CanvasRenderingContext2D;
  size: number;
  state: GameState;
  assetMap: AssetMap;
};

export const drawProjectiles = ({
  ctx,
  size,
  assetMap,
  state
}: DrawProjectilesOptions) => {
  pushPop(ctx, () => {
    state.entities.filter(isProjectileDto).forEach(entity => {
      const projectile = state.interpolatedEntities[entity.id] as ProjectileDto;
      pushPop(ctx, () => {
        drawSprite({
          ctx,
          assetMap,
          size,
          entity: projectile,
          key: 'FIREBALL',
          orientation: EntityOrientation.RIGHT,
          effects: [
            {
              id: 'ANGLE',
              duration: Infinity,
              when: () => true,
              preRender(sprite) {
                sprite.ctx.translate(size / 2, size / 2);
                sprite.ctx.rotate(projectile.angle);
                sprite.ctx.translate(-size / 2, -size / 2);
              }
            }
          ]
        });
      });
    });
  });
};
