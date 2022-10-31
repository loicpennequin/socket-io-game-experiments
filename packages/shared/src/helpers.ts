import { Entries, Dimensions, Coordinates, Matrix } from './types';

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
  new Array(dimensions.w).map((_, x) =>
    new Array(dimensions.h).map((_, y) => initialValue({ x, y }))
  );