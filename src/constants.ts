export const GAME_GRID_SIZE = 25;
export const TICK_RATE = 10;

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
