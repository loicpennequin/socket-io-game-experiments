import { ProjectileDto, PROJECTILE_LIFESPAN } from '@game/shared-domain';
import { clamp, mixinBuilder, rectRectCollision } from '@game/shared-utils';
import { withMapAwareness } from '../mixins/withMapAwareness';
import { withMovement } from '../mixins/withMovement';
import { isPlayer } from '../utils';
import { Entity, EntityOptions } from './Entity';

const mixins = mixinBuilder(Entity).add(withMovement).add(withMapAwareness);
export class Projectile extends mixins.build() {
  private lifeSpan = PROJECTILE_LIFESPAN;
  private collidedEntities = new Set<string>();

  constructor(opts: EntityOptions) {
    super(opts);

    this.on('update', () => this.onUpdate());
  }

  private handlePlayerCollision() {
    this.world.getEntitiesList().forEach(entity => {
      if (!isPlayer(entity)) return;
      if (entity.id === this.parent?.id) return;
      if (this.collidedEntities.has(entity.id)) return;

      const isColliding = rectRectCollision(
        { ...this.position, ...this.dimensions },
        { ...entity.position, ...entity.dimensions }
      );
      if (isColliding) {
        entity.stats.hp = clamp(entity.stats.hp - 10, {
          min: 0,
          max: entity.stats.maxHp
        });
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
