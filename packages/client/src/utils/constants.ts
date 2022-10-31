import { PLAYER_ACTIONS, type PlayerAction } from '@game/shared';

type KeyboardAction = {
  type: PlayerAction;
  isOngoing: boolean;
};

export const KEYBOARD_CONTROLS: Record<string, KeyboardAction> = Object.freeze({
  KeyW: { type: PLAYER_ACTIONS.MOVE_UP, isOngoing: true },
  KeyS: { type: PLAYER_ACTIONS.MOVE_DOWN, isOngoing: true },
  KeyA: { type: PLAYER_ACTIONS.MOVE_LEFT, isOngoing: true },
  KeyD: { type: PLAYER_ACTIONS.MOVE_RIGHT, isOngoing: true },
  Space: { type: PLAYER_ACTIONS.FIRE_FLARE, isOngoing: false }
});

export const MAP_HUE = 120;

export const COLORS = Object.freeze({
  player: (isCurrentPlayer: boolean) =>
    isCurrentPlayer ? 'hsl(15, 80%, 50%)' : 'hsl(250, 80%, 50%)',

  mapCell: ({ lightness }: { lightness: number }) => {
    return `hsl(${MAP_HUE}, 45%, ${lightness}%)`;
  }
});
