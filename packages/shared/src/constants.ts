import { EntityType } from './types';

export const GRID_SIZE = 80;
export const CELL_SIZE = 30;
export const MAP_SIZE = GRID_SIZE * CELL_SIZE;
export const TICK_RATE = 20;

export const PLAYER_SIZE = 20;
export const PLAYER_SPEED_PER_SECOND = CELL_SIZE * 10;
export const PLAYER_SPEED = PLAYER_SPEED_PER_SECOND / TICK_RATE;
export const PLAYER_FIELD_OF_VIEW = CELL_SIZE * 4;

export const PROJECTILE_LIFESPAN = 12;
export const PROJECTILE_SIZE = 8;
export const PROJECTILE_SPEED_PER_SECOND = CELL_SIZE * 30;
export const PROJECTILE_SPEED = PROJECTILE_SPEED_PER_SECOND / TICK_RATE;
export const PROJECTILE_FIELD_OF_VIEW = CELL_SIZE * 2;

export const PLAYER_ACTIONS = Object.freeze({
  MOVE_UP: 'MOVE_UP',
  MOVE_DOWN: 'MOVE_DOWN',
  MOVE_LEFT: 'MOVE_LEFT',
  MOVE_RIGHT: 'MOVE_RIGHT',
  FIRE_PROJECTILE: 'FIRE_PROJECTILE'
});

export const ONGOING_ACTIONS = [
  PLAYER_ACTIONS.MOVE_UP,
  PLAYER_ACTIONS.MOVE_DOWN,
  PLAYER_ACTIONS.MOVE_LEFT,
  PLAYER_ACTIONS.MOVE_RIGHT
] as const;

export const ENTITY_TYPES = {
  PLAYER: 'player' as EntityType,
  PROJECTILE: 'projectile' as EntityType
};
