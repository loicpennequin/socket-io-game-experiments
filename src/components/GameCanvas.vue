<script setup lang="ts">
import { GRID_SIZE, CELL_SIZE, PLAYER_SIZE } from '~/constants';
import { interpolateEntity } from '~~/src/utils/entityInterpolation';

const canvasEl = ref<HTMLCanvasElement>();
const [state, prevState] = useGameState();

const { getContext } = useCanvasProvider(canvasEl);

const canvasSize = GRID_SIZE * CELL_SIZE;
const rowsCount = canvasSize / CELL_SIZE;
const colsCount = rowsCount;

const rows = Array.from({ length: rowsCount })
  .fill(undefined)
  .map((_, rowIndex) =>
    Array.from({ length: colsCount })
      .fill(undefined)
      .map((_, colIndex) => ({
        x: colIndex * CELL_SIZE,
        y: rowIndex * CELL_SIZE
      }))
  );

const fps = ref(0);
let lastTick = 0;

const draw = () => {
  const ctx = getContext();
  if (!ctx) return;

  if (lastTick) {
    const delta = (performance.now() - lastTick) / 1000;
    fps.value = Math.round(1 / delta);
  }
  lastTick = performance.now();

  ctx.clearRect(0, 0, canvasSize, canvasSize);
  ctx.save();
  ctx.strokeStyle = 'rgb(255,255,255,0.2)';
  rows.forEach(row => {
    row.forEach(cell => {
      ctx.strokeRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
    });
  });
  ctx.restore();

  ctx.save();
  state.players.value.forEach(player => {
    interpolateEntity<typeof player>(
      { value: player, timestamp: state.timestamp.value },
      {
        value: prevState.playersById.value[player.id],
        timestamp: prevState.timestamp.value
      },
      entity => {
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, PLAYER_SIZE / 2, 0, 2 * Math.PI, false);
        ctx.lineWidth = 0;
        ctx.fillStyle = '#A66';
        ctx.closePath();
        ctx.fill();
      }
    );
  });
  ctx.restore();
};

const drawLoop = useRafFn(draw, { immediate: false });
onMounted(() => {
  drawLoop.resume();
});
</script>

<template>
  <canvas ref="canvasEl" :width="canvasSize" :height="canvasSize" />
  <div>FPS: {{ fps }}</div>
</template>

<style scoped>
canvas {
  border: solid 1px white;
}
</style>
