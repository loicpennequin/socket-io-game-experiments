<script setup lang="ts">
import humanoidsUrl from '@/assets/sprites.png';
import magicalUrl from '@/assets/sprites2.png';
import { createGameRenderer } from '@/renderers/gameRenderer';
import { socket } from '@/utils/socket';
import type { Renderer } from '@/factories/renderer';
import DebugInfos from './DebugInfos.vue';

const container = ref<HTMLDivElement>();
let gameRenderer: Renderer;

onMounted(() => {
  const el = container.value!;

  const assetPromise = Promise.all(
    [humanoidsUrl, magicalUrl].map(
      url =>
        new Promise<HTMLImageElement>(resolve => {
          const image = new Image();
          image.src = url;
          image.addEventListener('load', () => resolve(image));
        })
    )
  );

  const socketPromise = new Promise<void>(resolve =>
    socket.on('connect', resolve)
  );

  Promise.all([assetPromise, socketPromise]).then(([assets]) => {
    gameRenderer = createGameRenderer({
      id: 'game',
      assets,
      getDimensions: () => {
        const { width, height } = el.getBoundingClientRect();

        return {
          w: width,
          h: height
        };
      }
    });
    el.appendChild(gameRenderer.canvas);
    gameRenderer.start();
  });

  socket.connect();
});

onUnmounted(() => {
  socket.disconnect();
  gameRenderer?.pause();
});
</script>

<template>
  <div ref="container" class="container">
    <DebugInfos />
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
