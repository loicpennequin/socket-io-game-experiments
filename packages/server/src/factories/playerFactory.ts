import {
  CELL_SIZE,
  clamp,
  Coordinates,
  EntityType,
  GameMapCell,
  GRID_SIZE,
  OngoingAction,
  PlayerAction,
  PLAYER_FIELD_OF_VIEW,
  PLAYER_SIZE,
  PLAYER_SPEED,
  randomInt,
  uniqBy
} from '@game/shared';
import { v4 as uuid } from 'uuid';
import { withEventEmitter } from '../behaviors/eventEmitter';
import { LifecycleEvents, withLifecycle } from '../behaviors/lifecycle';
import { withMovement, withPosition } from '../behaviors/positionable';
import { gameWorld } from '../gameWorld';
import { Entity, createEntity, MakeEntityOptions } from './entityFactory';
import { createProjectile, Projectile } from './projectileFactory';

export type Player = Entity & {
  ongoingActions: Set<OngoingAction>;
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

export const createPlayer = ({ id }: MakePlayerOptions): Player => {
  const entity = createEntity({
    id,
    type: EntityType.PLAYER,
    position: {
      x: randomInt(GRID_SIZE * CELL_SIZE),
      y: randomInt(GRID_SIZE * CELL_SIZE)
    },
    dimensions: { w: PLAYER_SIZE, h: PLAYER_SIZE },
    fieldOfView: PLAYER_FIELD_OF_VIEW
  });

  const player = Object.assign(entity, {
    ongoingActions: new Set<OngoingAction>(),

    allDiscoveredCells: gameWorld.map.getVisibleCells(
      entity.position,
      PLAYER_FIELD_OF_VIEW
    ),
    newDiscoveredCells: gameWorld.map.getVisibleCells(
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

      const visibleCells = gameWorld.map.getVisibleCells(
        entity.position,
        PLAYER_FIELD_OF_VIEW
      );
      for (const [key, cell] of visibleCells) {
        if (!this.allDiscoveredCells.has(key)) {
          this.allDiscoveredCells.set(key, cell);
          this.newDiscoveredCells.set(key, cell);
        }
      }

      gameWorld.map.grid.update(entity.gridItem);
    },

    fireProjectile(target: Coordinates) {
      const projectile = createProjectile({
        id: uuid(),
        target,
        player: this as unknown as Player
      });

      entity.children.add(projectile);
      projectile.on('destroy', () => entity.children.delete(projectile));

      return projectile;
    }
  });

  player.on('update', e => {
    const player = e as Player;

    player.ongoingActions.forEach(action => {
      switch (action) {
        case PlayerAction.MOVE_UP:
          return player.move({ x: 0, y: -1 });
        case PlayerAction.MOVE_DOWN:
          return player.move({ x: 0, y: 1 });
        case PlayerAction.MOVE_LEFT:
          return player.move({ x: -1, y: 0 });
        case PlayerAction.MOVE_RIGHT:
          return player.move({ x: 1, y: 0 });
      }
    });
  });

  return player;
};
