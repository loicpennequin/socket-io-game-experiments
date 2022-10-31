import type { SavedState } from './gameState';
import {
  CELL_SIZE,
  MAP_HUE,
  PLAYER_FIELD_OF_VIEW,
  PLAYER_SIZE,
  interpolateEntity
} from '@game/shared';
import type { PlayerDto, GameMapCell } from '@game/shared';
import { fillCircle, pushPop } from './canvas';

type RendererCommandOptions = {
  ctx: CanvasRenderingContext2D;
  state: SavedState;
  prevState: SavedState;
};

type DrawMapOptions = RendererCommandOptions & {
  showCoordinates?: boolean;
  opacity?: number;
};

export const drawMap = ({
  ctx,
  state,
  showCoordinates = false,
  opacity = 1
}: DrawMapOptions) => {
  pushPop(ctx, () => {
    const cells = state.discoveredCells as GameMapCell[]; // typescript issue because of toRefs ? it says cell is Coordinates
    cells.forEach(cell => {
      ctx.fillStyle = `hsla(${MAP_HUE}, 45%, ${
        cell.lightness * 100
      }%, ${opacity})`;
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

export const drawnCells: Map<string, number> = new Map();

export const drawNewCells = ({ ctx, state }: RendererCommandOptions) => {
  pushPop(ctx, () => {
    state.newCells.forEach(cell => {
      const { x, y, lightness } = cell;
      const key = `${x}.${y}`;
      if (drawnCells.has(key)) {
        return;
      }
      drawnCells.set(key, (drawnCells.get(key) ?? 0) + 1);

      ctx.fillStyle = `hsla(${MAP_HUE}, 45%, ${lightness * 100}%, 0.3)`;
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
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
          ctx.fillStyle = 'hsl(15, 80%, 50%)';
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
