<script setup lang="ts">
import {
  GRID_SIZE,
  CELL_SIZE,
  PLAYER_SIZE,
  PLAYER_FIELD_OF_VIEW
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

const drawGrid = () => {
  const ctx = getContext();
  const { grid, hue } = unref(state.map);

  grid.forEach(row => {
    row.forEach(cell => {
      ctx.fillStyle = `hsl(${hue}, 60%, ${cell.lightness * 100}%)`;
      ctx.fillRect(
        cell.x * CELL_SIZE,
        cell.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );

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
        ctx.fillStyle = '#A66';
        fillCircle(ctx, {
          x: entity.x,
          y: entity.y,
          radius: PLAYER_SIZE / 2
        });
      }
    );
  });
};

const drawFieldOfViewIndicator = () => {
  const ctx = getContext();
  const player = state.playersById.value[socket.id];
  if (!player) return;

  interpolateEntity<typeof player>(
    { value: player, timestamp: state.timestamp.value },
    {
      value: prevState.playersById.value[player.id],
      timestamp: prevState.timestamp.value
    },
    entity => {
      ctx.lineWidth = 0;
      ctx.fillStyle = 'rgb(255,255,255,0.2)';
      fillCircle(ctx, {
        x: entity.x,
        y: entity.y,
        radius: PLAYER_FIELD_OF_VIEW
      });
    }
  );
};

const draw = () => {
  const ctx = getContext();

  ctx.clearRect(0, 0, canvasSize, canvasSize);
  pushPop(ctx, drawGrid);
  pushPop(ctx, drawFieldOfViewIndicator);
  pushPop(ctx, drawPlayers);
};

const drawLoop = useRafFn(draw, { immediate: false });
useRafFn(updateFps);

const isWindowFocused = useWindowFocus();
watch(isWindowFocused, focused => {
  if (focused && state.isReady.value) {
    drawLoop.resume();
  } else {
    drawLoop.pause();
  }
});

onMounted(() => {
  if (state.isReady.value) {
    drawLoop.resume();
  }

  watchOnce(state.isReady, isReady => {
    if (isReady) drawLoop.resume();
  });
});
</script>

<template>
  <canvas ref="canvasEl" :width="canvasSize" :height="canvasSize" />
  <div>FPS: {{ fps }}</div>
  <div>Seeing {{ players.length }} out of {{ playerCount }} players</div>
</template>

<style scoped>
canvas {
  border: solid 1px white;
}
</style>
