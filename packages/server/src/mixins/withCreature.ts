import { CreatureStats, TICK_RATE } from '@game/shared-domain';
import { clamp, Constructor } from '@game/shared-utils';
import { Entity } from '../models/Entity';

export const withCreature = <TBase extends Constructor<Entity>>(
  Base: TBase
) => {
  return class Creature extends Base {
    stats!: CreatureStats;

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);

      this.on('update', this.onCreatureUpdate.bind(this));
    }

    onCreatureUpdate() {
      this.stats.mp = clamp(
        this.stats.mp + this.stats.mpRegenPerSecond / TICK_RATE,
        { min: 0, max: this.stats.maxMp }
      );
    }
  };
};

export type Creature = ReturnType<typeof withCreature>;
