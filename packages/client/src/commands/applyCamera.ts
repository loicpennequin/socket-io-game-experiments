import { getInterpolatedEntity, state } from '@/gameState';
import { socket } from '@/utils/socket';
import { pushPop } from '@/utils/canvas';
import { MAP_SIZE } from '@game/shared-domain';
import { clamp, type Coordinates, type Dimensions } from '@game/shared-utils';

type ApplyCameraOptions = {
  canvas: HTMLCanvasElement;
  camera: Camera;
  shouldReadjust?: boolean;
  ctx: CanvasRenderingContext2D;
};

export type Camera = Coordinates & Dimensions;

export const applyCamera = (
  { canvas, camera, ctx, shouldReadjust = true }: ApplyCameraOptions,
  cb: () => void
) => {
  const player = state.entitiesById[socket.id];
  if (!player) return;

  pushPop(ctx, () => {
    const { x, y } = getInterpolatedEntity(player.id);

    if (shouldReadjust) {
      Object.assign(camera, {
        x: clamp(x - canvas.width / 2, {
          min: 0,
          max: Math.max(MAP_SIZE - canvas.width, 0)
        }),
        y: clamp(y - canvas.height / 2, {
          min: 0,
          max: Math.max(MAP_SIZE - canvas.height, 0)
        }),
        w: canvas.width,
        h: canvas.height
      });
    }

    ctx.rect(0, 0, camera.w, camera.h);
    ctx.translate(camera.x * -1, camera.y * -1);
    cb();
  });
};
