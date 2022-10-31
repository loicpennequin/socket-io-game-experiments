export const GRID_SIZE = 20;
export const CELL_SIZE = 40;
export const MAP_SIZE = GRID_SIZE * CELL_SIZE;
export const MAP_HUE = 120;
export const TICK_RATE = 10;
export const PLAYER_SIZE = 20;
export const PLAYER_SPEED_PER_SECOND = CELL_SIZE * 6;
export const PLAYER_SPEED = PLAYER_SPEED_PER_SECOND / TICK_RATE;
export const PLAYER_FIELD_OF_VIEW = CELL_SIZE * 3;

export const PLAYER_ACTIONS = Object.freeze({
  MOVE_UP: 'MOVE_UP',
  MOVE_DOWN: 'MOVE_DOWN',
  MOVE_LEFT: 'MOVE_LEFT',
  MOVE_RIGHT: 'MOVE_RIGHT'
});

export type PlayerAction = typeof PLAYER_ACTIONS[keyof typeof PLAYER_ACTIONS];
