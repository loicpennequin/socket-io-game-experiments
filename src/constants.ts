export const GRID_SIZE = 15;
export const CELL_SIZE = 50;
export const TICK_RATE = 15;
export const PLAYER_SIZE = 15;
export const PLAYER_SPEED = 5;

export const PLAYER_ACTIONS = Object.freeze({
  MOVE_UP: 'MOVE_UP',
  MOVE_DOWN: 'MOVE_DOWN',
  MOVE_LEFT: 'MOVE_LEFT',
  MOVE_RIGHT: 'MOVE_RIGHT'
});

export type PlayerAction = typeof PLAYER_ACTIONS[keyof typeof PLAYER_ACTIONS];

export const KEYBOARD_CONTROLS = Object.freeze({
  KeyW: PLAYER_ACTIONS.MOVE_UP,
  KeyS: PLAYER_ACTIONS.MOVE_DOWN,
  KeyA: PLAYER_ACTIONS.MOVE_LEFT,
  KeyD: PLAYER_ACTIONS.MOVE_RIGHT
});
