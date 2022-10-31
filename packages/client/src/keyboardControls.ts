import {
  PLAYER_ONGOING_ACTION_END,
  PLAYER_ONGOING_ACTION_START,
  PLAYER_ACTION,
  type Nullable,
  PLAYER_ACTIONS,
  ONGOING_ACTIONS,
  type OngoingAction
} from '@game/shared';
import { KEYBOARD_CONTROLS } from './utils/constants';
import { socket } from './socket';
import { mousePosition } from './mouseTracker';
import { gameCamera } from './gameRenderer';

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

const isOngoingAction = (x: string): x is OngoingAction =>
  ONGOING_ACTIONS.includes(x as any);

export const initKeyboardControls = () => {
  useKeydownOnce(e => {
    const action = KEYBOARD_CONTROLS[e.code as keyof typeof KEYBOARD_CONTROLS];

    if (!action) return;

    switch (action) {
      case PLAYER_ACTIONS.MOVE_UP:
      case PLAYER_ACTIONS.MOVE_DOWN:
      case PLAYER_ACTIONS.MOVE_LEFT:
      case PLAYER_ACTIONS.MOVE_RIGHT:
        return socket.emit(PLAYER_ONGOING_ACTION_START, { action });
      case PLAYER_ACTIONS.FIRE_PROJECTILE:
        return socket.emit(PLAYER_ACTION, {
          action,
          meta: {
            target: {
              x: mousePosition.x + gameCamera.x,
              y: mousePosition.y + gameCamera.y
            }
          }
        });
    }
  });

  document.addEventListener('keyup', e => {
    const action = KEYBOARD_CONTROLS[e.code as keyof typeof KEYBOARD_CONTROLS];

    if (isOngoingAction(action)) {
      socket.emit(PLAYER_ONGOING_ACTION_END, { action });
    }
  });
};
