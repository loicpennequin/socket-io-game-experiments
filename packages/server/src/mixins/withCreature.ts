import { CreatureStats, TICK_RATE } from '@game/shared-domain';
import { clamp, Constructor, noop } from '@game/shared-utils';
import { Entity } from '../models/Entity';
import { Behaviorable, BehaviorKey } from './withBehaviors';
import { LifeCyclable } from './withLifecycle';

export type CreatureEvents = {
  died: () => void;
};
export const CreatureEvents = {
  DIED: 'died'
} as const;

export const CREATURE_BEHAVIOR = Symbol(
  'creature'
) as BehaviorKey<CreatureEvents>;

export const withCreature = <TBase extends Behaviorable & Constructor<Entity>>(
  Base: TBase
) => {
  return class Creature extends Base {
    stats!: CreatureStats;
    isAlive = true;

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);

      this.on('update', this.onCreatureUpdate.bind(this));
      this.addBehavior(CREATURE_BEHAVIOR, {
        died: noop
      });
    }

    onCreatureUpdate() {
      this.stats.mp = clamp(
        this.stats.mp + this.stats.mpRegenPerSecond / TICK_RATE,
        { min: 0, max: this.stats.maxMp }
      );

      if (this.stats.hp <= 0 && this.isAlive) {
        this.triggerBehavior(CREATURE_BEHAVIOR, 'died');
        this.isAlive = false;
      }
    }
  };
};

export type Creature = ReturnType<typeof withCreature>;
