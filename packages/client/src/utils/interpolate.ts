import { prevState, state } from '@/gameState';
import { TICK_RATE } from '@game/shared-domain';
import { interpolateEntity, type Coordinates } from '@game/shared-utils';

let globalInterpolationTimestamp = performance.now();

export const setGlobalInterpolationTimestamp = (now = performance.now()) => {
  globalInterpolationTimestamp = now;
};

export const interpolate = <T extends Coordinates>(
  newVal: T,
  oldVal: T,
  cb: (val: T) => void
) =>
  interpolateEntity(
    { value: newVal, timestamp: state.timestamp },
    { value: oldVal, timestamp: prevState.timestamp },
    {
      tickRate: TICK_RATE,
      cb,
      now: globalInterpolationTimestamp
    }
  );
