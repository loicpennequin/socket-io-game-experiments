import {
  addVector,
  clampVector,
  pointRectCollision,
  throttle,
  type Coordinates,
  type Nullable
} from '@game/shared-utils';
import {
  CAMERA_SPEED,
  MANUAL_CAMERA_EDGE_SIZE,
  PROJECTILE_THROTTLE_RATE
} from '../../utils/constants';
import { socket } from '../../utils/socket';
import {
  PLAYER_ACTION,
  PlayerAction,
  type Directions,
  MAP_SIZE
} from '@game/shared-domain';
import type { Camera } from '@/game/factories/camera';
import { useKeydownOnce } from '../../utils/helpers';
import Hammer from 'hammerjs';
import { KeyboardControls, MouseButton, CameraMode } from '../../utils/enums';

const directions: Directions = {
  up: false,
  down: false,
  left: false,
  right: false
};

const createKeyboardMovement = () => {
  const keyMap: Record<string, keyof typeof directions> = {
    [KeyboardControls.W]: 'up',
    [KeyboardControls.S]: 'down',
    [KeyboardControls.A]: 'left',
    [KeyboardControls.D]: 'right'
  };

  const isMovement = (code: string) => Object.keys(keyMap).includes(code);

  useKeydownOnce(e => {
    if (!isMovement(e.code)) {
      return;
    }
    directions[keyMap[e.code]] = true;

    return socket.emit(PLAYER_ACTION, {
      type: PlayerAction.MOVE,
      meta: { directions }
    });
  });

  document.addEventListener('keyup', e => {
    if (!isMovement(e.code)) {
      return;
    }
    directions[keyMap[e.code]] = false;

    return socket.emit(PLAYER_ACTION, {
      type: PlayerAction.MOVE,
      meta: { directions }
    });
  });
};

const createMouseControls = (
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

  const emitPosition = () => {
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

  const stop = (e: MouseEvent) => {
    if (e.button === MouseButton.RIGHT) {
      canvas.removeEventListener('mousemove', emitPosition);
      canvas.removeEventListener('mouseup', stop);
    }
  };

  canvas.addEventListener('mousedown', e => {
    if (e.button === MouseButton.RIGHT) {
      canvas.addEventListener('mousemove', emitPosition);
      canvas.addEventListener('mouseup', stop);
    }
  });

  canvas.addEventListener('contextmenu', emitPosition);
};

const createTouchControls = (canvas: HTMLCanvasElement, camera: Camera) => {
  const hammer = new Hammer(canvas, {});
  hammer.on(
    'tap',
    throttle((e: HammerInput) => {
      if (!('ontouchstart' in window)) return;
      socket.emit(PLAYER_ACTION, {
        type: PlayerAction.FIRE_PROJECTILE,
        meta: {
          target: {
            x: e.center.x + camera.x,
            y: e.center.y + camera.y
          }
        }
      });
    }, PROJECTILE_THROTTLE_RATE)
  );

  canvas.addEventListener(
    'touchstart',
    e => {
      e.preventDefault();

      if (e.touches.length > 1) return;
      const start = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      };

      const emitMovement = throttle((e: TouchEvent) => {
        const { clientX, clientY } = e.targetTouches[0];
        directions.up = clientY < start.y;
        directions.down = clientY > start.y;
        directions.left = clientX < start.x;
        directions.right = clientX > start.x;

        return socket.emit(PLAYER_ACTION, {
          type: PlayerAction.MOVE,
          meta: { directions }
        });
      }, 100);

      const stop = () => {
        canvas.removeEventListener('touchmove', emitMovement);
        Object.assign(directions, {
          up: false,
          down: false,
          left: false,
          right: false
        });
        socket.emit(PLAYER_ACTION, {
          type: PlayerAction.MOVE,
          meta: { directions }
        });
        canvas.removeEventListener('touchend', stop);
      };
      setTimeout(() => {
        canvas.addEventListener('touchmove', emitMovement);
      });
      canvas.addEventListener('touchend', stop, { capture: true });
    },
    false
  );
};

const createCameraControls = (
  canvas: HTMLCanvasElement,
  camera: Camera,
  mousePosition: Coordinates
) => {
  let manualCameraRafId: Nullable<number> = null;
  const manualCameraDirection = {
    up: false,
    down: false,
    left: false,
    right: false
  };

  const updateDirections = () => {
    manualCameraDirection.up = pointRectCollision(mousePosition, {
      x: 0,
      y: 0,
      w: canvas.width,
      h: MANUAL_CAMERA_EDGE_SIZE
    });
    manualCameraDirection.down = pointRectCollision(mousePosition, {
      x: 0,
      y: canvas.height - MANUAL_CAMERA_EDGE_SIZE,
      w: canvas.width,
      h: canvas.height
    });
    manualCameraDirection.left = pointRectCollision(mousePosition, {
      x: 0,
      y: 0,
      w: MANUAL_CAMERA_EDGE_SIZE,
      h: canvas.height
    });
    manualCameraDirection.right = pointRectCollision(mousePosition, {
      x: canvas.width - MANUAL_CAMERA_EDGE_SIZE,
      y: 0,
      w: canvas.width,
      h: canvas.height
    });
    if (Object.values(manualCameraDirection).some(Boolean)) {
      if (!manualCameraRafId) {
        manualCameraRafId = requestAnimationFrame(setManualCameraPosition);
      }
    } else {
      stopManualCamera();
    }
  };

  const stopManualCamera = () => {
    if (manualCameraRafId) {
      cancelAnimationFrame(manualCameraRafId);
      manualCameraRafId = null;
    }
  };

  document.addEventListener('keydown', e => {
    switch (e.code as KeyboardControls) {
      case KeyboardControls.Space:
        stopManualCamera();
        return camera.setMode(CameraMode.AUTO);
      case KeyboardControls.Y:
        stopManualCamera();
        camera.toggleMode();
        if (camera.mode === CameraMode.MANUAL) {
          console.log('add listener');
          canvas.addEventListener('mousemove', updateDirections);
        } else {
          canvas.removeEventListener('mousemove', updateDirections);
        }
    }
  });

  const setManualCameraPosition = () => {
    if (!manualCameraRafId) return;
    const diff = { x: 0, y: 0 };
    if (manualCameraDirection.up) diff.y -= CAMERA_SPEED;
    if (manualCameraDirection.down) diff.y += CAMERA_SPEED;
    if (manualCameraDirection.left) diff.x -= CAMERA_SPEED;
    if (manualCameraDirection.right) diff.x += CAMERA_SPEED;

    camera.setPosition(
      clampVector(addVector({ x: camera.x, y: camera.y }, diff), {
        min: { x: 0, y: 0 },
        max: { x: MAP_SIZE - camera.w, y: MAP_SIZE - camera.h }
      })
    );
    manualCameraRafId = requestAnimationFrame(setManualCameraPosition);
  };
};

type InitControlsOptions = {
  canvas: HTMLCanvasElement;
  camera: Camera;
  mousePosition: Coordinates;
};

export const createControls = ({
  canvas,
  camera,
  mousePosition
}: InitControlsOptions) => {
  createKeyboardMovement();
  createMouseControls(canvas, camera, mousePosition);
  createTouchControls(canvas, camera);
  createCameraControls(canvas, camera, mousePosition);
};
