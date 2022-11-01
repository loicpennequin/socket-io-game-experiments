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

export const uniqBy = <T>(arr: T[], getKey: (item: T) => any): T[] => {
  const uniq: Record<string, T> = {};

  for (const item of arr) {
    const val = getKey(item);
    if (uniq[val]) continue;
    uniq[val] = item;
  }

  return Object.values(uniq);
};

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

export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number
) => {
  let timeout: NodeJS.Timeout;

  const debounced = (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced;
};

export const throttle = (fn: Function, wait: number = 300) => {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number;
  return function (this: any) {
    const context = this,
      args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};

export const isPlayerDto = (entity: EntityDto): entity is PlayerDto =>
  entity.type === ENTITY_TYPES.PLAYER;
export const isProjectileDto = (entity: EntityDto): entity is ProjectileDto =>
  entity.type === ENTITY_TYPES.PROJECTILE;
