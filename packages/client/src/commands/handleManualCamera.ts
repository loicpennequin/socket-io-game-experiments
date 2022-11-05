import type { Camera } from '@/factories/camera';
import { state } from '@/gameState';
import {
  MANUAL_CAMERA_BOUNDARIES,
  CameraMode,
  CAMERA_SPEED
} from '@/utils/constants';
import { MAP_SIZE } from '@game/shared-domain';
import { clamp } from '@game/shared-utils';
import { applyEdgeHandler } from './applyEdgeHandler';

export type HandleManualCameraOptions = {
  canvas: HTMLCanvasElement;
  camera: Camera;
};

export const handleManualCamera = ({
  canvas,
  camera
}: HandleManualCameraOptions) => {
  applyEdgeHandler({
    canvas,
    edgeSize: MANUAL_CAMERA_BOUNDARIES,
    cb: ({ top, bottom, left, right }) => {
      if (state.isCameraLocked) return;
      if (!top && !bottom && !left && !right) return;
      camera.setMode(CameraMode.MANUAL);

      const newPosition = {
        x: clamp(
          camera.x + (left ? CAMERA_SPEED * -1 : right ? CAMERA_SPEED : 0),
          { min: 0, max: MAP_SIZE - camera.w }
        ),
        y: clamp(
          camera.y + (top ? CAMERA_SPEED * -1 : bottom ? CAMERA_SPEED : 0),
          {
            min: 0,
            max: MAP_SIZE - camera.h
          }
        )
      };

      camera.setPosition(newPosition);
    }
  });
};
