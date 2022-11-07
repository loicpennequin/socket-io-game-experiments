import {
  PLAYER_SPEED,
  EntityOrientation,
  Directions,
  WALKABLE_TERRAIN,
  clampToGrid,
  PlayerMeta
} from '@game/shared-domain';
import { Constructor, Coordinates, uniqBy } from '@game/shared-utils';
import { Entity, EntityOptions } from './Entity';
import { createProjectile } from '../factories/projectile';
import { Projectile } from './Projectile';
import { withMapAwareness, MapAwareEntity } from '../mixins/withMapAwareness';

function withPlayer<TBase extends MapAwareEntity>(Base: TBase) {
  return class Player extends Base {
    meta!: PlayerMeta;

    directions = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    private updatePosition() {
      const diff = { x: 0, y: 0 };
      if (this.directions.up) diff.y -= PLAYER_SPEED;
      if (this.directions.down) diff.y += PLAYER_SPEED;
      if (this.directions.left) diff.x -= PLAYER_SPEED;
      if (this.directions.right) diff.x += PLAYER_SPEED;

      const newPosition = {
        x: clampToGrid(this.position.x + diff.x, this.dimensions.w),
        y: clampToGrid(this.position.y + diff.y, this.dimensions.h)
      };

      const terrain = this.world.map.getTerrainAtPosition(newPosition);
      if (WALKABLE_TERRAIN.includes(terrain)) {
        Object.assign(this.gridItem.position, newPosition);
      }
    }

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        parent: this as any
      });

      projectile.on('destroy', () => this.children.delete(projectile));
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
}

export const Player = withPlayer(withMapAwareness(Entity));
export type Player = InstanceType<typeof Player>;
