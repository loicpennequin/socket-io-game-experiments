import { throttle, type Nullable } from '@game/shared-utils';
import {
  CameraControls,
  CameraMode,
  KeyboardControls,
  PROJECTILE_THROTTLE_RATE
} from './constants';
import { socket } from './socket';
import { mousePosition } from './mouseTracker';
import {
  OngoingAction,
  PLAYER_ACTION,
  PlayerAction,
  PLAYER_ONGOING_ACTION_START,
  PLAYER_ONGOING_ACTION_END
} from '@game/shared-domain';
import type { Camera } from '@/factories/camera';
import { state } from '@/gameState';

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

const isOngoingAction = (x: string): x is OngoingAction => x in OngoingAction;

export const initControls = (camera: Camera) => {
  const fireProjectile = throttle(() => {
    socket.emit(PLAYER_ACTION, {
      action: PlayerAction.FIRE_PROJECTILE,
      meta: {
        target: {
          x: mousePosition.x + camera.x,
          y: mousePosition.y + camera.y
        }
      }
    });
  }, PROJECTILE_THROTTLE_RATE);

  useKeydownOnce(e => {
    const action = KeyboardControls[e.code as keyof typeof KeyboardControls];

    if (!action) return;

    switch (action) {
      case PlayerAction.MOVE_UP:
      case PlayerAction.MOVE_DOWN:
      case PlayerAction.MOVE_LEFT:
      case PlayerAction.MOVE_RIGHT:
        return socket.emit(PLAYER_ONGOING_ACTION_START, { action });
    }
  });

  document.addEventListener('keydown', e => {
    const action = KeyboardControls[e.code as keyof typeof KeyboardControls];

    if (!action) return;

    switch (action) {
      case CameraControls.RESET:
        return camera.setMode(CameraMode.AUTO);
      case CameraControls.TOGGLE_LOCK:
        state.isCameraLocked = !state.isCameraLocked;
        if (state.isCameraLocked) {
          camera.setMode(CameraMode.AUTO);
        }
    }
  });

  document.addEventListener('keyup', e => {
    const action = KeyboardControls[e.code as keyof typeof KeyboardControls];

    if (isOngoingAction(action)) {
      socket.emit(PLAYER_ONGOING_ACTION_END, { action });
    }
  });

  document.addEventListener('click', fireProjectile);
};
