import { PlayerMeta, PROJECTILE_SPEED } from '@game/shared-domain';
import { Coordinates } from '@game/shared-utils';
import { Entity, EntityOptions } from './Entity';
import { createProjectile } from '../factories/projectile';
import { Projectile } from './Projectile';
import { withMapAwareness } from '../mixins/withMapAwareness';
import { withMovement } from '../mixins/withMovement';
import { withKeyboardMovement } from '../mixins/withKeyboardMovement';

export class Player extends withMapAwareness(
  withKeyboardMovement(withMovement(Entity))
) {
  meta!: PlayerMeta;

  constructor(opts: EntityOptions) {
    super(opts);

    this.on('update', () => this.onUpdate());
  }

  private onUpdate() {
    this.updatePosition();
    super.updateVisibleCells();

    this.world.map.grid.update(this.gridItem);
  }

  fireProjectile(target: Coordinates): Projectile {
    const projectile = createProjectile({
      meta: { target },
      world: this.world,
      speed: PROJECTILE_SPEED,
      parent: this
    });

    projectile.moveTo(target);

    projectile.on('update', () => {
      for (const cell of projectile.discoveredCells) {
        const key = this.getCellKey(cell);
        if (!this.allDiscoveredCells.has(key)) {
          this.allDiscoveredCells.set(key, cell);
          this.newDiscoveredCells.set(key, cell);
        }
      }
    });

    this.world.addEntity(projectile);
    this.children.add(projectile);

    return projectile;
  }
}
