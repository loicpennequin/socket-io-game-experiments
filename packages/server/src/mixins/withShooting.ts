import { Coordinates } from '@game/shared-utils';
import { PROJECTILE_SPEED } from '@game/shared-domain';
import { createProjectile } from '../factories/projectile';
import { MapAware } from './withMapAwareness';
import { Creature } from './withCreature';

export const withShooting = <TBase extends MapAware & Creature>(
  Base: TBase
) => {
  return class Shooter extends Base {
    shootProjectile(target: Coordinates) {
      if (this.stats.mp < 5) return;

      this.stats.mp -= 5;

      const projectile = createProjectile({
        meta: { target },
        world: this.world,
        speed: PROJECTILE_SPEED,
        parent: this
      });

      projectile.moveTo(target);

      this.world.addEntity(projectile);
      this.children.add(projectile);
    }
  };
};

export type Shooter = ReturnType<typeof withShooting>;
