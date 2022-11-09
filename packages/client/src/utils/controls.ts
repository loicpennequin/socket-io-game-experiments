import {
  addVector,
  clampVector,
  pointRectCollision,
  throttle,
  type Coordinates,
  type Nullable
} from '@game/shared-utils';
import {
  CameraMode,
  CAMERA_SPEED,
  KeyboardControls,
  MANUAL_CAMERA_BOUNDARIES,
  MouseButton,
  PROJECTILE_THROTTLE_RATE
} from './constants';
import { socket } from './socket';
import {
  PLAYER_ACTION,
  PlayerAction,
  type Directions,
  MAP_SIZE
} from '@game/shared-domain';
import type { Camera } from '@/factories/camera';
import { state } from '@/stores/gameState';
import { useKeydownOnce } from './helpers';

const initKeyboardMovement = () => {
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
};

const initMouseMovement = (
  canvas: HTMLCanvasElement,
  camera: Camera,
  mousePosition: Coordinates
) => {
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

const initCameraControls = (
  canvas: HTMLCanvasElement,
  camera: Camera,
  mousePosition: Coordinates
) => {
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

  let manualCameraRafId: Nullable<ReturnType<typeof requestAnimationFrame>> =
    null;
  let manualCameraDiff = { x: 0, y: 0 };
  const setManualCameraPosition = () => {
    camera.setPosition(
      clampVector(addVector(camera, manualCameraDiff), {
        min: { x: 0, y: 0 },
        max: { x: MAP_SIZE - camera.w, y: MAP_SIZE - camera.h }
      })
    );
    requestAnimationFrame(setManualCameraPosition);
  };
  canvas.addEventListener('mousemove', () => {
    if (state.isCameraLocked) return;

    const edges = {
      top: { x: 0, y: 0, w: canvas.width, h: MANUAL_CAMERA_BOUNDARIES },
      // prettier-ignore
      bottom: { x: 0, y: canvas.height - MANUAL_CAMERA_BOUNDARIES, w: canvas.width, h: canvas.height},
      left: { x: 0, y: 0, w: MANUAL_CAMERA_BOUNDARIES, h: canvas.height },
      // prettier-ignore
      right: { x: canvas.width - MANUAL_CAMERA_BOUNDARIES, y: 0, w: canvas.width, h: canvas.height}
    };
    manualCameraDiff = { x: 0, y: 0 };
    if (pointRectCollision(mousePosition, edges.top)) {
      manualCameraDiff.y -= CAMERA_SPEED;
    }
    if (pointRectCollision(mousePosition, edges.bottom)) {
      manualCameraDiff.y += CAMERA_SPEED;
    }
    if (pointRectCollision(mousePosition, edges.left)) {
      manualCameraDiff.x -= CAMERA_SPEED;
    }
    if (pointRectCollision(mousePosition, edges.right)) {
      manualCameraDiff.x += CAMERA_SPEED;
    }

    if (!manualCameraDiff.x && !manualCameraDiff.y) {
      manualCameraRafId && cancelAnimationFrame(manualCameraRafId);
      manualCameraRafId = null;
      return;
    }

    if (!manualCameraRafId) {
      camera.setMode(CameraMode.MANUAL);
      manualCameraRafId = requestAnimationFrame(setManualCameraPosition);
    }
  });
};

export const initControls = (
  canvas: HTMLCanvasElement,
  camera: Camera,
  mousePosition: Coordinates
) => {
  initKeyboardMovement();
  initMouseMovement(canvas, camera, mousePosition);
  initCameraControls(canvas, camera, mousePosition);
};
