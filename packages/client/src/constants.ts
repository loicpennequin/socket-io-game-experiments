import { PLAYER_ACTIONS } from '@game/shared';

export const KEYBOARD_CONTROLS = Object.freeze({
  KeyW: PLAYER_ACTIONS.MOVE_UP,
  KeyS: PLAYER_ACTIONS.MOVE_DOWN,
  KeyA: PLAYER_ACTIONS.MOVE_LEFT,
  KeyD: PLAYER_ACTIONS.MOVE_RIGHT
});

export const MAP_HUE = 120;

export const COLORS = Object.freeze({
  player: (isCurrentPlayer: boolean) =>
    isCurrentPlayer ? 'hsl(15, 80%, 50%)' : 'hsl(250, 80%, 50%)',

  mapCell: (lightness: number, isInFogOfWar: boolean) => {
    return `hsla(${MAP_HUE}, 45%, ${lightness}%, ${isInFogOfWar ? 0.3 : 1})`;
  }
});
