import { ProjectileDto, PROJECTILE_LIFESPAN } from '@game/shared-domain';
import { mixinBuilder, rectRectCollision } from '@game/shared-utils';
import {
  AttackableEvents,
  ATTACKABLE_BEHAVIOR
} from '../mixins/withAttackable';
import { withMapAwareness } from '../mixins/withMapAwareness';
import { withMovement } from '../mixins/withMovement';
import { Entity, EntityOptions } from './Entity';

const mixins = mixinBuilder(Entity).add(withMovement).add(withMapAwareness);
export class Projectile extends mixins.build() {
  private lifeSpan = PROJECTILE_LIFESPAN;
  private collidedEntities = new Set<string>();
  power = 10;

  constructor(opts: EntityOptions) {
    super(opts);

    this.on('update', () => this.onUpdate());
  }

  private handlePlayerCollision() {
    this.world.getEntitiesList().forEach(entity => {
      if (entity.id === this.parent?.id) return;
      if (entity.id === this.id) return;
      if (this.collidedEntities.has(entity.id)) return;

      const isColliding = rectRectCollision(
        { ...this.position, ...this.dimensions },
        { ...entity.position, ...entity.dimensions }
      );
      if (isColliding) {
        this.collidedEntities.add(entity.id);
        entity.triggerBehavior(
          ATTACKABLE_BEHAVIOR,
          AttackableEvents.ATTACKED,
          this
        );
      }
    });
  }

  private onUpdate() {
    this.updatePosition();
    this.handlePlayerCollision();

    this.lifeSpan--;
    if (this.lifeSpan <= 0) {
      this.destroy();
    }
  }

  toDto(): ProjectileDto {
    return {
      ...this.position,
      id: this.id,
      type: this.type,
      parent: this.parent?.id ?? null,
      children: [...this.children.values()].map(child => child.id),
      meta: this.meta
    };
  }
}
