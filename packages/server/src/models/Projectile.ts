import { PROJECTILE_LIFESPAN } from '@game/shared-domain';
import { mixinBuilder } from '@game/shared-utils';
import { withMapAwareness } from '../mixins/withMapAwareness';
import { withMovement } from '../mixins/withMovement';
import { Entity, EntityOptions } from './Entity';

const mixins = mixinBuilder(Entity).add(withMovement).add(withMapAwareness);
export class Projectile extends mixins.build() {
  lifeSpan = PROJECTILE_LIFESPAN;

  constructor(opts: EntityOptions) {
    super(opts);

    this.on('update', () => this.onUpdate());
  }

  private onUpdate() {
    this.updatePosition();
    this.updateVisibleCells();

    this.lifeSpan--;

    if (this.lifeSpan <= 0) {
      this.destroy();
    }
  }
}
