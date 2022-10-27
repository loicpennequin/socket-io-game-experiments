import { TICK_RATE } from '../constants';
import { lerp } from './math';
import { Coordinates } from './index';

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

  const targetTime = now - past;

  const oldT = oldState.timestamp;
  const newT = newState.timestamp;

  const canInterpolate =
    oldState.value && oldT && targetTime <= newT && targetTime >= oldT;

  if (canInterpolate) {
    const total = newT - oldT;
    const portion = targetTime - oldT;
    const ratio = portion / total;

    cb({
      ...newState.value,
      x: lerp(ratio, { min: oldState.value.x, max: newState.value.x }),
      y: lerp(ratio, { min: oldState.value.y, max: newState.value.y })
    });
  } else {
    cb(newState.value);
  }
};
