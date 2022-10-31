<script setup lang="ts">
const [state] = useGameState();
const { playerCount, players } = state;

const fps = ref(0);
let lastTick = 0;

const updateFps = () => {
  if (lastTick) {
    const delta = (performance.now() - lastTick) / 1000;
    fps.value = Math.round(1 / delta);
  }
  lastTick = performance.now();
};

useRafFn(updateFps);
</script>

<template>
  <div>FPS: {{ fps }}</div>
  <div>Seeing {{ players.length }} out of {{ playerCount }} players</div>
</template>

<style scoped>
canvas {
  outline: solid 1px white;
}
</style>
