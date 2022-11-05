import type { Values } from '@game/shared-utils';
import {
  CELL_SIZE,
  MAP_SIZE,
  PlayerAction,
  PlayerJob
} from '@game/shared-domain';

export const ONE_FRAME = 1000 / 60;
export const MAP_HUE = 120;
export const PROJECTILE_THROTTLE_RATE = 500;
export const MINIMAP_SIZE = 200;
export const MINIMAP_SCALE = MINIMAP_SIZE / MAP_SIZE;
export const MINIMAP_ENTITY_SCALE = 1;
export const FOG_OF_WAR_BLUR = CELL_SIZE * 0.75;
export const MAP_CELL_OPACITY_STEP = 0.1;
export const DEFAULT_CELL_LIGHTNESS = 50;
export const MANUAL_CAMERA_BOUNDARIES = 85;
export const MANUAL_CAMERA_SWITCH_TIMEOUT = 250;
export const CAMERA_SPEED = 15;

export const COLORS = Object.freeze({
  minimapBackground: () => 'black',

  player: (isCurrentPlayer: boolean) =>
    isCurrentPlayer ? 'hsl(15, 80%, 50%)' : 'hsl(250, 80%, 50%)',

  projectile: (isCurrentPlayer: boolean) =>
    isCurrentPlayer ? 'hsl(15, 80%, 75%)' : 'hsl(250, 80%, 75%)',

  mapCell: ({ l, a }: { l: number; a: number }) => {
    return `hsla(${MAP_HUE}, 30%, ${l}%, ${a})`;
  },

  fogOfWar: () => 'rgba(0, 0, 0, 0.8)'
});

export const SPRITE_LOCATIONS: Record<string, [number, number, number]> = {
  [PlayerJob.RANGER]: [2, 0, 1],
  [PlayerJob.ROGUE]: [3, 0, 1],
  [PlayerJob.WIZARD]: [7, 0, 1],
  [PlayerJob.BARBARIAN]: [10, 0, 1]
};

export const CameraControls = {
  MOVE_UP: 'MOVE_CAMERA_UP',
  MOVE_DOWN: 'MOVE_CAMERA_DOWN',
  MOVE_LEFT: 'MOVE_CAMERA_LEFT',
  MOVE_RIGHT: 'MOVE_CAMERA_RIGHT',
  RESET: 'RESET',
  TOGGLE_LOCK: 'TOGGLE_LOCK'
};
export type CameraControls = Values<typeof CameraControls>;

export const CameraMode = {
  AUTO: 'AUTO',
  MANUAL: 'MANUAL'
};
export type CameraMode = Values<typeof CameraMode>;

export const KeyboardControls = Object.freeze({
  KeyW: PlayerAction.MOVE_UP,
  KeyS: PlayerAction.MOVE_DOWN,
  KeyA: PlayerAction.MOVE_LEFT,
  KeyD: PlayerAction.MOVE_RIGHT,
  KeyY: CameraControls.TOGGLE_LOCK,
  ArrowUp: CameraControls.MOVE_UP,
  ArrowDown: CameraControls.MOVE_DOWN,
  ArrowLeft: CameraControls.MOVE_LEFT,
  ArrowRight: CameraControls.MOVE_RIGHT,
  Space: CameraControls.RESET
});
export type KeyboardControls = Values<typeof KeyboardControls>;
