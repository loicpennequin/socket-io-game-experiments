import {
  CELL_SIZE,
  EntityType,
  GameMapCell,
  GRID_SIZE,
  PlayerMeta,
  PLAYER_HARD_FIELD_OF_VIEW,
  PLAYER_SOFT_FIELD_OF_VIEW,
  PLAYER_SIZE,
  PLAYER_SPEED,
  EntityOrientation
} from '@game/shared-domain';
import {
  clamp,
  Coordinates,
  Override,
  randomInt,
  uniqBy
} from '@game/shared-utils';
import { Entity, createEntity, MakeEntityOptions } from './entity';
import { createProjectile, Projectile } from './projectile';

export type Player = Override<
  Entity,
  {
    // overrides
    meta: PlayerMeta;

    // new properties
    newDiscoveredCells: Map<string, GameMapCell>;
    allDiscoveredCells: Map<string, GameMapCell>;
    consumeDiscoveredCells: () => GameMapCell[];
    move: (coords: Coordinates) => void;
    fireProjectile: (target: Coordinates) => Projectile;
  }
>;

export type MakePlayerOptions = Override<
  Omit<
    MakeEntityOptions,
    'position' | 'dimensions' | 'type' | 'fieldOfView' | 'parent'
  >,
  { meta: PlayerMeta }
>;

const clampToGrid = (n: number) =>
  clamp(n, { min: 0, max: GRID_SIZE * CELL_SIZE });

export const createPlayer = ({
  id,
  world,
  meta
}: MakePlayerOptions): Player => {
  const entity = createEntity({
    id,
    type: EntityType.PLAYER,
    world,
    parent: null,
    position: {
      x: randomInt(GRID_SIZE * CELL_SIZE),
      y: randomInt(GRID_SIZE * CELL_SIZE)
    },
    dimensions: { w: PLAYER_SIZE, h: PLAYER_SIZE },
    fieldOfView: {
      hard: PLAYER_HARD_FIELD_OF_VIEW,
      soft: PLAYER_SOFT_FIELD_OF_VIEW
    }
  });

  return Object.assign(entity, {
    meta,
    allDiscoveredCells: world.map.getVisibleCells(
      entity.position,
      PLAYER_SOFT_FIELD_OF_VIEW
    ),
    newDiscoveredCells: world.map.getVisibleCells(
      entity.position,
      PLAYER_SOFT_FIELD_OF_VIEW
    ),

    consumeDiscoveredCells() {
      const cells = Array.from(this.newDiscoveredCells.values());
      this.newDiscoveredCells.clear();

      return uniqBy(cells.flat(), cell => `${cell.x}.${cell.y}`);
    },

    move({ x, y }: Coordinates) {
      if (x === 0 && y === 0) return;

      Object.assign(entity.gridItem.position, {
        x: clampToGrid(entity.position.x + x * PLAYER_SPEED),
        y: clampToGrid(entity.position.y + y * PLAYER_SPEED)
      });

      if (x !== 0) {
        entity.meta.orientation =
          x > 0 ? EntityOrientation.RIGHT : EntityOrientation.LEFT;
      }

      const visibleCells = world.map.getVisibleCells(
        entity.position,
        PLAYER_SOFT_FIELD_OF_VIEW
      );

      for (const [key, cell] of visibleCells) {
        if (!this.allDiscoveredCells.has(key)) {
          this.allDiscoveredCells.set(key, cell);
          this.newDiscoveredCells.set(key, cell);
        }
      }

      world.map.grid.update(entity.gridItem);
    },

    fireProjectile(target: Coordinates) {
      const projectile = createProjectile({
        target,
        world,
        parent: entity as Player
      });

      entity.children.add(projectile);
      projectile.on('destroy', () => entity.children.delete(projectile));

      return projectile;
    }
  });
};
