import { SavedState } from '../composables/useGameState';
import {
  CELL_SIZE,
  MAP_HUE,
  PLAYER_FIELD_OF_VIEW,
  PLAYER_SIZE
} from '../constants';
import { PlayerDto } from '../modules/socket-io/server/io';
import { GameMapCell } from '../server/controllers/gameController';
import { fillCircle, pushPop } from './canvasUtils';
import { interpolateEntity } from './entityInterpolation';

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
