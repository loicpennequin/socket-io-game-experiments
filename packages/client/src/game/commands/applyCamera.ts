import { socket } from '@/utils/socket';
import { pushPop } from '@/utils/canvas';
import type { Coordinates, Dimensions } from '@game/shared-utils';
import type { GameState } from '../factories/gameState';

type ApplyCameraOptions = {
  canvas: HTMLCanvasElement;
  camera: Coordinates & Dimensions;
  state: GameState;
  ctx: CanvasRenderingContext2D;
};

export const applyCamera = (
  { camera, ctx, state }: ApplyCameraOptions,
  cb: () => void
) => {
  const player = state.entitiesById[socket.id];
  if (!player) return;

  pushPop(ctx, () => {
    ctx.translate(camera.x * -1, camera.y * -1);
    cb();
  });
};
