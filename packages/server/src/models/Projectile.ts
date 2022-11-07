import { PROJECTILE_LIFESPAN } from '@game/shared-domain';
import { withMapAwareness } from '../mixins/withMapAwareness';
import { withMovement } from '../mixins/withMovement';
import { Entity, EntityOptions } from './Entity';

export class Projectile extends withMovement(withMapAwareness(Entity)) {
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
