<script setup lang="ts">
import type { JoinGamePayload, PlayerJob } from '@game/shared-domain';
import type { Nullable } from '@game/shared-utils';
import DebugInfos from '@/ui/components/DebugInfos.vue';
import { useGame } from '@/ui/composables/useGame';
import { socket } from '@/utils/socket';
import Minimap from '../components/Minimap.vue';

const router = useRouter();

const gameContainer = ref<HTMLDivElement>();
const minimapContainer = ref<HTMLDivElement>();

const isDisconnectedModalDisplayed = ref(false);
const isGameOverModalDisplayed = ref(false);

const isLoading = ref(true);

const loginInfo = useStorage<{
  username: string;
  job: Nullable<PlayerJob>;
}>('login-infos', { username: '', job: null });

if (!loginInfo.value.username || !loginInfo.value.job) {
  router.push('/');
}

const { start, stop } = useGame({
  onGameOver: () => {
    isGameOverModalDisplayed.value = true;
  }
});

const reconnect = () => {
  isDisconnectedModalDisplayed.value = false;
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

  socket.on('disconnect', reason => {
    console.log(reason);
    isDisconnectedModalDisplayed.value = true;
    stop();
  });
});

onUnmounted(stop);
</script>

<template>
  <div class="wrapper">
    <div class="loader" v-if="isLoading">Loading...</div>
    <div class="error" v-if="isDisconnectedModalDisplayed">
      <p>You have been disconnected from the server.</p>
      <button @click="reconnect">Reconnect</button>
    </div>
    <transition>
      <div class="game-over" v-if="isGameOverModalDisplayed">
        <div>
          <p>💀You dead boi.💀</p>
          <router-link to="/">Back to home</router-link>
        </div>
      </div>
    </transition>

    <DebugInfos />
    <div ref="gameContainer" class="game" />

    <Minimap class="minimap">
      <div ref="minimapContainer" />
    </Minimap>
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

.game-over {
  position: fixed;
  inset: 0;
  background: hsla(0, 45%, 30%, 0.7);
  height: 100%;
  display: grid;
  grid-row-gap: 1em;
  place-content: center;
  z-index: 999;
}

.game-over > div {
  background-color: var(--color-surface);
  color: var(--color-on-surface);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 40rem;
  max-width: 100%;
}
.game-over p {
  font-size: 3rem;
}
.game-over a {
  display: block;
  margin-inline: auto;
  padding: 0.75em 1.5em;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: 0.5rem;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
}

.game-over.v-enter-active,
.game-over.v-leave-active {
  transition: opacity 0.5s ease;
}

.game-over.v-enter-from,
.game-over.v-leave-to {
  opacity: 0;
}
.game {
  width: 100vw;
  height: 100%;
  position: relative;
}

.minimap {
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
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
