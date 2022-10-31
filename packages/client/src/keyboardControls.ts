import {
  PLAYER_ACTION_END,
  PLAYER_ACTION_START,
  type Nullable
} from '@game/shared';
import { KEYBOARD_CONTROLS } from './constants';
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
    socket.emit(PLAYER_ACTION_START, { action });
  });

  document.addEventListener('keyup', e => {
    const action = KEYBOARD_CONTROLS[e.code as keyof typeof KEYBOARD_CONTROLS];
    if (!action) return;
    socket.emit(PLAYER_ACTION_END, { action });
  });
};
