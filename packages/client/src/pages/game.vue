<script setup lang="ts">
import humanoidsUrl from '@/assets/humanoids.png';
import magicalUrl from '@/assets/magical.png';
import { createGameRenderer } from '@/renderers/gameRenderer';
import { socket } from '@/utils/socket';
import type { Renderer } from '@/factories/renderer';
import DebugInfos from '@/components/DebugInfos.vue';
import {
  JOIN_GAME,
  type JoinGamePayload,
  type PlayerJob
} from '@game/shared-domain';
import type { Nullable } from '@game/shared-utils';
import { useRouter } from 'vue-router';
import type { MapRenderer } from '@/renderers/mapRenderer';

const router = useRouter();

const gameContainer = ref<HTMLDivElement>();
let gameRenderer: Renderer;

const redrawMap = () => {
  const mapRenderer = gameRenderer.children.find(
    r => r.id === 'game:map'
  ) as MapRenderer;

  mapRenderer.redrawMap();
};
const state = useStorage<{
  username: string;
  job: Nullable<PlayerJob>;
}>('login-infos', { username: '', job: null });

if (!state.value.username || !state.value.job) {
  router.push('/');
}

const startGame = () => {
  const el = gameContainer.value!;

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

  const socketPromise = new Promise<void>(resolve => {
    socket.on('connect', () => {
      socket.emit(JOIN_GAME, state.value as JoinGamePayload, () => resolve());
    });
  });

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
};

const stopGame = () => {
  socket.disconnect();
  gameRenderer?.pause();
};

onMounted(startGame);
onUnmounted(stopGame);
</script>

<template>
  <div class="wrapper">
    <div ref="gameContainer">
      <DebugInfos @redraw-map="redrawMap" />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.wrapper > div {
  width: 100vw;
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>
