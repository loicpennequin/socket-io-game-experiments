import { lerp } from './math';
import type { Coordinates } from './types';

export type InterPolationState<T extends Coordinates> = {
  value: T;
  timestamp: number;
};

export type InterpolateOptions = {
  tickRate: number;
  now?: number;
};

export const interpolateEntity = <T extends Coordinates = Coordinates>(
  newState: InterPolationState<T>,
  oldState: Partial<InterPolationState<T>>,
  { tickRate, now = performance.now() }: InterpolateOptions
): Coordinates => {
  const past = 1000 / tickRate;

  const targetTime = now - past;
  const oldT = oldState.timestamp;
  const newT = newState.timestamp;

  const canInterpolate =
    oldState.value && oldT && targetTime <= newT && targetTime >= oldT;

  if (canInterpolate) {
    const total = newT - oldT;
    const portion = targetTime - oldT;
    const ratio = portion / total;
    return {
      x: lerp(ratio, { min: oldState.value!.x, max: newState.value.x }),
      y: lerp(ratio, { min: oldState.value!.y, max: newState.value.y })
    };
  } else {
    return { x: newState.value.x, y: newState.value.y };
  }
};
