<script setup lang="ts">
import DebugInfos from '@/components/DebugInfos.vue';
import type { JoinGamePayload, PlayerJob } from '@game/shared-domain';
import type { Nullable } from '@game/shared-utils';
import { useGame } from '@/composables/useGame';
import { socket } from '@/utils/socket';

const router = useRouter();

const gameContainer = ref<HTMLDivElement>();
const minimapContainer = ref<HTMLDivElement>();

const isDisconnectedMessageDisplayed = ref(false);
const isLoading = ref(true);

const loginInfo = useStorage<{
  username: string;
  job: Nullable<PlayerJob>;
}>('login-infos', { username: '', job: null });

if (!loginInfo.value.username || !loginInfo.value.job) {
  router.push('/');
}

const { start, stop } = useGame();

const reconnect = () => {
  isDisconnectedMessageDisplayed.value = false;
  start({
    gameContainer: gameContainer.value!,
    minimapContainer: minimapContainer.value!,
    loginInfo: loginInfo.value as JoinGamePayload
  });
};

onMounted(async () => {
  if (!gameContainer.value || !minimapContainer.value) return;

  await start({
    gameContainer: gameContainer.value,
    minimapContainer: minimapContainer.value,
    loginInfo: loginInfo.value as JoinGamePayload
  });
  isLoading.value = false;

  socket.on('disconnect', () => {
    isDisconnectedMessageDisplayed.value = true;
    stop();
  });
});

onUnmounted(stop);
</script>

<template>
  <div class="wrapper">
    <div class="loader" v-if="isLoading">Loading...</div>
    <div class="error" v-if="isDisconnectedMessageDisplayed">
      <p>You have been disconnected from the server.</p>
      <button @click="reconnect">Reconnect</button>
    </div>

    <div ref="gameContainer" class="game">
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

.loader {
  height: 100%;
  display: grid;
  place-content: center;
  font-size: 2.5rem;
}

.error {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  height: 100%;
  display: grid;
  grid-row-gap: 1em;
  place-content: center;
  z-index: 999;
}

.error button {
  padding: 0.75em 1.5em;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: 0.5rem;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
}

.error button:hover {
  background: var(--color-primary-hover);
}

.error button:focus {
  background: var(--color-primary-focus);
}
.game {
  width: 100vw;
  height: 100%;
  position: relative;
}

.minmap {
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
}
.minimap:deep(canvas) {
  border: solid 1px white;
}
.minimap a {
  float: right;
  margin: 0.5rem;
}
.minimap a:hover {
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
