import { TICK_RATE } from './constants';

export const clamp = (
  num: number,
  { min, max }: { min: number; max: number }
) => Math.min(Math.max(num, min), max);

export type PartialBy<T, K extends keyof T = never> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];
export function objectEntries<T extends object>(t: T): Entries<T>[] {
  return Object.entries(t) as any;
}

export const indexBy = <T extends Record<string, any>>(
  arr: T[],
  key: keyof T
) => Object.fromEntries(arr.map(item => [item[key], item]));

export const lerp = (start: number, end: number, amount: number) => {
  return (1 - amount) * start + amount * end;
};

export type Coordinates = {
  x: number;
  y: number;
};

export type InterPolationState<T extends Coordinates = Coordinates> = {
  value: T;
  timestamp: number;
};
export const interpolateEntity = <T extends Coordinates = Coordinates>(
  newState: InterPolationState<T>,
  oldState: Partial<InterPolationState<T>>,
  cb: (val: T) => void
) => {
  const now = performance.now();
  const past = 1000 / TICK_RATE;

  const renderTime = now - past; // the exact time (in the past) for which we will create a position, in this case this is ~1 tick ago

  const t1 = oldState.timestamp;
  const t2 = newState.timestamp;

  const canInterpolate =
    oldState.value &&
    oldState.timestamp &&
    renderTime <= t2 &&
    renderTime >= t1;

  if (canInterpolate) {
    const total = t2 - t1;
    const portion = renderTime - t1;
    const ratio = portion / total;

    cb({
      ...newState.value,
      x: lerp(oldState.value.x, newState.value.x, ratio),
      y: lerp(oldState.value.y, newState.value.y, ratio)
    });
  } else {
    cb(newState.value);
  }
};
