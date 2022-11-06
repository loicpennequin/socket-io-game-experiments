import {
  CELL_SIZE,
  EntityType,
  GameMapCell,
  GRID_SIZE,
  PLAYER_HARD_FIELD_OF_VIEW,
  PLAYER_SOFT_FIELD_OF_VIEW,
  PLAYER_SIZE,
  PLAYER_SPEED,
  EntityOrientation,
  PlayerDto,
  Directions,
  TerrainType
} from '@game/shared-domain';
import {
  clamp,
  Coordinates,
  Override,
  randomInt,
  uniqBy
} from '@game/shared-utils';
import { Dir } from 'fs';
import { Entity, createEntity, MakeEntityOptions } from './entity';
import { GameMap } from './gameMap';
import { GameWorld } from './gameWorld';
import { createProjectile, Projectile } from './projectile';

export type Player = Override<
  Entity,
  {
    // overrides
    meta: PlayerDto['meta'];

    // new properties
    newDiscoveredCells: Map<string, GameMapCell>;
    allDiscoveredCells: Map<string, GameMapCell>;
    consumeDiscoveredCells: () => GameMapCell[];
    move: (directions: Directions) => void;
    fireProjectile: (target: Coordinates) => Projectile;
  }
>;

export type MakePlayerOptions = Override<
  Omit<
    MakeEntityOptions,
    'position' | 'dimensions' | 'type' | 'fieldOfView' | 'parent'
  >,
  { meta: PlayerDto['meta'] }
>;

const clampToGrid = (n: number, size: number) =>
  clamp(n, { min: size / 2, max: GRID_SIZE * CELL_SIZE - size / 2 });

const getInitialPosition = (map: GameMap) => {
  let position = {
    x: clampToGrid(randomInt(GRID_SIZE * CELL_SIZE), PLAYER_SIZE),
    y: clampToGrid(randomInt(GRID_SIZE * CELL_SIZE), PLAYER_SIZE)
  };

  let cellIndex = map.grid.getCellIndex(position);
  let terrain = map.cells[cellIndex.x][cellIndex.y].type;
  const allowed = [TerrainType.GRASS, TerrainType.SAND];
  while (!allowed.includes(terrain)) {
    position = {
      x: clampToGrid(randomInt(GRID_SIZE * CELL_SIZE), PLAYER_SIZE),
      y: clampToGrid(randomInt(GRID_SIZE * CELL_SIZE), PLAYER_SIZE)
    };

    cellIndex = map.grid.getCellIndex(position);
    terrain = map.cells[cellIndex.x][cellIndex.y].type;
  }

  return position;
};

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
    position: getInitialPosition(world.map),
    dimensions: { w: PLAYER_SIZE, h: PLAYER_SIZE },
    fieldOfView: {
      hard: PLAYER_HARD_FIELD_OF_VIEW,
      soft: PLAYER_SOFT_FIELD_OF_VIEW
    }
  });

  const directions: Directions = {
    up: false,
    down: false,
    left: false,
    right: false
  };

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

    update() {
      const diff = { x: 0, y: 0 };
      if (directions.up) diff.y -= PLAYER_SPEED;
      if (directions.down) diff.y += PLAYER_SPEED;
      if (directions.left) diff.x -= PLAYER_SPEED;
      if (directions.right) diff.x += PLAYER_SPEED;
      Object.assign(entity.gridItem.position, {
        x: clampToGrid(entity.position.x + diff.x, entity.dimensions.w),
        y: clampToGrid(entity.position.y + diff.y, entity.dimensions.h)
      });

      if (diff.x !== 0) {
        entity.meta.orientation =
          diff.x > 0 ? EntityOrientation.RIGHT : EntityOrientation.LEFT;
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

      entity.dispatch('update');
    },

    move(newDirection: Directions) {
      Object.assign(directions, newDirection);
    },

    fireProjectile(target: Coordinates) {
      const projectile = createProjectile({
        target,
        world,
        parent: entity as Player
      });

      projectile.on('destroy', () => entity.children.delete(projectile));
      entity.children.add(projectile);
      entity.world.addEntity(projectile);

      return projectile;
    }
  });
};
