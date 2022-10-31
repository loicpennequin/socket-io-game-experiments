import {
  PLAYER_ONGOING_ACTION_END,
  PLAYER_ONGOING_ACTION_START,
  PLAYER_ACTION,
  type Nullable
} from '@game/shared';
import { KEYBOARD_CONTROLS } from './utils/constants';
import { socket } from './socket';

const useKeydownOnce = (cb: (e: KeyboardEvent) => void) => {
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

export const initKeyboardControls = () => {
  useKeydownOnce(e => {
    const action = KEYBOARD_CONTROLS[e.code as keyof typeof KEYBOARD_CONTROLS];
    if (!action) return;
    const eventName = action.isOngoing
      ? PLAYER_ONGOING_ACTION_START
      : PLAYER_ACTION;

    socket.emit(eventName, { action: action.type });
  });

  document.addEventListener('keyup', e => {
    const action = KEYBOARD_CONTROLS[e.code as keyof typeof KEYBOARD_CONTROLS];
    if (!action || !action.isOngoing) return;

    socket.emit(PLAYER_ONGOING_ACTION_END, { action: action.type });
  });
};
