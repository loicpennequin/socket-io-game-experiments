import type { Values } from '@game/shared-utils';

export const CameraControls = {
  MOVE_UP: 'MOVE_CAMERA_UP',
  MOVE_DOWN: 'MOVE_CAMERA_DOWN',
  MOVE_LEFT: 'MOVE_CAMERA_LEFT',
  MOVE_RIGHT: 'MOVE_CAMERA_RIGHT',
  RESET: 'RESET',
  TOGGLE_LOCK: 'TOGGLE_LOCK'
};
export type CameraControls = Values<typeof CameraControls>;

export const CameraMode = {
  AUTO: 'AUTO',
  MANUAL: 'MANUAL'
};
export type CameraMode = Values<typeof CameraMode>;

export const MapRenderMode = {
  SIMPLE: 'SIMPLE',
  DETAILED: 'DETAILED'
};
export type MapRenderMode = Values<typeof MapRenderMode>;

export const KeyboardControls = Object.freeze({
  W: 'KeyW',
  S: 'KeyS',
  A: 'KeyA',
  D: 'KeyD',
  Y: 'KeyY',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  Space: 'Space'
});
export type KeyboardControls = Values<typeof KeyboardControls>;

export const MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
};
export type MouseButton = Values<typeof MouseButton>;
