import { MAP_SIZE, PlayerAction, type Values } from '@game/shared';

export const MAP_HUE = 120;
export const PROJECTILE_THROTTLE_RATE = 500;
export const MINIMAP_SIZE = 200;
export const MINIMAP_SCALE = MINIMAP_SIZE / MAP_SIZE;
export const MINIMAP_ENTITY_SCALE = 5;
export const FOG_OF_WAR_ALPHA = 0.3;

export const KEYBOARD_CONTROLS = Object.freeze({
  KeyW: PlayerAction.MOVE_UP,
  KeyS: PlayerAction.MOVE_DOWN,
  KeyA: PlayerAction.MOVE_LEFT,
  KeyD: PlayerAction.MOVE_RIGHT,
  Space: PlayerAction.FIRE_PROJECTILE
});

export type KeyboardControls = Values<typeof KEYBOARD_CONTROLS>;
export const COLORS = Object.freeze({
  minimapBackground: () => 'black',

  player: (isCurrentPlayer: boolean) =>
    isCurrentPlayer ? 'hsl(15, 80%, 50%)' : 'hsl(250, 80%, 50%)',

  projectile: (isCurrentPlayer: boolean) =>
    isCurrentPlayer ? 'hsl(15, 80%, 75%)' : 'hsl(250, 80%, 75%)',

  mapCell: ({ lightness }: { lightness: number }) => {
    return `hsl(${MAP_HUE}, 45%, ${lightness}%)`;
  }
});
