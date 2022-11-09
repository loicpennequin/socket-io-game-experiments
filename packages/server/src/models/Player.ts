import { EntityType, PlayerDto, PlayerMeta } from '@game/shared-domain';
import { mixinBuilder, Override } from '@game/shared-utils';
import { Entity, EntityOptions } from './Entity';
import { withMapAwareness } from '../mixins/withMapAwareness';
import { withMovement } from '../mixins/withMovement';
import { withKeyboardMovement } from '../mixins/withKeyboardMovement';
import { withShooting } from '../mixins/withShooting';
import { withCreature } from '../mixins/withCreature';
import { jobsData } from '../data/jobs';

const mixins = mixinBuilder(Entity)
  .add(withMovement)
  .add(withKeyboardMovement)
  .add(withMapAwareness)
  .add(withCreature)
  .add(withShooting);

export type PlayerOptions = EntityOptions & {
  speed: number;
};
export class Player extends mixins.build() {
  meta!: PlayerMeta;

  constructor(opts: PlayerOptions) {
    super(opts);
    this.speed = opts.speed;
    this.stats = jobsData[this.meta.job]();

    this.on('update', () => this.onUpdate());
  }

  private onUpdate() {
    this.updatePosition();

    this.world.map.grid.update(this.gridItem);
  }

  toDto(): PlayerDto {
    return {
      ...this.position,
      id: this.id,
      type: this.type,
      parent: this.parent?.id ?? null,
      children: [...this.children.values()].map(child => child.id),
      stats: this.stats,
      meta: this.meta
    };
  }
}
