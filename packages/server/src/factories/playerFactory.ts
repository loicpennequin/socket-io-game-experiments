import {
  CELL_SIZE,
  clamp,
  Coordinates,
  EntityType,
  GameMapCell,
  GRID_SIZE,
  PLAYER_FIELD_OF_VIEW,
  PLAYER_SIZE,
  PLAYER_SPEED,
  randomInt,
  uniqBy
} from '@game/shared';
import { Entity, createEntity, MakeEntityOptions } from './entityFactory';
import { createProjectile, Projectile } from './projectileFactory';

export type Player = Entity & {
  newDiscoveredCells: Map<string, GameMapCell>;
  allDiscoveredCells: Map<string, GameMapCell>;

  consumeDiscoveredCells: () => GameMapCell[];
  move: (coords: Coordinates) => void;
  fireProjectile: (target: Coordinates) => Projectile;
};

export type MakePlayerOptions = Omit<
  MakeEntityOptions,
  'position' | 'dimensions' | 'type' | 'fieldOfView'
>;

const clampToGrid = (n: number) =>
  clamp(n, { min: 0, max: GRID_SIZE * CELL_SIZE });

export const createPlayer = ({ id, world }: MakePlayerOptions): Player => {
  const entity = createEntity({
    id,
    type: EntityType.PLAYER,
    world,
    position: {
      x: randomInt(GRID_SIZE * CELL_SIZE),
      y: randomInt(GRID_SIZE * CELL_SIZE)
    },
    dimensions: { w: PLAYER_SIZE, h: PLAYER_SIZE },
    fieldOfView: PLAYER_FIELD_OF_VIEW
  });

  const player = Object.assign(entity, {
    allDiscoveredCells: world.map.getVisibleCells(
      entity.position,
      PLAYER_FIELD_OF_VIEW
    ),
    newDiscoveredCells: world.map.getVisibleCells(
      entity.position,
      PLAYER_FIELD_OF_VIEW
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

      const visibleCells = world.map.getVisibleCells(
        entity.position,
        PLAYER_FIELD_OF_VIEW
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
        player: this as unknown as Player
      });

      entity.children.add(projectile);
      projectile.on('destroy', () => entity.children.delete(projectile));

      return projectile;
    }
  });

  return player;
};
