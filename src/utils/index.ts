export type Nullable<T> = T | null | undefined;
export type PartialBy<T, K extends keyof T = never> = Omit<T, K> &
  Partial<Pick<T, K>>;
export type Coordinates = { x: number; y: number };
export type Dimensions = { w: number; h: number };
export type SpatialObject = { dimensions: Dimensions; position: Coordinates };
export type Boundaries<T = number> = { min: T; max: T };
export type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];

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
): T[][] =>
  Array.from<T[]>({
    length: dimensions.w
  })
    .fill(undefined)
    .map((_, x) =>
      Array.from<T>({ length: dimensions.h })
        .fill(undefined)
        .map((_, y) => initialValue({ x, y }))
    );
