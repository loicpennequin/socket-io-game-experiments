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
  randomInt
} from '@game/shared';
import { gameMap } from '../gameMap';
import { Entity, createEntity, MakeEntityOptions } from './entityFactory';

export type Player = Entity & {
  ongoingActions: Set<OngoingAction>;
  newDiscoveredCells: Map<string, GameMapCell>;
  allDiscoveredCells: Map<string, GameMapCell>;

  move: (coords: Coordinates) => void;
};

export type MakePlayerOptions = Omit<
  MakeEntityOptions,
  'position' | 'dimensions' | 'type'
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
    dimensions: { w: PLAYER_SIZE, h: PLAYER_SIZE }
  });

  return Object.assign(entity, {
    ongoingActions: new Set<OngoingAction>(),
    allDiscoveredCells: gameMap.getVisibleCells(
      entity.position,
      PLAYER_FIELD_OF_VIEW
    ),
    newDiscoveredCells: gameMap.getVisibleCells(
      entity.position,
      PLAYER_FIELD_OF_VIEW
    ),

    move({ x, y }: Coordinates) {
      if (x === 0 && y === 0) return;

      Object.assign(entity.gridItem.position, {
        x: clampToGrid(entity.position.x + x * PLAYER_SPEED),
        y: clampToGrid(entity.position.y + y * PLAYER_SPEED)
      });

      const visibleCells = gameMap.getVisibleCells(
        entity.position,
        PLAYER_FIELD_OF_VIEW
      );
      for (const [key, cell] of visibleCells) {
        if (!this.allDiscoveredCells.has(key)) {
          this.allDiscoveredCells.set(key, cell);
          this.newDiscoveredCells.set(key, cell);
        }
      }

      gameMap.grid.update(entity.gridItem);
    }
  }).on('update', e => {
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
  }) as Player;
};
