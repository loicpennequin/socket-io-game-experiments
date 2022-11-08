import { throttle, type Coordinates } from '@game/shared-utils';
import {
  CameraMode,
  KeyboardControls,
  MouseButton,
  PROJECTILE_THROTTLE_RATE
} from './constants';
import { socket } from './socket';
import {
  PLAYER_ACTION,
  PlayerAction,
  type Directions
} from '@game/shared-domain';
import type { Camera } from '@/factories/camera';
import { state } from '@/stores/gameState';
import { useKeydownOnce } from './helpers';

export const initControls = (
  canvas: HTMLCanvasElement,
  camera: Camera,
  mousePosition: Coordinates
) => {
  const directions: Directions = {
    up: false,
    down: false,
    left: false,
    right: false
  };

  useKeydownOnce(e => {
    if (
      ![
        KeyboardControls.W,
        KeyboardControls.A,
        KeyboardControls.S,
        KeyboardControls.D
      ].includes(e.code as any)
    ) {
      return;
    }

    switch (e.code as KeyboardControls) {
      case KeyboardControls.W:
        directions.up = true;
        break;

      case KeyboardControls.A:
        directions.left = true;
        break;

      case KeyboardControls.S:
        directions.down = true;
        break;

      case KeyboardControls.D:
        directions.right = true;
        break;
    }

    return socket.emit(PLAYER_ACTION, {
      type: PlayerAction.MOVE,
      meta: { directions }
    });
  });

  document.addEventListener('keyup', e => {
    if (
      ![
        KeyboardControls.W,
        KeyboardControls.A,
        KeyboardControls.S,
        KeyboardControls.D
      ].includes(e.code as any)
    ) {
      return;
    }

    switch (e.code as KeyboardControls) {
      case KeyboardControls.W:
        directions.up = false;
        break;

      case KeyboardControls.A:
        directions.left = false;
        break;

      case KeyboardControls.S:
        directions.down = false;
        break;

      case KeyboardControls.D:
        directions.right = false;
        break;
    }

    return socket.emit(PLAYER_ACTION, {
      type: PlayerAction.MOVE,
      meta: { directions }
    });
  });

  document.addEventListener('keydown', e => {
    switch (e.code as KeyboardControls) {
      case KeyboardControls.Space:
        return camera.setMode(CameraMode.AUTO);
      case KeyboardControls.Y:
        state.isCameraLocked = !state.isCameraLocked;
        if (state.isCameraLocked) {
          camera.setMode(CameraMode.AUTO);
        }
    }
  });

  canvas.addEventListener(
    'click',
    throttle(() => {
      socket.emit(PLAYER_ACTION, {
        type: PlayerAction.FIRE_PROJECTILE,
        meta: {
          target: {
            x: mousePosition.x + camera.x,
            y: mousePosition.y + camera.y
          }
        }
      });
    }, PROJECTILE_THROTTLE_RATE)
  );

  const broadcastMousePosition = () => {
    socket.emit(PLAYER_ACTION, {
      type: PlayerAction.MOVE_TO,
      meta: {
        target: {
          x: mousePosition.x + camera.x,
          y: mousePosition.y + camera.y
        }
      }
    });
  };
  canvas.addEventListener('mousedown', e => {
    if (e.button === MouseButton.RIGHT) {
      canvas.addEventListener('mousemove', broadcastMousePosition);
    }
  });

  canvas.addEventListener('mouseup', e => {
    if (e.button === MouseButton.RIGHT) {
      canvas.removeEventListener('mousemove', broadcastMousePosition);
    }
  });

  canvas.addEventListener('contextmenu', broadcastMousePosition);
};
