import type { SavedState } from './gameState';
import {
  CELL_SIZE,
  PLAYER_FIELD_OF_VIEW,
  PLAYER_SIZE,
  interpolateEntity
} from '@game/shared';
import type { PlayerDto, GameMapCell } from '@game/shared';
import { fillCircle, pushPop } from './canvas';
import { COLORS } from './constants';
import { socket } from './socket';

type RendererCommandOptions = {
  ctx: CanvasRenderingContext2D;
  state: SavedState;
  prevState: SavedState;
};

type DrawMapOptions = RendererCommandOptions & {
  showCoordinates?: boolean;
  isBackground?: boolean;
};

export const drawMap = ({
  ctx,
  state,
  showCoordinates = false,
  isBackground = false
}: DrawMapOptions) => {
  pushPop(ctx, () => {
    const cells = state.discoveredCells as GameMapCell[]; // typescript issue because of toRefs ? it says cell is Coordinates
    cells.forEach(cell => {
      ctx.fillStyle = COLORS.mapCell(cell.lightness * 100, isBackground);
      ctx.fillRect(
        cell.x * CELL_SIZE,
        cell.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );

      if (!showCoordinates) return;
      ctx.font = '12px Helvetica';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgb(255,255,255,0.5)';
      ctx.fillText(
        `${cell.x}.${cell.y}`,
        cell.x * CELL_SIZE + CELL_SIZE / 2,
        cell.y * CELL_SIZE + CELL_SIZE / 2
      );
    });
  });
};

type DrawPlayersOptions = RendererCommandOptions;
export const drawPlayers = ({ ctx, state, prevState }: DrawPlayersOptions) => {
  pushPop(ctx, () => {
    state.players.forEach(player => {
      interpolateEntity<typeof player>(
        { value: player, timestamp: state.timestamp },
        {
          value: prevState.playersById[player.id],
          timestamp: prevState.timestamp
        },

        entity => {
          ctx.lineWidth = 0;
          ctx.fillStyle = COLORS.player(player.id === socket.id);
          fillCircle(ctx, {
            x: entity.x,
            y: entity.y,
            radius: PLAYER_SIZE / 2
          });
        }
      );
    });
  });
};

type ApplyFogOfWartOptions = RendererCommandOptions & {
  playerId: string;
};

export const applyFogOfWar = (
  { ctx, state, prevState, playerId }: ApplyFogOfWartOptions,
  cb: () => void
) => {
  const player = state.playersById[playerId];
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

export type RunRendererOptions = {
  immediate?: boolean;
};
export const runRenderer = (
  fn: () => void,
  { immediate }: RunRendererOptions = {}
) => {
  let isActive = false;
  let rafId: null | number = null;

  const loop = () => {
    if (!isActive) return;

    fn();
    rafId = window.requestAnimationFrame(loop);
  };

  const resume = () => {
    if (!isActive) {
      isActive = true;
      loop();
    }
  };

  const pause = () => {
    isActive = false;
    if (rafId != null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  if (immediate) resume();

  return {
    isActive,
    pause,
    resume
  };
};
