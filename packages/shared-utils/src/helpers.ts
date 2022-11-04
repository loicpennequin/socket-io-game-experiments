import type { Dimensions, Coordinates, Matrix } from './types';

export const indexBy = <T extends Record<string, any>>(
  arr: T[],
  key: keyof T
) =>
  Object.fromEntries(arr.map(item => [item[key], item])) as Record<string, T>;

export const uniqBy = <T>(arr: T[], getKey: (item: T) => string): T[] => {
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

// eslint-disable-next-line @typescript-eslint/ban-types
export const throttle = (fn: Function, wait = 300) => {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number;
  return function (this: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-this-alias
    const context = this,
      // eslint-disable-next-line prefer-rest-params
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

export const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T) =>
    fns.reduce((acc, fn) => fn(acc), value);

export const pipeBuilder = <A, B>(fn: (a: A) => B) => {
  return {
    f: <C>(g: (x: B) => C) => pipeBuilder((arg: A) => g(fn(arg))),
    build: (a: A) => fn(a)
  };
};

export const noop = () => void 0;

export const memoize = <TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn
) => {
  const cache = new Map<string, TReturn>();

  return (...args: TArgs) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key) as TReturn;

    const val = fn(...args);
    cache.set(key, val);

    return val;
  };
};
