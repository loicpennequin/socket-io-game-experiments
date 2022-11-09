<script setup lang="ts">
import DebugInfos from '@/components/DebugInfos.vue';
import type { JoinGamePayload, PlayerJob } from '@game/shared-domain';
import type { Nullable } from '@game/shared-utils';
import { useGame } from '@/composables/useGame';

const router = useRouter();

const gameContainer = ref<HTMLDivElement>();
const minimapContainer = ref<HTMLDivElement>();

const loginInfo = useStorage<{
  username: string;
  job: Nullable<PlayerJob>;
}>('login-infos', { username: '', job: null });

if (!loginInfo.value.username || !loginInfo.value.job) {
  router.push('/');
}

const { start, stop } = useGame();

onMounted(() => {
  if (!gameContainer.value || !minimapContainer.value) return;

  start({
    gameContainer: gameContainer.value,
    minimapContainer: minimapContainer.value,
    loginInfo: loginInfo.value as JoinGamePayload
  });
});
onUnmounted(stop);
</script>

<template>
  <div class="wrapper">
    <div ref="gameContainer">
      <DebugInfos />
    </div>
    <div class="minimap">
      <div ref="minimapContainer" />
      <router-link to="/" draggable="false">Quit</router-link>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  user-select: none;
}

.wrapper a {
  -webkit-user-drag: none;
}

.wrapper > div:nth-child(1) {
  width: 100vw;
  height: 100%;
  position: relative;
}

.wrapper > div:nth-child(2) {
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
}
.wrapper > div:nth-child(2):deep(canvas) {
  border: solid 1px white;
}
.wrapper > div:nth-child(2) a {
  float: right;
  margin: 0.5rem;
}
.wrapper > div:nth-child(2) a:hover {
  text-decoration: underline;
}
</style>

<route lang="json">
{
  "path": "/game",
  "name": "Game",
  "meta": {
    "layout": "fullPage"
  }
}
</route>
