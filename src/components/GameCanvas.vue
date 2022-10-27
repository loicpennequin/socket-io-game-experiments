<script setup lang="ts">
import type { GameMapCell } from '../server/controllers/gameController';
import {
  GRID_SIZE,
  CELL_SIZE,
  PLAYER_SIZE,
  PLAYER_FIELD_OF_VIEW,
  MAP_HUE
} from '~/constants';
import { pushPop, fillCircle } from '~/utils/canvasUtils';
import { interpolateEntity } from '~~/src/utils/entityInterpolation';

const canvasEl = ref<HTMLCanvasElement>();
const [state, prevState] = useGameState();
const { playerCount, players } = state;
const socket = useSocket();

const { getContext } = useCanvasProvider(canvasEl);

const canvasSize = GRID_SIZE * CELL_SIZE;

const fps = ref(0);
let lastTick = 0;
const updateFps = () => {
  if (lastTick) {
    const delta = (performance.now() - lastTick) / 1000;
    fps.value = Math.round(1 / delta);
  }
  lastTick = performance.now();
};

const drawMap = ({
  opacity,
  showCoordinates = false
}: {
  opacity: number;
  showCoordinates?: boolean;
}) => {
  const ctx = getContext();
  const cells = state.discoveredCells.value as GameMapCell[]; // typescript issue because of toRefs ? it says cell is Coordinates
  cells.forEach(cell => {
    ctx.fillStyle = `hsla(${MAP_HUE}, 45%, ${
      cell.lightness * 100
    }%, ${opacity})`;
    ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
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
};

const drawPlayers = () => {
  const ctx = getContext();
  state.players.value.forEach(player => {
    interpolateEntity<typeof player>(
      { value: player, timestamp: state.timestamp.value },
      {
        value: prevState.playersById.value[player.id],
        timestamp: prevState.timestamp.value
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
};

const applyFogOfWar = (cb: () => void) => {
  const ctx = getContext();
  const player = state.playersById.value[socket.id];
  if (!player) return;

  pushPop(ctx, () => {
    interpolateEntity<typeof player>(
      { value: player, timestamp: state.timestamp.value },
      // prettier-ignore
      { value: prevState.playersById.value[player.id],timestamp: prevState.timestamp.value },
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

const draw = () => {
  const ctx = getContext();

  ctx.clearRect(0, 0, canvasSize, canvasSize);
  pushPop(ctx, () => drawMap({ opacity: 0.2 }));

  applyFogOfWar(() => {
    pushPop(ctx, () => drawMap({ opacity: 1, showCoordinates: true }));
    pushPop(ctx, drawPlayers);
  });
};

const drawLoop = useRafFn(draw, { immediate: false });
useRafFn(updateFps);

const isWindowFocused = useWindowFocus();
watch(isWindowFocused, focused => {
  if (focused) {
    drawLoop.resume();
  } else {
    drawLoop.pause();
  }
});

onMounted(() => {
  drawLoop.resume();
});
</script>

<template>
  <canvas ref="canvasEl" :width="canvasSize" :height="canvasSize" />
  <div>FPS: {{ fps }}</div>
  <div>Seeing {{ players.length }} out of {{ playerCount }} players</div>
</template>

<style scoped>
canvas {
  outline: solid 1px white;
}
</style>
