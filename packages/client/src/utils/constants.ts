import type { Values } from '@game/shared-utils';
import { CELL_SIZE, MAP_SIZE, PlayerAction } from '@game/shared-domain';

export const MAP_HUE = 120;
export const PROJECTILE_THROTTLE_RATE = 500;
export const MINIMAP_SIZE = 200;
export const MINIMAP_SCALE = MINIMAP_SIZE / MAP_SIZE;
export const MINIMAP_ENTITY_SCALE = 5;
export const FOG_OF_WAR_BLUR = CELL_SIZE * 0.75;
export const MAP_CELL_OPACITY_STEP = 0.1;
export const DEFAULT_CELL_LIGHTNESS = 50;

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

  fogOfWar: () => 'rgba(0, 0, 0, 0.8)'
});
