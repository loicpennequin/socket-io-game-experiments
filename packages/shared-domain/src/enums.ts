import type { Values } from '@game/shared-utils';

export const PlayerAction = {
  MOVE: 'MOVE',
  FIRE_PROJECTILE: 'FIRE_PROJECTILE'
} as const;
export type PlayerAction = Values<typeof PlayerAction>;

export const EntityType = {
  PLAYER: 'PLAYER',
  PROJECTILE: 'PROJECTILE'
} as const;
export type EntityType = Values<typeof EntityType>;

export const EntityOrientation = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
} as const;
export type EntityOrientation = Values<typeof EntityOrientation>;

export const PlayerJob = {
  RANGER: 'RANGER',
  ROGUE: 'ROGUE',
  WIZARD: 'WIZARD',
  BARBARIAN: 'BARBARIAN'
} as const;
export type PlayerJob = Values<typeof PlayerJob>;

export const TerrainType = {
  DEEP_WATER: 'DEEP_WATER',
  WATER: 'WATER',
  SAND: 'SAND',
  GRASS: 'GRASS',
  LOW_MOUNTAIN: 'MOUNTAIN',
  HIGH_MOUNTAIN: 'HIGH_MOUNTAIN',
  SNOW: 'SNOW'
} as const;
export type TerrainType = Values<typeof TerrainType>;
