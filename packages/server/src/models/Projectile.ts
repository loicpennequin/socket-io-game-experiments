import {
  PROJECTILE_LIFESPAN,
  PROJECTILE_SPEED,
  ProjectileMeta
} from '@game/shared-domain';
import { Constructor, getAngleFromVector } from '@game/shared-utils';
import { Entity } from './Entity';
import { Player } from './Player';

function withProjectileMixin<TBase extends Constructor<Entity>>(Base: TBase) {
  return class Projectile extends Base {
    private angle: number;

    lifeSpan = PROJECTILE_LIFESPAN;

    meta!: ProjectileMeta;

    parent!: Player;

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

      const visibleCells = this.world.map.getVisibleCells(
        this.position,
        this.fieldOfView.soft
      );

      for (const [key, cell] of visibleCells) {
        if (!this.parent.allDiscoveredCells.has(key)) {
          this.parent.allDiscoveredCells.set(key, cell);
          this.parent.newDiscoveredCells.set(key, cell);
        }
      }

      this.world.map.grid.update(this.gridItem);

      this.lifeSpan--;

      if (this.lifeSpan <= 0) {
        this.destroy();
      }

      super.update();
    }
  };
}

export const Projectile = withProjectileMixin(Entity);
export type Projectile = InstanceType<typeof Projectile>;
