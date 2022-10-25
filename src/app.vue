<script setup lang="ts">
import { GAME_GRID_SIZE } from './constants';
import { PLAYER_JOINED } from './events';
import type { GameState } from './modules/socket-io/server/io';

const socket = useSocket();
const gameState = reactive<GameState>({ players: [] });

onMounted(() => {
  socket.on(PLAYER_JOINED, newState => {
    Object.assign(gameState, newState);
  });
});
</script>

<template>
  <main>
    <div class="game-grid">
      <PlayerCell
        v-for="player in gameState.players"
        :key="player.id"
        :player="player"
      >
        {{ player.id }}
      </PlayerCell>
    </div>
  </main>
</template>

<style scoped>
main {
  display: grid;
  place-items: center;
  height: 100vh;
}
.game-grid {
  border: solid 1px white;
  display: grid;
  grid-template-columns: repeat(v-bind(GAME_GRID_SIZE), minmax(0, 1fr));
  grid-template-rows: repeat(v-bind(GAME_GRID_SIZE), minmax(0, 1fr));
  grid-gap: 0.5rem;
  width: 100%;
  height: 100%;
  max-width: 60rem;
  margin-inline: auto;
}

.cell {
  border: solid 1px white;
  aspect-ratio: 1;
}
</style>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background-color: #444;
  font-family: Helvetica;
  color: white;
}
</style>
