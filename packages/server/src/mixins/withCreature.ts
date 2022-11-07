import { CreatureStats } from '@game/shared-domain';
import { Constructor } from '@game/shared-utils';
import { Entity } from '../models/Entity';

export const withCreature = <TBase extends Constructor<Entity>>(
  Base: TBase
) => {
  return class Creature extends Base {
    stats!: CreatureStats;
  };
};

export type Creature = ReturnType<typeof withCreature>;
