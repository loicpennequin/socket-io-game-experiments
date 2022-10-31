import { ENTITY_TYPES } from './constants';
import {
  Entries,
  Dimensions,
  Coordinates,
  Matrix,
  EntityDto,
  PlayerDto,
  ProjectileDto
} from './types';

export function objectEntries<T extends object>(t: T): Entries<T>[] {
  return Object.entries(t) as any;
}

export const indexBy = <T extends Record<string, any>>(
  arr: T[],
  key: keyof T
) => Object.fromEntries(arr.map(item => [item[key], item]));

export const createMatrix = <T>(
  dimensions: Dimensions,
  initialValue: (coords: Coordinates) => T
): Matrix<T> =>
  Array.from({ length: dimensions.w })
    .fill(undefined)
    .map((_, x) =>
      Array.from({ length: dimensions.h })
        .fill(undefined)
        .map((_, y) => initialValue({ x, y }))
    );

export const isPlayerDto = (entity: EntityDto): entity is PlayerDto =>
  entity.type === ENTITY_TYPES.PLAYER;
export const isProjectileDto = (entity: EntityDto): entity is ProjectileDto =>
  entity.type === ENTITY_TYPES.PROJECTILE;
