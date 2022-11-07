import { Coordinates } from '@game/shared-utils';
import { PROJECTILE_SPEED } from '@game/shared-domain';
import { createProjectile } from '../factories/projectile';
import { Projectile } from '../models/Projectile';
import { MapAware } from './withMapAwareness';

export const withShooting = <TBase extends MapAware>(Base: TBase) => {
  return class Shooter extends Base {
    shootProjectile(target: Coordinates): Projectile {
      const projectile = createProjectile({
        meta: { target },
        world: this.world,
        speed: PROJECTILE_SPEED,
        parent: this
      });

      projectile.moveTo(target);

      projectile.on('update', () => {
        for (const cell of projectile.discoveredCells) {
          const key = this.getCellKey(cell);
          if (!this.allDiscoveredCells.has(key)) {
            this.allDiscoveredCells.set(key, cell);
            this.newDiscoveredCells.set(key, cell);
          }
        }
      });

      this.world.addEntity(projectile);
      this.children.add(projectile);

      return projectile;
    }
  };
};

export type Shooter = ReturnType<typeof withShooting>;
