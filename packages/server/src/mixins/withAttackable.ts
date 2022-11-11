import { clamp } from '@game/shared-utils';
import { Projectile } from '../models/Projectile';
import { Behaviorable } from './withBehaviors';
import { Creature } from './withCreature';

export type AttackableEvents = {
  attacked: (projectile: Projectile) => void;
};

export const ATTACKABLE_BEHAVIOR = 'ATTACKABLE';

export const AttackableEvents = {
  ATTACKED: 'attacked'
} as const;

export const withAttackable = <TBase extends Behaviorable & Creature>(
  Base: TBase
) => {
  return class Attackable extends Base {
    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);
      this.addBehavior(ATTACKABLE_BEHAVIOR, ['attacked']);
      this.on('attacked', this.onAttacked.bind(this));
    }

    onAttacked(projectile: Projectile) {
      this.stats.hp = clamp(this.stats.hp - projectile.power, {
        min: 0,
        max: this.stats.maxHp
      });
    }
  };
};

export type Attackable = ReturnType<typeof withAttackable>;
