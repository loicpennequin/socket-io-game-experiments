import { PlayerMeta } from '@game/shared-domain';
import { mixinBuilder } from '@game/shared-utils';
import { Entity, EntityOptions } from './Entity';
import { withMapAwareness } from '../mixins/withMapAwareness';
import { withMovement } from '../mixins/withMovement';
import { withKeyboardMovement } from '../mixins/withKeyboardMovement';
import { withShooting } from '../mixins/withShooting';

const mixins = mixinBuilder(Entity)
  .add(withMovement)
  .add(withKeyboardMovement)
  .add(withMapAwareness)
  .add(withShooting);
export class Player extends mixins.build() {
  meta!: PlayerMeta;

  constructor(opts: EntityOptions) {
    super(opts);

    this.on('update', () => this.onUpdate());
  }

  private onUpdate() {
    this.updatePosition();
    this.updateVisibleCells();

    this.world.map.grid.update(this.gridItem);
  }
}
