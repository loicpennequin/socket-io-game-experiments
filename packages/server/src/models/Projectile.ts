import { PROJECTILE_LIFESPAN } from '@game/shared-domain';
import { MapAware, withMapAwareness } from '../mixins/withMapAwareness';
import { Movable, withMovement } from '../mixins/withMovement';
import { Entity } from './Entity';

function withProjectile<TBase extends MapAware & Movable>(Base: TBase) {
  return class Projectile extends Base {
    lifeSpan = PROJECTILE_LIFESPAN;

    update() {
      this.move();
      this.updateVisibleCells();

      this.lifeSpan--;

      if (this.lifeSpan <= 0) {
        this.destroy();
      }

      super.update();
    }
  };
}

export const Projectile = withProjectile(
  withMovement(withMapAwareness(Entity))
);
export type Projectile = InstanceType<typeof Projectile>;
