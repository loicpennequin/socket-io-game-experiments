import { Coordinates } from '@game/shared-utils';
import { PROJECTILE_SPEED } from '@game/shared-domain';
import { createProjectile } from '../factories/projectile';
import { MapAware } from './withMapAwareness';
import { Creature } from './withCreature';
import { Projectile } from '../models/Projectile';
import { Behaviorable, BehaviorKey } from './withBehaviors';

export type ShooterEvents = {
  shoot: (target: Coordinates) => void;
};

export const ShooterEvents = {
  SHOOT: 'shoot'
} as const;

export const SHOOTER_BEHAVIOR = Symbol('shooter') as BehaviorKey<ShooterEvents>;

export const withShooting = <TBase extends MapAware & Creature & Behaviorable>(
  Base: TBase
) => {
  return class Shooter extends Base {
    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);
      this.addBehavior(SHOOTER_BEHAVIOR, {
        shoot: this.onShoot.bind(this)
      });
    }

    onShoot(target: Coordinates) {
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
