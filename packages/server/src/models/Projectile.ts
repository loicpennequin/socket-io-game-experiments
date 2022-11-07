import {
  PROJECTILE_LIFESPAN,
  PROJECTILE_SPEED,
  ProjectileMeta
} from '@game/shared-domain';
import { getAngleFromVector } from '@game/shared-utils';
import { MapAware, withMapAwareness } from '../mixins/withMapAwareness';
import { Entity } from './Entity';

function withProjectile<TBase extends MapAware>(Base: TBase) {
  return class Projectile extends Base {
    private angle: number;

    lifeSpan = PROJECTILE_LIFESPAN;

    meta!: ProjectileMeta;

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);

      this.angle = getAngleFromVector({
        x: this.meta.target.x - this.position.x,
        y: this.meta.target.y - this.position.y
      });
    }

    update() {
      Object.assign(this.gridItem.position, {
        x: this.position.x + Math.cos(this.angle) * PROJECTILE_SPEED,
        y: this.position.y + Math.sin(this.angle) * PROJECTILE_SPEED
      });

      this.updateVisibleCells();
      this.world.map.grid.update(this.gridItem);

      this.lifeSpan--;

      if (this.lifeSpan <= 0) {
        this.destroy();
      }

      super.update();
    }
  };
}

export const Projectile = withProjectile(withMapAwareness(Entity));
export type Projectile = InstanceType<typeof Projectile>;
