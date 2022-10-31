<script setup lang="ts">
import { drawNewCells } from '../utils/renderer';
import { MAP_SIZE } from '~/constants';

const canvasEl = ref<HTMLCanvasElement>();
const gameState = useGameState();

const getContext = () => canvasEl.value.getContext('2d');

const draw = () => {
  const ctx = getContext();
  const { state, prevState } = gameState;

  drawNewCells({ ctx, state, prevState });
};

const drawLoop = useRafFn(() => draw(), { immediate: false });
watch(useWindowFocus(), focused =>
  focused ? drawLoop.resume() : drawLoop.pause()
);
onMounted(drawLoop.resume);
</script>

<template>
  <canvas ref="canvasEl" :width="MAP_SIZE" :height="MAP_SIZE" />
</template>
