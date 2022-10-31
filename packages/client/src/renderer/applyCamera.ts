import { prevState, state } from '@/gameState';
import { socket } from '@/socket';
import { pushPop } from '@/utils/canvas';
import {
  clamp,
  interpolateEntity,
  MAP_SIZE,
  type Boundaries,
  type Coordinates,
  type Dimensions
} from '@game/shared';

type ApplyCameraOptions = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};

type Camera = Coordinates & Dimensions;

export const applyCamera = (
  { canvas, ctx }: ApplyCameraOptions,
  cb: (camera: Camera) => void
) => {
  const player = state.playersById[socket.id];
  if (!player) return;

  pushPop(ctx, () => {
    interpolateEntity<typeof player>(
      { value: player, timestamp: state.timestamp },
      {
        value: prevState.playersById[player.id],
        timestamp: prevState.timestamp
      },

      ({ x, y }) => {
        const camera = {
          x: clamp(x - canvas.width / 2, {
            min: 0,
            max: MAP_SIZE - canvas.width
          }),
          y: clamp(y - canvas.height / 2, {
            min: 0,
            max: MAP_SIZE - canvas.height
          }),
          w: canvas.width,
          h: canvas.height
        };

        ctx.translate(camera.x * -1, camera.y * -1);
        cb(camera);
      }
    );
  });
};
