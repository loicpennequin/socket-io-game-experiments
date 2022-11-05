import { getInterpolatedEntity } from '@/gameState';
import { MAP_SIZE } from '@game/shared-domain';
import { clamp, type Coordinates, type Dimensions } from '@game/shared-utils';

export type CreateCameraOptions = Coordinates & Dimensions;

export const createCamera = ({ x, y, w, h }: CreateCameraOptions) => {
  const offset: Coordinates = { x: 0, y: 0 };

  const position = { x, y, w, h };
  let canvas: HTMLCanvasElement;

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

    setCanvas(can: HTMLCanvasElement) {
      canvas = can;
    },

    setOffset(diff: Coordinates) {
      offset.x += diff.x;
      offset.y += diff.y;
    },

    resetOffset() {
      offset.x = 0;
      offset.y = 0;
    },

    update(target: string) {
      const entity = getInterpolatedEntity(target);
      if (!entity) return;

      Object.assign(position, {
        x: clamp(entity.x + offset.x - canvas.width / 2, {
          min: 0,
          max: Math.max(MAP_SIZE - canvas.width, 0)
        }),
        y: clamp(entity.y + offset.y - canvas.height / 2, {
          min: 0,
          max: Math.max(MAP_SIZE - canvas.height, 0)
        }),
        w: canvas.width,
        h: canvas.height
      });
    }
  };
};
