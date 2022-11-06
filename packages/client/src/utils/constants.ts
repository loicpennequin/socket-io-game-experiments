import type { Values } from '@game/shared-utils';
import {
  CELL_SIZE,
  MAP_SIZE,
  PlayerJob,
  TerrainType
} from '@game/shared-domain';
import type { MapRendererCell } from '@/renderers/mapRenderer';

export const ONE_FRAME = 1000 / 60;
export const PROJECTILE_THROTTLE_RATE = 500;
export const MINIMAP_SIZE = 200;
export const MINIMAP_SCALE = MINIMAP_SIZE / MAP_SIZE;
export const MINIMAP_ENTITY_SCALE = 3;
export const FOG_OF_WAR_BLUR = CELL_SIZE * 8;
export const MAP_CELL_OPACITY_STEP = 0.1;
export const MANUAL_CAMERA_BOUNDARIES = 85;
export const MANUAL_CAMERA_SWITCH_TIMEOUT = 250;
export const CAMERA_SPEED = 15;

export const COLORS = Object.freeze({
  minimapBackground: () => 'black',

  player: (isCurrentPlayer: boolean) =>
    isCurrentPlayer ? 'hsl(15, 80%, 50%)' : 'hsl(250, 80%, 50%)',

  projectile: (isCurrentPlayer: boolean) =>
    isCurrentPlayer ? 'hsl(15, 80%, 75%)' : 'hsl(250, 80%, 75%)',

  mapCell: ({ type, opacity, lightness }: MapRendererCell) => {
    switch (type) {
      case TerrainType.DEEP_WATER:
        return `hsla(230, 55%, ${lightness}%, ${opacity})`;
      case TerrainType.WATER:
        return `hsla(245, 45%, ${lightness}%, ${opacity})`;
      case TerrainType.SAND:
        return `hsla(50, 15%, ${lightness}%, ${opacity})`;
      case TerrainType.GRASS:
        return `hsla(110, 50%, ${lightness}%, ${opacity})`;
      case TerrainType.LOW_MOUNTAIN:
        return `hsla(45, 35%, ${lightness}%, ${opacity})`;
      case TerrainType.HIGH_MOUNTAIN:
        return `hsla(30, 45%, ${lightness}%, ${opacity})`;
      case TerrainType.SNOW:
        return `hsla(190, 0%, ${lightness}%, ${opacity})`;
      default:
        throw new Error(`Wrong type provided to cell : ${type}`);
    }
  },

  fogOfWar: () => 'hsla(0, 0%, 0%, 0.8)'
});

export const TERRAIN_LIGHTNESS_BOUNDARIES = {
  [TerrainType.DEEP_WATER]: { min: 15, max: 30 },
  [TerrainType.WATER]: { min: 35, max: 50 },
  [TerrainType.SAND]: { min: 60, max: 75 },
  [TerrainType.GRASS]: { min: 30, max: 45 },
  [TerrainType.LOW_MOUNTAIN]: { min: 15, max: 30 },
  [TerrainType.HIGH_MOUNTAIN]: { min: 10, max: 30 },
  [TerrainType.SNOW]: { min: 85, max: 95 }
};

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
  W: 'KeyW',
  S: 'KeyS',
  A: 'KeyA',
  D: 'KeyD',
  Y: 'KeyY',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  Space: 'Space'
});
export type KeyboardControls = Values<typeof KeyboardControls>;
