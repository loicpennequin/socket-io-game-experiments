import type { GameState } from '@/stores/gameState';
import { CameraMode } from '@/utils/enums';
import { MAP_SIZE } from '@game/shared-domain';
import { clamp, type Coordinates, type Dimensions } from '@game/shared-utils';

export type CreateCameraOptions = Coordinates &
  Dimensions & { state: GameState };

export const createCamera = ({ x, y, w, h, state }: CreateCameraOptions) => {
  const position = { x, y, w, h };
  let canvas: HTMLCanvasElement;
  let target: string;
  let mode: CameraMode = CameraMode.AUTO;

  return {
    get x() {
      return position.x;
    },
    get y() {
      return position.y;
    },
    get w() {
      return position.w;
    },
    get h() {
      return position.h;
    },
    get mode() {
      return mode;
    },
    setMode(newMode: CameraMode) {
      mode = newMode;
    },

    setCanvas(can: HTMLCanvasElement) {
      canvas = can;
    },

    setTarget(t: string) {
      target = t;
    },

    setPosition(coords: Coordinates) {
      Object.assign(position, coords);
    },

    update() {
      const entity = state.interpolatedEntities[target];
      if (!entity) return;

      if (mode === CameraMode.MANUAL) return;

      Object.assign(position, {
        x: clamp(entity.x - canvas.width / 2, {
          min: 0,
          max: Math.max(MAP_SIZE - canvas.width, 0)
        }),
        y: clamp(entity.y - canvas.height / 2, {
          min: 0,
          max: Math.max(MAP_SIZE - canvas.height, 0)
        }),
        w: canvas.width,
        h: canvas.height
      });
    }
  };
};

export type Camera = ReturnType<typeof createCamera>;
