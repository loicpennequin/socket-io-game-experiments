import { prevState, state } from '@/gameState';
import { socket } from '@/socket';
import { pushPop } from '@/utils/canvas';
import { clamp, interpolateEntity, MAP_SIZE } from '@game/shared';

type ApplyCameraOptions = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};

export const applyCamera = (
  { canvas, ctx }: ApplyCameraOptions,
  cb: () => void
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
        const halfWidth = canvas.width / 2;
        const halfHeight = canvas.height / 2;
        const camera = {
          x: clamp(x - halfWidth, { min: 0, max: MAP_SIZE - halfWidth }),
          y: clamp(y - halfHeight, { min: 0, max: MAP_SIZE - halfHeight })
        };

        ctx.translate(camera.x * -1, camera.y * -1);

        cb();
      }
    );
  });
};
