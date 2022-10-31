<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { GRID_SIZE } from '../constants';
import { drawnCells } from '../utils/renderer';
const { state } = storeToRefs(useGameState());

const fps = ref(0);
const drawnCellsCount = ref(0);
let lastTick = 0;

const updateFps = () => {
  if (lastTick) {
    const delta = (performance.now() - lastTick) / 1000;
    fps.value = Math.round(1 / delta);
  }
  lastTick = performance.now();

  drawnCellsCount.value = [...drawnCells.values()].reduce(
    (total, num) => total + num,
    0
  );
};

useRafFn(updateFps);
</script>

<template>
  <div>FPS: {{ fps }}</div>
  <div>Draw {{ drawnCellsCount }} out of {{ GRID_SIZE ** 2 }}</div>
  <div>
    Seeing {{ state.players.length }} out of {{ state.playerCount }} players
  </div>
</template>

<style scoped>
canvas {
  outline: solid 1px white;
}
</style>
