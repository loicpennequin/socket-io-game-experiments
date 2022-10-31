<script setup lang="ts">
import { drawMap, drawPlayers, applyFogOfWar } from '../utils/renderer';
import { MAP_SIZE } from '~/constants';

const canvasEl = ref<HTMLCanvasElement>();
const socket = useSocket();
const gamestate = useGameState();

const getContext = () => canvasEl.value.getContext('2d');

const draw = () => {
  const ctx = getContext();
  const { state, prevState } = gamestate;

  ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);

  applyFogOfWar({ ctx, state, prevState, playerId: socket.id }, () => {
    drawMap({ ctx, state, prevState, showCoordinates: true });
    drawPlayers({ ctx, state, prevState });
  });
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
