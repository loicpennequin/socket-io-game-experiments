import { PLAYER_ACTIONS, type Values } from '@game/shared';

export const KEYBOARD_CONTROLS = Object.freeze({
  KeyW: PLAYER_ACTIONS.MOVE_UP,
  KeyS: PLAYER_ACTIONS.MOVE_DOWN,
  KeyA: PLAYER_ACTIONS.MOVE_LEFT,
  KeyD: PLAYER_ACTIONS.MOVE_RIGHT,
  Space: PLAYER_ACTIONS.FIRE_PROJECTILE
});

export type KeyboardControls = Values<typeof KEYBOARD_CONTROLS>;

export const MAP_HUE = 120;
export const PROJECTILE_THROTTLE_RATE = 500;
export const COLORS = Object.freeze({
  player: (isCurrentPlayer: boolean) =>
    isCurrentPlayer ? 'hsl(15, 80%, 50%)' : 'hsl(250, 80%, 50%)',

  projectile: (isCurrentPlayer: boolean) =>
    isCurrentPlayer ? 'hsl(15, 80%, 85%)' : 'hsl(250, 80%, 85%)',

  mapCell: ({ lightness }: { lightness: number }) => {
    return `hsl(${MAP_HUE}, 45%, ${lightness}%)`;
  }
});
