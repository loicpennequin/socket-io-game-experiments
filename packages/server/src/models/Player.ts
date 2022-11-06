import {
  GameMapCell,
  PLAYER_SOFT_FIELD_OF_VIEW,
  PLAYER_SPEED,
  EntityOrientation,
  Directions,
  WALKABLE_TERRAIN,
  clampToGrid,
  PlayerMeta
} from '@game/shared-domain';
import { Constructor, Coordinates, uniqBy } from '@game/shared-utils';
import { Entity } from './Entity';
import { createProjectile } from '../factories/projectile';
import { Projectile } from './Projectile';

function withPlayerMixin<TBase extends Constructor<Entity>>(Base: TBase) {
  return class Player extends Base {
    meta!: PlayerMeta;

    newDiscoveredCells: Map<string, GameMapCell>;

    allDiscoveredCells: Map<string, GameMapCell>;

    private directions = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);

      this.allDiscoveredCells = this.world.map.getVisibleCells(
        this.position,
        PLAYER_SOFT_FIELD_OF_VIEW
      );

      this.newDiscoveredCells = this.world.map.getVisibleCells(
        this.position,
        PLAYER_SOFT_FIELD_OF_VIEW
      );
    }

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

    private updateVisibleCells() {
      const visibleCells = this.world.map.getVisibleCells(
        this.position,
        this.fieldOfView.soft
      );

      for (const [key, cell] of visibleCells) {
        if (!this.allDiscoveredCells.has(key)) {
          this.allDiscoveredCells.set(key, cell);
          this.newDiscoveredCells.set(key, cell);
        }
      }
    }

    update() {
      this.updatePosition();
      this.updateOrientation();
      this.updateVisibleCells();

      this.world.map.grid.update(this.gridItem);

      super.update();
    }

    consumeDiscoveredCells() {
      const cells = Array.from(this.newDiscoveredCells.values());
      this.newDiscoveredCells.clear();

      return uniqBy(cells.flat(), cell => `${cell.x}.${cell.y}`);
    }

    move(newDirection: Directions) {
      Object.assign(this.directions, newDirection);
    }

    fireProjectile(target: Coordinates): Projectile {
      const projectile = createProjectile({
        meta: { target },
        world: this.world,
        parent: this
      });

      projectile.on('destroy', () => this.children.delete(projectile));
      this.world.addEntity(projectile);
      this.children.add(projectile);

      return projectile;
    }
  };
}

export const Player = withPlayerMixin(Entity);
export type Player = InstanceType<typeof Player>;
