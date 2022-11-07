export type Nullable<T> = T | null | undefined;
export type PartialBy<T, K extends keyof T = never> = Omit<T, K> &
  Partial<Pick<T, K>>;
export type Coordinates = { x: number; y: number };
export type Dimensions = { w: number; h: number };
export type SpatialObject = { dimensions: Dimensions; position: Coordinates };
export type Boundaries<T = number> = { min: T; max: T };
export type Range = Boundaries<number>;
export type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];
export type Matrix<T> = T[][];
export type AnyObject = { [key: string]: any };
export type AnyFunction = (...args: any[]) => any;
export type Values<T> = T[keyof T];
export type Override<A, B> = Omit<A, keyof B> & B;
// eslint-disable-next-line @typescript-eslint/ban-types
export type Constructor<T = {}> = new (...args: any[]) => T;

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyConstructor = new (...args: any[]) => {};
export type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>;
