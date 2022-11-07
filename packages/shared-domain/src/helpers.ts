import { clamp } from '@game/shared-utils';
import { CELL_SIZE, GRID_SIZE, WALKABLE_TERRAIN } from './constants';
import { EntityType, TerrainType } from './enums';
import type { EntityDto, PlayerDto, ProjectileDto } from './types';

export const isPlayerDto = (entity: EntityDto): entity is PlayerDto =>
  entity.type === EntityType.PLAYER;
export const isProjectileDto = (entity: EntityDto): entity is ProjectileDto =>
  entity.type === EntityType.PROJECTILE;

export const clampToGrid = (n: number, size: number) =>
  clamp(n, { min: size / 2, max: GRID_SIZE * CELL_SIZE - size / 2 });

export const isWalkableTerrain = (
  terrain: TerrainType
): terrain is typeof WALKABLE_TERRAIN[number] => {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    WALKABLE_TERRAIN.includes(terrain as any)
  );
};
