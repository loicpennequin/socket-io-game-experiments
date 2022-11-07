import {
  EntityOrientation,
  Directions,
  PlayerMeta,
  PROJECTILE_SPEED
} from '@game/shared-domain';
import { Coordinates } from '@game/shared-utils';
import { Entity } from './Entity';
import { createProjectile } from '../factories/projectile';
import { Projectile } from './Projectile';
import { withMapAwareness, MapAware } from '../mixins/withMapAwareness';
import { withMovement } from '../mixins/withMovement';
import {
  KeyboardMovable,
  withKeyboardMovement
} from '../mixins/withKeyboardMovement';

const withPlayer = <TBase extends MapAware & KeyboardMovable>(Base: TBase) => {
  return class Player extends Base {
    meta!: PlayerMeta;

    private updateOrientation() {
      if (this.directions.left) this.meta.orientation = EntityOrientation.LEFT;
      if (this.directions.right)
        this.meta.orientation = EntityOrientation.RIGHT;
    }

    update() {
      this.updatePosition();
      this.updateOrientation();
      super.updateVisibleCells();

      this.world.map.grid.update(this.gridItem);
      super.update();
    }

    move(newDirection: Directions) {
      Object.assign(this.directions, newDirection);
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
  };
};

export const Player = withPlayer(
  withMapAwareness(withKeyboardMovement(withMovement(Entity)))
);
export type Player = InstanceType<typeof Player>;
