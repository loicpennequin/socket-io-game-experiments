import { prevState, state } from '@/gameState';
import { TICK_RATE } from '@game/shared-domain';
import { interpolateEntity, type Coordinates } from '@game/shared-utils';

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
      cb
    }
  );
