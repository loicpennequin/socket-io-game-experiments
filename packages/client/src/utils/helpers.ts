import { OngoingAction } from '@game/shared-domain';
import type { Nullable } from '@game/shared-utils';

export const useKeydownOnce = (cb: (e: KeyboardEvent) => void) => {
  let hasFired = false;
  let code: Nullable<string>;

  document.addEventListener('keydown', e => {
    if (hasFired && e.code === code) return;
    hasFired = true;
    code = e.code;

    cb(e);
  });

  document.addEventListener('keyup', e => {
    if (e.code === code) {
      code = undefined;
      hasFired = false;
    }
  });
};

export const isOngoingAction = (x: string): x is OngoingAction =>
  x in OngoingAction;
