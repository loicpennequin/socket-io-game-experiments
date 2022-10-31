import { pushPop } from '@/utils/canvas';
import { prevState, state } from '@/gameState';
import {
  interpolateEntity,
  type PlayerDto,
  PLAYER_FIELD_OF_VIEW
} from '@game/shared';

type ApplyFieldOfViewOptions = {
  ctx: CanvasRenderingContext2D;
  entityId: string;
};

export const applyFieldOfView = (
  { ctx, entityId }: ApplyFieldOfViewOptions,
  cb: () => void
) => {
  const player = state.playersById[entityId];
  if (!player) return;

  pushPop(ctx, () => {
    interpolateEntity<PlayerDto>(
      { value: player, timestamp: state.timestamp },
      // prettier-ignore
      { value: prevState.playersById[player.id],timestamp: prevState.timestamp },
      entity => {
        ctx.beginPath();
        ctx.arc(
          entity.x,
          entity.y,
          PLAYER_FIELD_OF_VIEW,
          PLAYER_FIELD_OF_VIEW,
          Math.PI * 2,
          true
        );
        ctx.clip();
      }
    );

    cb();
  });
};
