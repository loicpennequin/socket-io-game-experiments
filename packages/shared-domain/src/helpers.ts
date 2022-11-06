import { clamp } from '@game/shared-utils';
import { CELL_SIZE, GRID_SIZE } from './constants';
import { EntityType } from './enums';
import type { EntityDto, PlayerDto, ProjectileDto } from './types';

export const isPlayerDto = (entity: EntityDto): entity is PlayerDto =>
  entity.type === EntityType.PLAYER;
export const isProjectileDto = (entity: EntityDto): entity is ProjectileDto =>
  entity.type === EntityType.PROJECTILE;

export const clampToGrid = (n: number, size: number) =>
  clamp(n, { min: size / 2, max: GRID_SIZE * CELL_SIZE - size / 2 });
