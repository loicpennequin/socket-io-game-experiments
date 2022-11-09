import {
  CELL_SIZE,
  MAP_SIZE,
  PlayerJob,
  TerrainType
} from '@game/shared-domain';
import type { StateMapCell } from '@/stores/gameState';

export const ONE_FRAME = 1000 / 60;
export const PROJECTILE_THROTTLE_RATE = 10;
export const MINIMAP_SIZE = 200;
export const MINIMAP_SCALE = MINIMAP_SIZE / MAP_SIZE;
export const MINIMAP_ENTITY_SCALE = 3;
export const FOG_OF_WAR_BLUR = CELL_SIZE * 4;
export const MAP_CELL_OPACITY_STEP = 0.1;
export const MANUAL_CAMERA_BOUNDARIES = 85;
export const MANUAL_CAMERA_SWITCH_TIMEOUT = 250;
export const CAMERA_SPEED = 15;
export const ENTITY_STAT_BAR_HEIGHT = 8;
export const ENTITY_STAT_BAR_OFFSET = 10;

export const COLORS = Object.freeze({
  minimapBackground: () => 'black',

  player: (isCurrentPlayer: boolean) =>
    isCurrentPlayer ? 'hsl(15, 80%, 50%)' : 'hsl(250, 80%, 50%)',

  projectile: (isCurrentPlayer: boolean) =>
    isCurrentPlayer ? 'hsl(250, 100%, 60%)' : 'hsl(10, 100%, 60%)',

  mapCell: ({ type, opacity, lightness }: StateMapCell) => {
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

  fogOfWar: () => 'hsla(0, 0%, 0%, 0.7)',

  hpBar: () => 'rgb(0,255,0)',
  hpBarBg: () => 'red',

  mpBar: () => 'rgb(0,0,255)',
  mpBarBg: () => 'rgba(0,0,0,0)'
});

export const DEFAULT_TERRAIN_LIGHTNESS = {
  [TerrainType.DEEP_WATER]: 15,
  [TerrainType.WATER]: 40,
  [TerrainType.SAND]: 75,
  [TerrainType.GRASS]: 40,
  [TerrainType.LOW_MOUNTAIN]: 25,
  [TerrainType.HIGH_MOUNTAIN]: 10,
  [TerrainType.SNOW]: 95
} as const;

export const TERRAIN_LIGHTNESS_BOUNDARIES = {
  [TerrainType.DEEP_WATER]: { min: 15, max: 30 },
  [TerrainType.WATER]: { min: 35, max: 50 },
  [TerrainType.SAND]: { min: 60, max: 75 },
  [TerrainType.GRASS]: { min: 25, max: 45 },
  [TerrainType.LOW_MOUNTAIN]: { min: 15, max: 30 },
  [TerrainType.HIGH_MOUNTAIN]: { min: 10, max: 30 },
  [TerrainType.SNOW]: { min: 85, max: 95 }
} as const;

export const SPRITE_LOCATIONS: Record<string, [number, number, number]> = {
  [PlayerJob.RANGER]: [2, 0, 1],
  [PlayerJob.ROGUE]: [3, 0, 1],
  [PlayerJob.WIZARD]: [7, 0, 1],
  [PlayerJob.BARBARIAN]: [10, 0, 1]
};
